# Free Deployment Guide for MedInv

This document explains how to deploy MedInv 100% free of charge using free tiers of Vercel and PlanetScale.

## Free Tier Options

### Vercel (Hobby Plan)
The Hobby plan on Vercel offers:
- Unlimited personal projects
- Automatic HTTPS/SSL
- Globally distributed CDN
- Continuous deployment from Git
- Preview deployments for all Git branches
- Serverless functions (limited to 100 invocations per day for Hobby)
- 100GB bandwidth per month
- No credit card required

### PlanetScale (Free Tier)
The Free tier on PlanetScale offers:
- 1 database
- 5GB storage
- 1 billion row reads per month
- 10 million row writes per month
- Automatic daily backups (retained for 2 days)
- No credit card required

## Limitations to Be Aware Of

When deploying MedInv using free tiers, keep in mind these limitations:

1. **Database Size**: The 5GB storage limit on PlanetScale's free tier means you need to monitor database size, especially if you have many patients or inventory items.

2. **API Call Limits**: Vercel's Hobby plan has limits on serverless function executions, which could affect heavy usage scenarios.

3. **Sleep Mode**: Free tier services can have auto-sleep functionality for inactive projects, causing initial load delay after periods of inactivity.

4. **No Custom Domain**: The Hobby plan on Vercel will give you a URL like `your-app.vercel.app` but custom domains require a paid upgrade.

5. **No Team Collaboration**: Free tiers are for personal use and typically don't support team member access management.

## Maximizing Free Tier Performance

To get the most out of the free tiers:

1. **Optimize Database Queries**: Use efficient queries to minimize row reads/writes.

2. **Implement Caching**: Cache responses where possible to reduce database calls.

3. **Use Static Generation**: Leverage Next.js static generation for pages that don't require real-time data.

4. **Clean Up Old Data**: Regularly archive or remove old, unused data to stay within storage limits.

5. **Monitor Usage**: Keep an eye on your usage metrics in both Vercel and PlanetScale dashboards.

## When to Consider Upgrading

While the free tiers are sufficient for many use cases, consider upgrading if:

1. Your database grows beyond 5GB
2. You need more than 1 database
3. You require custom domains
4. You need team collaboration features
5. You experience performance issues due to tier limitations

Both Vercel and PlanetScale offer reasonably priced paid plans that can accommodate growing needs while still being cost-effective.

## Additional Free Services to Consider

You can extend your MedInv application with these additional free services:

1. **Auth0 (Free Tier)**: For user authentication
2. **Cloudinary (Free Tier)**: For image storage
3. **Sentry (Free Tier)**: For error tracking
4. **GitHub Actions**: For CI/CD workflows
