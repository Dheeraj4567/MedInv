# Vercel Deployment Guide for MedInv

This guide will help you deploy the MedInv application to Vercel and connect it to a PlanetScale MySQL database.

## Prerequisites

1. A [GitHub](https://github.com) account with your MedInv repository pushed to it
2. A [Vercel](https://vercel.com) account 
3. A [PlanetScale](https://planetscale.com) account

## Step 1: Prepare Your Database for Cloud Deployment

There are two methods to get your database ready for cloud deployment:

### Method A: Export your existing local database

If you have been using MedInv locally and want to migrate your existing data:

1. Run the export script:

```bash
npm run export-db
```

2. Follow the prompts to export your schema and data

### Method B: Generate fresh SQL scripts 

If you want to start with a fresh database in the cloud:

1. Run the generate script:

```bash
npm run generate-cloud-sql
```

2. This will create a `cloud-db-setup.sql` file in your project root

## Step 2: Set Up PlanetScale Database (FREE TIER)

1. Sign in to your [PlanetScale](https://planetscale.com) account

2. Create a new database:
   - Click "New Database"
   - Choose a name (e.g., "medinv")
   - Select a region close to your users
   - **IMPORTANT**: Select the "Hobby" (free) plan - this ensures you won't be charged

3. Connect to your database:
   - After creation, go to the "Branches" tab
   - Click on your main branch (usually "main")
   - Click "Connect"
   - Select "Connect with MySQL client"
   - Note the connection string details

4. Import your database schema:
   - Use the MySQL client or PlanetScale console to import the SQL file from Step 1
   - If using the console, copy and paste the schema from your generated SQL file

## Step 3: Configure Environment Variables for Vercel

### Option A: Deploy with PlanetScale Database (Persistent Data)

You'll need these environment variables on Vercel:

- `DEPLOYMENT_MODE=planetscale`
- `DATABASE_URL=mysql://username:password@region.connect.psdb.cloud/database_name?ssl={"rejectUnauthorized":true}`

Make sure to replace the `DATABASE_URL` with your actual PlanetScale connection string.

### Option B: Deploy in Demo Mode (No Database Required)

If you want to quickly deploy a demo version without setting up a database:

1. Set only one environment variable:
   - `DEPLOYMENT_MODE=demo`

2. No other database configuration is needed

3. This will use an in-memory database that resets on page refresh
   - Perfect for demonstrations
   - All changes are temporary
   - No database setup or maintenance required

## Step 4: Deploy to Vercel (FREE TIER)

1. Push your MedInv project to GitHub if you haven't already

2. Sign in to [Vercel](https://vercel.com) (create a free account if you don't have one)

3. Import your repository:
   - Click "Add New..."
   - Select "Project"
   - Choose "Import Git Repository"
   - Select your MedInv repository
   - **IMPORTANT**: The Hobby plan is selected by default - this is the free tier and doesn't require a credit card

4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: Leave as default (/)
   - Build Command: Next.js build
   - Output Directory: .next
   - Install Command: npm ci --legacy-peer-deps

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the variables from Step 3
   - Make sure to set `NODE_ENV=production`

6. Click "Deploy"!

## Step 5: Verify Deployment

1. After deployment completes, Vercel will provide a URL to your application

2. Visit the URL to verify that your application is working correctly

3. Test the key features to ensure database connectivity:
   - Create a patient
   - Add inventory
   - Create orders
   - Check that data persists between page refreshes

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Check your environment variables in the Vercel dashboard
2. Verify that your PlanetScale database is active
3. Ensure your connection string is correctly formatted
4. Check Vercel logs for specific error messages

### Build Errors

If you encounter build errors:

1. Check the Vercel build logs for specific error messages
2. Ensure all dependencies are correctly installed
3. Try adding `--legacy-peer-deps` to the install command if you have dependency conflicts

## Switching Between Deployment Modes

### Switching to Local Development

To switch back to local development after deploying to Vercel:

1. Make sure your `.env.local` file has:
   ```
   DEPLOYMENT_MODE=local
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=test2
   ```

2. Start your local development server:
   ```bash
   npm run dev
   ```

Your application will now use your local MySQL database.

### Switching Between Persistent and Demo Modes on Vercel

You can easily switch your Vercel deployment between persistent database mode and demo mode:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" → "Environment Variables"
3. Update the `DEPLOYMENT_MODE` variable:
   - Set to `planetscale` for persistent database (requires valid `DATABASE_URL`)
   - Set to `demo` for in-memory database that resets on page refresh
4. Click "Save"
5. Redeploy your application for changes to take effect

This allows you to quickly switch between a persistent database for real usage and a demo mode for showcasing the application without risk of data corruption.
