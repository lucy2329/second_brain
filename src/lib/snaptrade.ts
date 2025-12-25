import { Snaptrade } from "snaptrade-typescript-sdk";

if (!process.env.SNAPTRADE_CLIENT_ID || !process.env.SNAPTRADE_CONSUMER_KEY) {
  throw new Error("Missing SnapTrade credentials in environment variables.");
}

export const snaptrade = new Snaptrade({
  clientId: process.env.SNAPTRADE_CLIENT_ID,
  consumerKey: process.env.SNAPTRADE_CONSUMER_KEY,
});

/**
 * Register a new SnapTrade user
 * @param userId The local user ID to register with SnapTrade
 * @returns The SnapTrade user ID and secret
 */
export async function registerSnapTradeUser(userId: string) {
  try {
    const response = await snaptrade.authentication.registerSnapTradeUser({
      userId: userId,
    });
    return response.data; // UserIDandSecret (userId, userSecret)
  } catch (error) {
    console.error("Error registering SnapTrade user:", error);
    throw error;
  }
}

/**
 * Generate a connection portal URL for a SnapTrade user
 * @param snapUserId The SnapTrade user ID
 * @param userSecret The SnapTrade user secret
 * @param redirectUrl Optional URL to redirect back to after connection
 * @returns The connection portal URL
 */
export async function getConnectionPortalUrl(
  snapUserId: string,
  userSecret: string,
  redirectUrl?: string
) {
  try {
    const response = await snaptrade.authentication.loginSnapTradeUser({
      userId: snapUserId,
      userSecret: userSecret,
      darkMode: true,
      customRedirect: redirectUrl,
    });
    // Cast response.data to any or check for redirectURI to bypass union type linting
    const data = response.data as any;
    return data.redirectURI;
  } catch (error) {
    console.error("Error getting SnapTrade login URL:", error);
    throw error;
  }
}

/**
 * Get accounts for a SnapTrade user
 * @param snapUserId The SnapTrade user ID
 * @param userSecret The SnapTrade user secret
 */
export async function getSnapTradeAccounts(snapUserId: string, userSecret: string) {
  try {
    const response = await snaptrade.accountInformation.listUserAccounts({
      userId: snapUserId,
      userSecret: userSecret,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching SnapTrade accounts:", error);
    throw error;
  }
}

/**
 * Get holdings for a SnapTrade user
 * @param snapUserId The SnapTrade user ID
 * @param userSecret The SnapTrade user secret
 */
export async function getSnapTradeHoldings(snapUserId: string, userSecret: string) {
  try {
    const response = await snaptrade.accountInformation.getAllUserHoldings({
      userId: snapUserId,
      userSecret: userSecret,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching SnapTrade holdings:", error);
    throw error;
  }
}

/**
 * Get transactions for a SnapTrade user
 * @param snapUserId The SnapTrade user ID
 * @param userSecret The SnapTrade user secret
 * @param startDate Optional start date for transactions
 * @param endDate Optional end date for transactions
 */
export async function getSnapTradeTransactions(
  snapUserId: string,
  userSecret: string,
  startDate?: string,
  endDate?: string
) {
  try {
    const response = await snaptrade.transactionsAndReporting.getActivities({
      userId: snapUserId,
      userSecret: userSecret,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching SnapTrade transactions:", error);
    throw error;
  }
}
