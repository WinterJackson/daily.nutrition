# Edwak Nutrition — Deployment & CI/CD Pipeline

The application relies on Next.js 15 capabilities, heavily optimizing on Vercel's Edge architecture. 

## Environment Prerequisites

### 1. The Secrets Protocol

Before running `npm run build`, you MUST supply strict environment variables. Without these, Zod schema validation will instantly crash the app at boot to prevent unencrypted operation.

**Critical Boot Variables:**
```ini
POSTGRES_URL="postgresql://..."           # Live database connection
JWT_SECRET="<crypto_string>"              # Exactly 32+ bytes
ENCRYPTION_KEY="<crypto_string>"          # Master AES-256-GCM key. Do not lose this.
```

If `ENCRYPTION_KEY` is lost, accessing any integrated 3rd-party services (Resend, OpenRouter, Calendar, Cloudinary) saved in the Database via the Admin Dashboard becomes permanently impossible.

### 2. Vercel Considerations

The project was explicitly built to deploy seamlessly on Vercel. 
* Next.js utilizes Server Components to ship **Zero JS** to the client for standard markdown parsing.
* Middleware (`src/proxy.ts`) will compile directly to Vercel Edge functions. This requires Edge-compliant libraries (`jose` instead of `jsonwebtoken`).

#### Build Command
```bash
npm run build
```
Vercel handles `next build` natively. Ensure your Environment Variables are mapped to `Production` in the Vercel dashboard.

## Cron Jobs (CRON)

The platform requires automated CRON schedules for checking and grooming. Vercel sets this using the `vercel.json` file.

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 * * * *"
    },
    {
       "path": "/api/cron/trend-scout",
       "schedule": "0 0 * * 1"
    }
  ]
}
```
* **`/api/cron/reminders`**: Checks PostgreSQL for upcoming `Booking` sessions and leverages the Resend API to dispatch customized 24-hour and 1-hour secure meeting links.
* **`/api/cron/trend-scout`**: (Automated) Triggers the Google Gemini pipeline to crawl search logic algorithms and inject high SEO scoring drafts into the `BlogIdea` database table.

## Static Caching & Revalidation

Most public clinic pages are ISR (Incremental Static Regeneration).
* `app/(public)/blog/page.tsx` caches heavily.
* Admin operations like updating a Blog Post or approving a Service feature will instantly fire a unified `revalidatePath("/")` cascading rule on the server side to forcibly flush out Edge caches immediately across worldwide CDNs.
