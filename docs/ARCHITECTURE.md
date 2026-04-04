# Edwak Nutrition — System Architecture

This document provides a deep-dive into the architectural design of the Edwak Nutrition platform, built entirely using the Next.js App Router paradigm.

## 1. High-Level Concept

The platform operates as a dual-pane application:
1. **The Public Clinic:** Server-side rendered pages optimized for extreme SEO compliance. Users can browse services, read AI-generated markdown blog posts, and book appointments via a multi-step dynamic funnel.
2. **The Administrative Dashboard** (`/admin`): A highly protected, edge-middleware gated control room. Admins can configure settings, manage the blog CMS, approve testimonials, and assign incoming inquiries to authorized staff.

## 2. Request Lifecycle & Routing Paradigm

Because the platform relies on **Next.js 15+ App Router**, it avoids traditional `pages/api` wrappers for mutations, preferring **Server Actions** (`src/app/actions/*`).

### 2.1 The Edge Middleware (`proxy.ts`)
The entire `/admin/*` sub-tree is protected by a lightweight Edge Middleware (`proxy.ts` acting through Next.js middleware conventions).
* It intercepts the request before it boots the Node.js runtime.
* It verifies the presence of an `__Host-session` or standard `session_token` cookie.
* It offloads minimal signature verification to the `jose` crypto library because basic `jsonwebtoken` is incompatible with the Vercel Edge Runtime.

### 2.2 Server Actions
Once inside the application, UI mutations (e.g., publishing a blog post, updating a booking) trigger Server Actions.
* **Separation of Concerns:** Actions reside in `src/app/actions/`. For example, `src/app/actions/booking-management.ts` handles all booking states.
* **Double Validation:** Every restricted action calls `verifySession()` from `src/lib/auth.ts`, ensuring that even if a JWT is valid, the actual database session hasn't been revoked.

## 3. Data Flow & ORM Strategy

The platform uses **Prisma** synced to a **PostgreSQL** database.

* **Connection Pooling:** We rely on Prisma's internal connection management, utilizing `DATABASE_URL`.
* **State Syncing:** Server Actions aggressively use Next.js' `revalidatePath("/admin/...")` to clear the Router Cache immediately upon mutation. This creates a highly responsive, optimistic-like UI without writing massive Redux/Context boilerplate.

## 4. Key Sub-Systems

### 4.1 The CMS (Content Management System)
* Instead of relying on a headless CMS (Sanity / Contentful), Edwak uses an embedded PostgreSQL model.
* Posts are stored as raw Markdown.
* On the client side, `react-markdown` pairs with `remark-gfm` to strictly render GitHub-Flavored Markdown.

### 4.2 The AI TrendScout Strategy
* Integrated via `@google/generative-ai`, the `TrendScout` scans for relevant query terms.
* The backend generates prompts ensuring the response maps directly to the `Zod` validation schema expected by the frontend.

### 4.3 The Booking Funnel
* **Stateless Multi-step:** The booking form uses URL Search Parameters (e.g., `?step=2&service=general`) rather than heavy client-side React State. This allows deep-linking and reduces memory overhead.
* **Google Calendar Synchronization:** Scheduled tasks interface with the Google Calendar API via `googleapis` using Service Account credentials dynamically decrypted from the database.
