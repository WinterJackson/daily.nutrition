# Edwak Nutrition — Database Schema

The platform leverages [Prisma ORM](https://prisma.io) over a heavily normalized [PostgreSQL](https://postgresql.org) database. The schema is engineered to scale vertically, keeping relations strictly constrained while allowing for rapid server-side mutation.

## Core Schema Domains

The data model is broken down into five primary operational domains.

### 1. Identity & Access Management (IAM)
Manages Edge-compatible auth states and session persistence.
* `User`: Staff and Administrators. Contains RBAC field (`role`) and Zero-Trust metrics like `lastActiveAt`, `twoFactorEnabled`, and bcrypt hashes.
* `Session`: Validates stateless Edge checks by proving database-layer session reality. Each contains device fingerprinting columns (`userAgent`, `ipAddress`).
* `StaffInvitation`: Core part of the secure onboarding loop. Uses cryptographically random strings mapped to expiration windows enforcing the platform's non-public registration policy.

### 2. Clinical Bookings Pipeline
Handles the lifecycle of client appointments and platform monetization.
* `Service`: The literal product being sold (e.g., General Consultation vs Oncology Support). Retains pricing metadata, dynamic features, Cloudinary image linking, and toggles for display ordering.
* `Booking`: The master ledger of a scheduled appointment.
  * Tracks `BookingType` (Virtual vs In-Person).
  * Enforces `status` parameters (PENDING, CONFIRMED, COMPLETED, NO_SHOW).
  * Stores Google Meet encrypted URLs directly via the automated Calendar Service.
* `BlockedDate`: Hardcoded prevention of bookings on specific days via the Settings Dashboard.

### 3. Artificial Intelligence & Content Engine (CMS)
Powers the automated blogging capabilities to maintain massive Google SEO dominance.
* `BlogIdea`: The genesis of a post. Interacts with the `TrendScout` API engine to record topic scores, keywords, and AI reasoning.
* `BlogPost`: The generated or manually drafted post. Supports markdown formatted `content` and explicit SEO meta tags mapping to Next.js metadata.
* `BlogCategory`: Taxonomic grouping structure (e.g., "Gut Health", "Diabetes").

### 4. Patient CRM (Inquiries)
An internal lead-generation and contact pipeline.
* `Inquiry`: Securely stores data from the `/contact` form securely behind rate limits. Records timestamps, IP traces, and parsed User-Agents for spam detection.
* `InquiryNote`: Internal staff-only denormalized message tracking for particular clients.
* `InquiryReply`: Outgoing email tracking explicitly tied to a lead.

### 5. Global Settings & Encryption Mapping
Stores non-volatile configurable state directly out of developer hands via the `/admin/settings` panel.
* `SiteSettings`: A singleton model (`id="default"`) storing business logic, lat/long for Google Maps routing, dynamic metadata, and brand configurations.
* `CloudinaryConfig` & `ResendConfig`: 1-to-1 strict relations extending `SiteSettings` utilizing `encryptedApiSecret` mappings. The frontend cannot query the raw keys; they are algorithmically un-encrypted in volatile Node.js memory just-in-time per request.

## Database Migrations

Never modify the raw SQL database. Edwak Nutrition operates strictly on Prisma Migrations.
1. Modify `prisma/schema.prisma`.
2. Format layout: `npx prisma format`
3. Generate diff: `npx prisma migrate dev --name <description>`
4. Prisma automatically outputs SQL safely ensuring zero-downtime execution.
