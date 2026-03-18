<div align="center">
  <img src="public/admin-logo.png" alt="Daily Nutrition Logo" width="160" />
  <h1>D A I L Y &nbsp; N U T R I T I O N</h1>
  <p><strong>Premium Health & Wellness Platform</strong></p>
  
  <p>
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
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
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-project-structure">Structure</a> •
    <a href="#-legal-compliance">Legal & Privacy</a>
  </p>
</div>

<br />

## 🚀 Overview

**Daily Nutrition** is a premium, high-performance web platform designed for a modern health and wellness consultancy. It seamlessly integrates client bookings, automated inquiries, client testimonials, and an **AI-powered content engine** into an immersive user experience.

The platform is strictly built with a focus on **enterprise-grade security, aesthetics, and performance**. It features robust custom authentication, resilient in-memory sliding window rate limiting, and an advanced AI backend powered by Google Gemini, designed to automate content creation while maintaining a distinct brand voice.

---

## ✨ Features

### 🎨 **Immersive UI/UX & Brand Aesthetics**
*   **Modern Premium Identity**: Clean, nature-inspired palette (Olive, Orange, Gold) tailored for wellness.
*   **Dynamic Interactions**: Framer Motion powered smooth transitions, hover states, and staggered reveals.
*   **Responsive Dashboard**: A highly polished administrative dashboard with glassmorphism, collapsed sidebars, and dark/light mode toggles.

### 🤖 **AI Blog Assistant & Content Engine**
*   **TrendScout API**: Automatically identifies high-value nutrition and wellness topics integrating Gemini AI, scoring them across Relevance, SEO, Authority, Novelty, and Clarity.
*   **Automated Drafting**: 1-click generation of fully-formatted markdown blog posts from approved ideas.
*   **Brand Voice Enforcement**: Auto-suggest exclusions and customizable writing styles to align AI outputs with the Daily Nutrition brand.
*   **Rich Text Rendering**: Custom `react-markdown` implementations supporting tables, GFM, responsive image alignment, and synchronized Read Time calculations.

### 🛡️ **Enterprise-Grade Security Architecture**
*   **Dual-Check Auth System**: NextAuth bypassed in favor of a highly controlled, dual-check JWT + database session protocol powered by `jose` (Edge Compatible) and `bcrypt`.
*   **In-Memory Sliding Window Rate Limiting**: Completely dependency-free (0 Upstash/Redis cost) granular rate limiters protecting logins, bookings, inquiries, and API routes.
*   **AES-256-GCM Encryption**: Dynamic configuration secrets (Gemini API keys, Cloudinary Secrets) are strictly validated via Zod at boot and securely encrypted before touching the `SecretConfig` table.
*   **Anti-Enumeration & Instant Revoke**: Security headers enforced at the middleware edge `proxy.ts`, generic auth errors, and centralized instantaneous session revocation.

### 🗓️ **Client & Service Management**
*   **Booking System Integration**: Webhook-ready database syncs for seamless internal processing of virtual and in-person consultations.
*   **Testimonial Engine**: Streamlined submission, approval, and publication workflows to build social proof.
*   **Inquiry Desk**: Robust contact form handlers routing directly to administrative queues and email servers securely.

---

## 💻 Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) | App Router, Server Actions, Edge Middleware |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Static typing for enterprise-level code |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework with custom design tokens |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational database mapping |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe database client and migrations |
| **AI Integration**| [Google Gemini](https://ai.google.dev/) | Generative AI for TrendScout and Blog Drafting |
| **Security** | [Jose](https://github.com/panva/jose) | Edge-compatible secure JWT authentication |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) | Declarative animations and UI transitions |
| **Icons** | [Lucide React](https://lucide.dev/) | Minimalist and cohesive icon library |
| **Validation** | [Zod](https://zod.dev/) | Strict runtime data validation and boot-time checks |

---

## 📂 Project Structure

```bash
DailyNutrition/
├── app/                    # Next.js App Router structure
│   ├── (public)/           # Public-facing web pages (Blog, Services)
│   ├── admin/              # Secure administrative interface
│   ├── api/                # Internal API Routes & Webhooks
│   └── actions/            # Encapsulated Server Actions
├── components/             # Reusable React components
│   ├── admin/              # Admin-specific UI elements
│   ├── layout/             # Navigation, headers, footers
│   └── ui/                 # Atomic UI components, cards, buttons
├── lib/                    # Engine code & core utilities
│   ├── ai/                 # Gemini handlers, prompts, logic scoring
│   ├── auth.ts             # Stateful/Stateless auth system
│   ├── encryption.ts       # AES-256-GCM cryptography module
│   ├── rate-limit.ts       # Sliding window protection handlers
│   └── prisma.ts           # Database client instance
├── prisma/                 # Database schema and seed scripts
├── public/                 # Static media (Images, Logos)
└── proxy.ts                # Primary Edge routing middleware
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   npm or yarn
*   PostgreSQL Database (Local or Cloud)
*   Google Gemini API Key (Stored inside system config post-install)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YourOrganization/DailyNutrition.git
    cd DailyNutrition
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory. At a minimum, provide symmetric keys. 
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/dailynutrition?schema=public"
    JWT_SECRET="generate_a_secure_32_character_string"
    ENCRYPTION_KEY="generate_another_32_char_hex_key_for_db"
    ```

4.  **Database Setup**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application. Admin portal is available at `/admin/login`.

---

## 📜 Legal & License

This project is proprietary software developed for **Daily Nutrition**.

*   **Copyright**: © 2026 Daily Nutrition. All rights reserved.
*   **Privacy & Legal**: For inquiries or specific terms of deployment, refer to included legal protocols relative to your deployment context.

---

<div align="center">
  <sub>Built with precision for health, wellness, and uncompromised security.</sub>
</div>
