# Database Setup Instructions

## Option 1: Using Supabase (Recommended for MVP)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be provisioned

2. **Enable pgvector Extension**
   - In Supabase dashboard, go to Database → Extensions
   - Search for "vector" and enable the `pgvector` extension

3. **Get Your Credentials**
   - Go to Project Settings → Database
   - Copy the connection string (URI format)
   - Go to Project Settings → API
   - Copy the Project URL and anon/public key

4. **Update Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your credentials:
   ```env
   DATABASE_URL="your-supabase-connection-string"
   NEXT_PUBLIC_SUPABASE_URL="your-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   OPENAI_API_KEY="your-openai-api-key"
   ```

5. **Run Migrations**
   ```bash
   npx prisma db push
   ```

## Option 2: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed)
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Install pgvector Extension**
   ```bash
   brew install pgvector
   ```

3. **Create Database**
   ```bash
   createdb second_brain
   psql second_brain -c 'CREATE EXTENSION vector;'
   ```

4. **Update .env**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/second_brain"
   ```

5. **Run Migrations**
   ```bash
   npx prisma db push
   ```

## Verify Setup

```bash
# Generate Prisma Client
npx prisma generate

# Open Prisma Studio to view your database
npx prisma studio
```

## Next Steps

Once the database is set up, you can:
- Run migrations with `npx prisma db push`
- View data with `npx prisma studio`
- Start building the API routes
