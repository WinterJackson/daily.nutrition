# Setting up External Cron Jobs (cron-job.org)

The Edwak Nutrition platform requires external automated triggers for background tasks (sending emails, checking payments, clearing expired bookings). Because Vercel's free Hobby plan heavily restricts how often cron jobs can run, we use **cron-job.org** to trigger our secure API endpoints reliably and for free.

## Why are my existing cron jobs failing with an "HTTP error"?

If you see an **"HTTP error"** in the cron-job.org dashboard, it means the job failed because it received a `401 Unauthorized` response from the server. 

**Reason:** By default, anyone on the internet can hit a URL. To prevent malicious attackers from spamming your `/api/cron/*` endpoints and draining your email quotas, the endpoints are protected by a `CRON_SECRET`. The cron-job.org service must explicitly send this secret in an **Authorization Header**. If the header is missing, the API rejects the request instantly with a `401 Unauthorized` error.

---

## Step-by-Step Setup Guide

Follow these exact steps to set up or fix your cron jobs in cron-job.org.

### Step 1: Get your CRON_SECRET
1. Log in to your Vercel Dashboard.
2. Select your project (`edwak-platform`).
3. Go to **Settings** > **Environment Variables**.
4. Find the variable named `CRON_SECRET` and copy its value. *(If it doesn't exist, generate a secure random string, add it as `CRON_SECRET`, and redeploy your app).*

### Step 2: Configure the Job in cron-job.org
1. Log in to [cron-job.org](https://cron-job.org).
2. Go to **Cronjobs** > **Create cronjob** (or click **Edit** on your existing failed job).

#### Basic Details
- **Title:** e.g., `Edwak - Reminders (Every Hour)` or `Edwak - Expire Bookings (Every 10 Mins)`
- **URL:** Paste the full production URL to your API endpoint.
  - *Example 1:* `https://edwak-platform.vercel.app/api/cron/reminders`
  - *Example 2:* `https://edwak-platform.vercel.app/api/cron/expire-bookings`

#### Execution Schedule
- Set the frequency according to the job:
  - **Reminders:** Check `Every 1 Hour`
  - **Expire Bookings:** Check `Every 10 Minutes`

#### The Fix: Setting the Authentication Header
This is the step that fixes the "HTTP error".
1. Scroll down to the **Advanced** section and click to expand it.
2. Check the box for **"Use custom HTTP headers"**.
3. In the new fields that appear, enter the following:
   - **Header:** `Authorization`
   - **Value:** `Bearer YOUR_CRON_SECRET_HERE` 
   *(Note: You MUST include the word "Bearer " followed by a space, then your actual secret).*

Example of the exact Value format: `Bearer 8f3b2a1c9d4e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e`

### Step 3: Save and Test
1. Click **Create** (or **Save**).
2. Find the job in your list, click the **Options** dropdown (or the small play button icon), and click **Test run**.
3. Wait a few seconds and check the **Last Events** or **Execution History**. The status should now say **"Success (HTTP 200)"**.

---

## Available Cron Endpoints in the Codebase

Here are the endpoints you should set up in cron-job.org to ensure the platform functions flawlessly:

| Job Title | URL Path | Recommended Schedule | Purpose |
|---|---|---|---|
| **Booking Reminders** | `/api/cron/reminders` | Every 1 Hour | Sends 24-hour and 1-hour automated emails to clients. Sends 30-min and 15-min alerts to admins. |
| **Expire Bookings** | `/api/cron/expire-bookings` | Every 10 Minutes | Clears unpaid pending bookings past 45 mins, freeing calendar slots. |
| **Trend Scout** | `/api/cron/trend-scout` | Once a Week (e.g., Monday 3 AM) | Triggers the Gemini AI engine to research trends and draft blog ideas. |
