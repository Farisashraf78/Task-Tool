This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Live Demo
**Your Tool is Live Here:** [https://talabat-task-tool-ryev.vercel.app](https://talabat-task-tool-ryev.vercel.app)

**Database Dashboard:** [https://supabase.com/dashboard/project/_](https://supabase.com/dashboard/project/_)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚀 Deployment Guide (Get your Shareable Link)

### ONE-CLICK DEPLOY (Recommended)
This button will create the project on Vercel and set up the database for you.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFarisashraf78%2FTask-Tool&env=DATABASE_URL&project-name=talabat-task-tool&repository-name=talabat-task-tool)

### Steps to Deploy:
1. **Click the "Deploy" button** above.
2. Sign in with GitHub if asked.
3. In the Vercel project setup page:
   - **Click "Install"** for Vercel interactions if prompted.
   - Look for the **Storage** or **Database** section (might happen after the first step or you can add it manually in the dashboard).
   - Select **Vercel Postgres** (it's free).
   - Click **Connect** or **Create**.
4. Vercel will automatically add the `DATABASE_URL` environment variable for you.
5. Click **Deploy**.

Once deployment is complete, Vercel will give you a link like `https://talabat-task-tool.vercel.app`. **Share this link with your team.**

### Note on Database
The project is configured to simpler setup:
- It uses **Vercel Postgres** (Cloud Database).
- The `build` command is set to automatically update the database schema so you don't need to run manual commands.
