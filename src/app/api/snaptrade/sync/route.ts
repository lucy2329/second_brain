import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser, AuthenticationError } from "@/lib/auth";
import { getSnapTradeAccounts, getSnapTradeHoldings, getSnapTradeTransactions } from "@/lib/snaptrade";
import { AccountType, TransactionType } from "@prisma/client";

export async function POST() {
  try {
    const userId = await getAuthenticatedUser();

    const snapUser = await prisma.snapTradeUser.findUnique({
      where: { userId },
    });

    if (!snapUser) {
      return NextResponse.json(
        { error: "SnapTrade user not registered" },
        { status: 404 }
      );
    }

    // 1. Fetch data from SnapTrade
    console.log("[SnapTrade Sync] Starting fetch for user:", userId);
    const [accounts, holdings, activities] = await Promise.all([
      getSnapTradeAccounts(snapUser.snapUserId, snapUser.userSecret),
      getSnapTradeHoldings(snapUser.snapUserId, snapUser.userSecret),
      getSnapTradeTransactions(snapUser.snapUserId, snapUser.userSecret),
    ]);

    console.log(`[SnapTrade Sync] Received: ${accounts.length} accounts, ${holdings.length} holdings records, ${activities?.length || 0} activities`);
    if (accounts.length > 0) {
      console.log("[SnapTrade Sync] Sample Account Structure:", JSON.stringify(accounts[0], null, 2));
    }
    if (holdings.length > 0) {
      console.log("[SnapTrade Sync] Sample Holding Record Structure:", JSON.stringify(holdings[0], null, 2));
    }

    // 2. Sync Accounts
    // ... (rest of account sync logic remains same, but I'll ensure I don't break it)
    const syncResults = await Promise.all(
      accounts.map(async (snapAccount: any) => {
        // Handle both 'balance' (singular) and 'balances' (plural) from SnapTrade
        // Prioritize 'total_value' as the user wants to see "Portfolio value"
        let balance = 0;
        if (typeof snapAccount.total_value?.value === 'number') {
          balance = snapAccount.total_value.value;
        } else if (typeof snapAccount.balance?.total?.amount === 'number') {
          balance = snapAccount.balance.total.amount;
        } else if (typeof snapAccount.balances?.total?.amount === 'number') {
          balance = snapAccount.balances.total.amount;
        } else if (Array.isArray(snapAccount.balances) && snapAccount.balances.length > 0) {
          balance = snapAccount.balances[0].amount || snapAccount.balances[0].cash || 0;
        }
        
        const fullName = snapAccount.name || snapAccount.number || "Unnamed Account";
        // Shorten name as requested (first word)
        const name = fullName;
        const institution = snapAccount.institution_name || snapAccount.brokerage?.name || "Unknown Institution";
        
        let type: AccountType = "BROKERAGE";
        const snapType = (snapAccount.type || "").toUpperCase();
        
        if (snapType.includes("CHECKING")) type = "CHECKING";
        else if (snapType.includes("SAVINGS")) type = "SAVINGS";
        else if (snapType.includes("CREDIT")) type = "CREDIT_CARD";
        else if (snapType.includes("CRYPTO")) type = "CRYPTO";
        else if (snapType.includes("RETIREMENT") || snapType.includes("IRA")) type = "RETIREMENT";

        console.log(`[SnapTrade Sync] Upserting account: ${name} (${snapAccount.id})`);
        return prisma.account.upsert({
          where: { snapTradeId: snapAccount.id },
          update: {
            name,
            balance,
            institution,
            type,
            updatedAt: new Date(),
          },
          create: {
            userId,
            snapTradeId: snapAccount.id,
            name,
            balance,
            institution,
            type,
            isSnapTrade: true,
            currency: snapAccount.balances?.total?.currency || "USD",
          },
        });
      })
    );

    const snapAccountIds = accounts.map((a: any) => a.id);
    const dbAccounts = await prisma.account.findMany({
      where: { snapTradeId: { in: snapAccountIds } },
      select: { id: true, snapTradeId: true }
    });
    const snapIdToDbId = new Map(dbAccounts.map(a => [a.snapTradeId, a.id]));

    // 3. Sync Positions
    console.log("[SnapTrade Sync] Syncing positions...");
    await prisma.position.deleteMany({
      where: { accountId: { in: Array.from(snapIdToDbId.values()) } }
    });

    const positionGroups = holdings.map((accountHoldings: any) => {
      const dbAccountId = snapIdToDbId.get(accountHoldings.account?.id);
      if (!dbAccountId) {
        console.warn(`[SnapTrade Sync] Skipping holdings for unknown account: ${accountHoldings.account?.id}`);
        return { stocks: [], options: [] };
      }

      // SnapTrade SDK uses 'positions' for stocks/ETFs and 'option_positions' for options
      const accountLevelPositions = accountHoldings.positions || [];
      const accountLevelOptions = accountHoldings.option_positions || [];
      
      console.log(`[SnapTrade Sync] Account ${accountHoldings.account?.id}: Found ${accountLevelPositions.length} positions and ${accountLevelOptions.length} options`);

      const stocks = accountLevelPositions.map((p: any) => ({
        accountId: dbAccountId,
        symbol: p.symbol?.symbol?.symbol || p.symbol?.symbol || "UNKNOWN",
        name: p.symbol?.symbol?.description || p.symbol?.description || p.symbol?.symbol || "Unknown Asset",
        quantity: typeof p.units === 'number' ? p.units : 0,
        costBasis: typeof p.average_purchase_price === 'number' ? p.average_purchase_price : 0,
        currentPrice: typeof p.price === 'number' ? p.price : 0,
        currency: p.currency?.code || p.symbol?.symbol?.currency?.code || "USD",
        lastUpdated: new Date(),
      }));

      const options = accountLevelOptions.map((o: any) => ({
        accountId: dbAccountId,
        symbol: o.symbol?.option_symbol?.ticker || "OPTION",
        name: o.symbol?.description || o.symbol?.option_symbol?.ticker || "Option Contract",
        quantity: typeof o.units === 'number' ? o.units : 0,
        // Keeping /100 as per user request
        costBasis: typeof o.average_purchase_price === 'number' ? o.average_purchase_price / 100 : 0,
        currentPrice: typeof o.price === 'number' ? o.price : 0,
        currency: o.currency?.code || "USD",
        lastUpdated: new Date(),
      }));

      return { stocks, options };
    });

    const positionsToCreate = positionGroups.flatMap(group => [...group.stocks, ...group.options]);

    if (positionsToCreate.length > 0) {
      console.log(`[SnapTrade Sync] Creating ${positionsToCreate.length} total positions`);
      await prisma.position.createMany({
        data: positionsToCreate,
      });
    }

    // 4. Sync Transactions
    console.log("[SnapTrade Sync] Syncing transactions...");
    let transactionsSynced = 0;
    if (activities && Array.isArray(activities)) {
      const transactionSyncs = activities.map(async (activity: any) => {
        // Validation: Must have a unique ID for upsert
        if (!activity.id) {
          console.warn("[SnapTrade Sync] Skipping activity without ID");
          return null;
        }

        const snapAccId = (activity.account?.id || activity.account) as string;
        if (!snapAccId) {
          console.warn("[SnapTrade Sync] Skipping activity with no account info");
          return null;
        }

        const dbAccountId = snapIdToDbId.get(snapAccId);
        if (!dbAccountId) {
          console.warn(`[SnapTrade Sync] Skipping activity for unknown account: ${snapAccId}`);
          return null;
        }

        let type = "INCOME";
        const snapType = (activity.type || "").toUpperCase();
        const amount = typeof activity.amount === 'number' ? Math.abs(activity.amount) : 0;

        if (snapType.includes("BUY") || snapType.includes("WITHDRAWAL") || snapType.includes("FEE") || (typeof activity.amount === 'number' && activity.amount < 0)) {
          type = "EXPENSE";
        }

        const dateStr = activity.trade_date || activity.date || activity.settlement_date;
        let date = dateStr ? new Date(dateStr) : new Date();
        if (isNaN(date.getTime())) {
          date = new Date();
        }

        try {
          return await (prisma.transaction as any).upsert({
            where: { snapTradeId: activity.id },
            update: {
              amount,
              description: activity.description || activity.type || "Transaction",
              date,
              accountId: dbAccountId,
            },
            create: {
              userId,
              accountId: dbAccountId,
              snapTradeId: activity.id,
              amount,
              description: activity.description || activity.type || "Transaction",
              date,
              type,
              category: "Investments",
            },
          });
        } catch (err) {
          console.error(`[SnapTrade Sync] Failed to upsert transaction ${activity.id}:`, err);
          return null;
        }
      });
      
      const results = await Promise.all(transactionSyncs);
      transactionsSynced = results.filter(Boolean).length;
    }

    console.log("[SnapTrade Sync] Sync completed successfully");
    return NextResponse.json({
      success: true,
      accountsSynced: syncResults.length,
      positionsSynced: positionsToCreate.length,
      transactionsSynced,
    });
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[SnapTrade Sync Error] Full error details:");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Meta:", JSON.stringify(error.meta, null, 2));
    console.error("Stack:", error.stack);
    
    return NextResponse.json(
      { error: "Failed to sync SnapTrade data", details: error.message },
      { status: 500 }
    );
  }
}
