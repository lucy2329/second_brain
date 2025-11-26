# Supabase Auth Setup Guide: Google Integration

This guide outlines the steps to enable Google Authentication in your Supabase project for the Second Brain application.

## Prerequisites

- A Supabase project created.
- A Google Cloud Platform (GCP) account.

## Step 1: Google Cloud Console Setup

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., "Second Brain Auth").
3.  Navigate to **APIs & Services > OAuth consent screen**.
    - Select **External** (unless you are in a G-Suite organization).
    - Fill in the required app information (App name, User support email, Developer contact information).
    - Click **Save and Continue**.
4.  Navigate to **APIs & Services > Credentials**.
5.  Click **Create Credentials** and select **OAuth client ID**.
6.  Select **Web application** as the Application type.
7.  Name it (e.g., "Supabase Auth").
8.  **Authorized JavaScript origins**:
    - Add your local development URL: `http://localhost:3000`
    - Add your production URL (if you have one).
9.  **Authorized redirect URIs**:
    - You need your Supabase Project URL for this. Go to your Supabase Dashboard > Settings > API.
    - Copy the **URL** (e.g., `https://your-project-id.supabase.co`).
    - Add `https://your-project-id.supabase.co/auth/v1/callback` to the redirect URIs.
10. Click **Create**.
11. Copy the **Client ID** and **Client Secret**. You will need these for the next step.

## Step 2: Supabase Dashboard Configuration

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project.
3.  Navigate to **Authentication > Providers**.
4.  Find **Google** in the list and click to expand/enable it.
5.  Toggle **Enable Google** to ON.
6.  Paste the **Client ID** and **Client Secret** from the Google Cloud Console.
7.  Click **Save**.

## Step 3: Next.js Environment Variables

Ensure your `.env` (or `.env.local`) file in the Next.js project has the correct Supabase credentials. You should already have these, but verify:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Implementation (Reference)

The application uses the Supabase Auth Helpers for Next.js. The login flow typically involves:

1.  Calling `supabase.auth.signInWithOAuth({ provider: 'google' })`.
2.  Supabase redirects to Google.
3.  Google redirects back to your callback URL.
4.  Supabase handles the session creation.

*Note: The actual login page implementation will be the next step in development.*
