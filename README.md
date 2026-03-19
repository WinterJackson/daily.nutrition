<div align="center">
  <img src="public/logo.jpg" alt="Edwak Nutrition Logo" width="220" />
  <h1>E D W A K &nbsp; N U T R I T I O N</h1>
  <p><strong>Professional Clinical Nutrition & Wellness Platform</strong></p>
  
  <p>
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    </a>
     <a href="https://www.prisma.io/">
      <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
    </a>
    <a href="https://resend.com/">
      <img src="https://img.shields.io/badge/Resend-API-red?style=for-the-badge&logo=minutemailer" alt="Resend" />
    </a>
  </p>

  <p>
    <a href="#-overview">Overview</a> •
    <a href="#-features">Features</a> •
    <a href="#-technical-architecture">Architecture</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a>
  </p>
</div>

<br />

## 🚀 Overview

**Edwak Nutrition** is a premium, high-performance web platform designed specifically for modern clinical nutrition consultancies. It seamlessly integrates a public-facing digital clinic with an extremely robust, completely bespoke administrative dashboard.

Built entirely on the **React/Next.js App Router** paradigm, the platform utilizes Server Actions, Edge Middleware, and an advanced **AI-powered content CMS**, prioritizing enterprise-grade security, lightning-fast performance, and immaculate SEO compliance out-of-the-box.

---

## ✨ Features

### 🎨 **Public Clinic Interface & Brand Aesthetics**
*   **Immersive UI/UX**: Clean, nature-inspired palette (Olive, Orange, Gold) meticulously tailored for healthcare and wellness trust.
*   **Dynamic Client Services**: Custom routing for distinct nutritional services (Oncology, Diabetes, General Wellness) featuring dynamic pricing (Virtual vs. In-Person parameters).
*   **Smart Booking Pipeline**: Multi-step booking flow generating direct contact channels, seamlessly integrated with PostgreSQL.
*   **Full SEO Optimization**: Server-side rendered pages with dynamically generated OpenGraph schemas, synchronized Title Templates, meta tags, and an active `sitemap.ts`.
*   **Social Proof Engine**: Dynamic client testimonial rendering engine that surfaces approved reviews on the home interface.

### 🛡️ **Advanced Administrator Dashboard**
*   **Service & Media Operations**: Full CRUD suite for Services, managing visibility toggles, image galleries (via Cloudinary), and optimistic locking to prevent overlapping admin modifications.
*   **Testimonial Custodian**: Administrative oversight pipeline to review, approve/reject, and star-rate client testimonials.
*   **Platform Settings & Footer Dynamics**: Live-update control room for global business credentials, social URLs (dynamically omitting empty inputs & adopting new icons like X), and address data.

### 🤖 **AI Blog CMS (Content Engine)**
*   **TrendScout API Engine**: Embedded Google Gemini integrations identifying high-value nutrition and wellness topics, actively scoring them across Relevance, SEO, Authority, Novelty, and Clarity.
*   **Automated Drafting Pipeline**: 1-click generation of fully-formatted markdown blog posts sourced from approved ideas.
*   **Brand Voice Enforcement**: Advanced AI prompt exclusions & constraint logic ensuring drafted content strictly aligns with Edwak Nutrition's clinical tone.
*   **Markdown Publishing**: Custom implementations via `react-markdown` ensuring rich text formatting, GitHub Flavored Markdown (GFM), and programmatic read-time estimations.

### 🔒 **Enterprise-Grade Security Architecture**
*   **Edge-Compatible Dual-Check Auth**: A completely bespoke authentication system bypassing heavy libraries in favor of rapid JWT (`jose`) checks at the Vercel Edge (`proxy.ts`), backed by full database validation inside Next.js Server Actions.
*   **Dependency-Free Rate Limiting**: In-memory sliding window rate limiters systematically protecting the application against brute-force (login/booking/API) routes, achieving 0-cost overhead (No Redis required).
*   **AES-256-GCM Encryption**: Highly sensitive configuration primitives are strictly validated via Zod schemas and algorithmically encrypted before they touch the database.

---

## 🏗️ Technical Architecture

### 📂 Project Structure

```bash
EdwakNutrition/
├── src/
│   ├── app/                    # Next.js App Router Core
│   │   ├── (public)/           # Server-rendered user-facing routes
│   │   ├── admin/              # Edge-protected restricted dashboard
│   │   ├── api/                # Internal API hooks and stateless handlers
│   │   └── actions/            # Encapsulated Next.js Server Actions
│   ├── components/             # Reusable UI & Logical blocks
│   │   ├── admin/              # Restricted dashboard modules
│   │   ├── layout/             # Universal headers, footers & wrappers
│   │   ├── services/           # Dynamic pricing and booking cards
│   │   └── ui/                 # Atomic design tokens (shadcn/ui inspired)
│   ├── lib/                    # Engine code & core utilities
│   │   ├── ai/                 # Gemini controllers, prompts, and scorecards
│   │   ├── auth.ts             # Stateful/Stateless auth system
│   │   ├── encryption.ts       # AES-256-GCM cryptography module
│   │   ├── rate-limit.ts       # Sliding window protection algorithms
│   │   └── prisma.ts           # Centralized DB client instance
│   └── proxy.ts                # Primary Edge routing middleware
├── prisma/                 # Database schema (.prisma) & seeders
├── public/                 # Static media (Images, Favicons)
└── next.config.ts          # Turbopack and optimization config
```

---

## 💻 Tech Stack Depth

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js (App Router)](https://nextjs.org/) | Core Engine, SSR, Edge APIs |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict static typing and code reliability |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Rapid, scoped atomic CSS architecture |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Primary high-relational data storage |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe synchronous queries and migrations |
| **AI Processing** | [Google Gemini](https://ai.google.dev/) | Market research (TrendScout) & Content Generation |
| **Security** | [Jose](https://github.com/panva/jose) | Edge JWT encoding/decoding compliance |
| **Validation** | [Zod](https://zod.dev/) | Strict API payload protection |
| **Email Services**| [Resend](https://resend.com/) | Transactional automated email logic |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Cinematic load sequences and component transitions |

---

## 🚀 Getting Started

### Prerequisites
*   **Runtime:** Node.js 18+ (Node 20+ Recommended)
*   **Package Manager:** `npm` or `yarn`
*   **Database:** A working PostgreSQL Instance (Local Docker or Cloud e.g., Supabase/Neon)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/WinterJackson/daily.nutrition.git
    cd daily.nutrition
    ```

2.  **Install Application Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variable Injection**
    Create a `.env` file referencing the structure of `.env.example`.
    ```env
    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/edwak?schema=public"
    
    # Security Essentials
    JWT_SECRET="<generate_secure_64_char_key>"
    ENCRYPTION_KEY="<generate_secure_32_byte_aes_key>"
    
    # 3rd Party Integrations
    RESEND_API_KEY="..."
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
    ```

4.  **Database Migration & Generation**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Initialize Development Server**
    ```bash
    npm run dev
    ```
    Access the public clinic at [http://localhost:3000](http://localhost:3000).
    Access the protected control panel at `/admin/login`.

---

## 📜 Legal & License

This project is a deeply customized, proprietary software solution explicitly developed for the **Edwak Nutrition** brand. 

*   **Copyright**: © 2026 Edwak Nutrition. All rights reserved.
*   **Usage constraints**: Source code modifications require proper authorization from the repository owner.

---

<div align="center">
  <sub>Built with exacting precision for clinical accuracy, digital wellness, and uncompromised security.</sub>
</div>
