# AavaasIQ — Frontend Development Plan
### `01_frontend.md` — Master Frontend Foundation Reference

---

> **Product**: AavaasIQ  
> **Tagline**: Smarter Societies. Better Living.  
> **Phase**: 1 — Frontend Foundation (0% → ~30% complete)  
> **Stack**: Next.js 14 · TypeScript · Tailwind CSS · Lucide React  
> **Approach**: UI-first, mock data, API-ready architecture

---

## Table of Contents

1. [Project Initialization](#1-project-initialization)
2. [Folder Structure](#2-folder-structure)
3. [Design System](#3-design-system)
4. [Color Tokens](#4-color-tokens)
5. [Typography System](#5-typography-system)
6. [Component Library (UI Primitives)](#6-component-library)
7. [Layout Components](#7-layout-components)
8. [Mock Data Layer](#8-mock-data-layer)
9. [Route Architecture](#9-route-architecture)
10. [Landing Page (`/`)](#10-landing-page)
11. [Login Page (`/login`)](#11-login-page)
12. [Signup Page (`/signup`)](#12-signup-page)
13. [Resident Dashboard (`/resident/dashboard`)](#13-resident-dashboard)
14. [Home Services Page (`/resident/services`)](#14-home-services-page)
15. [Admin Dashboard (`/admin/dashboard`)](#15-admin-dashboard)
16. [Security Dashboard (`/security/dashboard`)](#16-security-dashboard)
17. [Provider Dashboard (`/provider/dashboard`)](#17-provider-dashboard)
18. [Placeholder Pages](#18-placeholder-pages)
19. [Responsive Design Strategy](#19-responsive-design-strategy)
20. [AI/Intelligence UX](#20-aiintelligence-ux)
21. [Accessibility Checklist](#21-accessibility-checklist)
22. [Build & Verification Plan](#22-build--verification-plan)
23. [Phase 2 Handoff Notes](#23-phase-2-handoff-notes)

---

## 1. Project Initialization

### Command
```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
```

### Additional packages
```bash
npm install lucide-react clsx tailwind-merge
```

### Final `package.json` dependencies (production)
| Package | Purpose |
|---|---|
| `next` | Framework |
| `react` + `react-dom` | UI runtime |
| `typescript` | Type safety |
| `tailwindcss` | Styling |
| `lucide-react` | Icon system |
| `clsx` | Conditional class names |
| `tailwind-merge` | Merge Tailwind classes safely |

> **Zero unnecessary dependencies.** No UI library, no animation library, no chart library (use CSS/SVG for charts), no form library for this phase.

---

## 2. Folder Structure

```
AavaasIQ/
├── app/                          ← Next.js App Router
│   ├── layout.tsx                ← Root layout
│   ├── page.tsx                  ← Landing page (/)
│   ├── globals.css               ← Global styles + design tokens
│   │
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   │
│   ├── resident/
│   │   ├── layout.tsx            ← Resident sidebar layout
│   │   ├── dashboard/page.tsx
│   │   ├── visitors/page.tsx
│   │   ├── deliveries/page.tsx
│   │   ├── complaints/page.tsx
│   │   ├── maintenance/page.tsx
│   │   ├── notices/page.tsx
│   │   ├── events/page.tsx
│   │   ├── parking/page.tsx
│   │   ├── amenities/page.tsx
│   │   ├── services/page.tsx
│   │   └── emergency/page.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── residents/page.tsx
│   │   ├── complaints/page.tsx
│   │   ├── maintenance/page.tsx
│   │   ├── visitors/page.tsx
│   │   ├── services/page.tsx
│   │   ├── notices/page.tsx
│   │   └── analytics/page.tsx
│   │
│   ├── security/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── visitors/page.tsx
│   │   ├── deliveries/page.tsx
│   │   └── emergency/page.tsx
│   │
│   └── provider/
│       ├── layout.tsx
│       ├── dashboard/page.tsx
│       ├── requests/page.tsx
│       ├── bookings/page.tsx
│       └── earnings/page.tsx
│
├── components/
│   ├── ui/                       ← Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Avatar.tsx
│   │   ├── Toast.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── StatusIndicator.tsx
│   │   └── Dropdown.tsx
│   │
│   ├── layout/                   ← App-level layout pieces
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── landing/                  ← Landing page sections
│   │   ├── HeroSection.tsx
│   │   ├── TrustedEcosystem.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HomeServicesSection.tsx
│   │   ├── AISection.tsx
│   │   ├── HowItWorks.tsx
│   │   └── CTASection.tsx
│   │
│   ├── dashboard/                ← Shared dashboard widgets
│   │   ├── StatCard.tsx
│   │   ├── ActivityFeed.tsx
│   │   ├── QuickActions.tsx
│   │   └── AIInsightCard.tsx
│   │
│   ├── resident/                 ← Resident-specific
│   │   ├── ComplaintsList.tsx
│   │   ├── VisitorCard.tsx
│   │   └── ServiceProviderCard.tsx
│   │
│   ├── admin/                    ← Admin-specific
│   │   ├── ComplaintOverview.tsx
│   │   └── SocietyActivityFeed.tsx
│   │
│   ├── security/                 ← Security-specific
│   │   └── VisitorEntryTable.tsx
│   │
│   └── provider/                 ← Provider-specific
│       └── ServiceRequestCard.tsx
│
├── lib/
│   ├── types.ts                  ← Shared TypeScript interfaces
│   ├── utils.ts                  ← cn() helper, formatters
│   └── mock/
│       ├── index.ts
│       ├── residents.ts
│       ├── complaints.ts
│       ├── visitors.ts
│       ├── services.ts
│       ├── bookings.ts
│       ├── notices.ts
│       └── maintenance.ts
│
├── public/
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## 3. Design System

### Principles
- **Clarity first** — every element has a purpose
- **System consistency** — same spacing, same radius, same color usage everywhere
- **Content-forward** — UI chrome steps back; content is hero
- **Mobile-first** — designed for mobile, enhanced for desktop

### Spacing scale (Tailwind defaults)
Use `4px` base unit: `p-1=4px`, `p-2=8px`, `p-4=16px`, `p-6=24px`, `p-8=32px`

### Border radius
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Inputs: `rounded-lg`
- Badges: `rounded-full`

### Shadow
- Cards: `shadow-sm` (subtle)
- Modals: `shadow-xl`
- Dropdowns: `shadow-lg`

---

## 4. Color Tokens

Defined as Tailwind custom colors in `tailwind.config.ts`:

```ts
// Primary: Deep emerald green
primary-600: '#16a34a'   // Main brand
primary-50:  '#f0fdf4'   // Light backgrounds

// Neutral: Warm stone
neutral-50:  '#fafaf9'   // App background
neutral-800: '#292524'   // Body text
neutral-500: '#78716c'   // Muted text
neutral-200: '#e7e5e4'   // Borders
```

### Semantic usage
| Token | Usage |
|---|---|
| `bg-primary-600` | Primary buttons, active nav |
| `bg-primary-50` | Highlighted sections, AI cards |
| `bg-neutral-50` | Page background |
| `bg-white` | Cards, panels |
| `border-neutral-200` | Dividers |
| `text-neutral-800` | Primary text |
| `text-neutral-500` | Labels, metadata |
| `text-green-600` | Resolved/success status |
| `text-amber-600` | Pending/warning status |
| `text-red-600` | Open/urgent/error status |
| `text-blue-600` | Info/expected status |

---

## 5. Typography System

```
Font: Inter (via next/font/google)

h1 → text-3xl / text-4xl, font-bold
h2 → text-2xl, font-semibold
h3 → text-xl, font-semibold
h4 → text-lg, font-semibold

body → text-sm, text-neutral-800
label → text-xs, font-medium, text-neutral-600
muted → text-xs, text-neutral-500
```

---

## 6. Component Library

### Button.tsx
```
variants: primary | secondary | ghost | danger | outline
sizes:    sm | md | lg
props:    children, onClick, disabled, loading, icon
```

### Badge.tsx — Status color map
```
Resolved / Success    → green bg
In Progress / Warning → amber bg
Open / Error          → red bg
Expected / Info       → blue bg
Verified              → green bg
Neutral               → gray bg
```

### Card.tsx
```
props: children, className, padding (none | sm | md | lg)
```

### Input.tsx
```
props: label, placeholder, error, type, icon (left), value, onChange
```

### Avatar.tsx
```
Fallback: initials from name, primary-600 background
sizes: sm | md | lg
```

### Modal.tsx
```
props: isOpen, onClose, title, children, footer
Overlay: bg-black/50 backdrop
```

### EmptyState.tsx
```
props: icon, title, description, action?
```

---

## 7. Layout Components

### Navbar.tsx (Landing)
- Left: AavaasIQ logo (text + icon)
- Center: Features · Services · About
- Right: Login · Get Started
- Mobile: hamburger → slide-down menu

### Sidebar.tsx (Dashboards)
Config-driven via `navItems[]` prop.
- Desktop: fixed 240px
- Mobile: overlay on hamburger
- Active state: `bg-primary-50 text-primary-700 font-medium`

### DashboardHeader.tsx
- Left: hamburger (mobile) + page title
- Right: notification bell + avatar

### MobileNav.tsx
- Bottom tab bar on mobile (max 5 items)

### Footer.tsx (Landing)
- Logo + tagline
- Link columns: Product, Company, Legal

---

## 8. Mock Data Layer

### `lib/types.ts` — Key interfaces

```ts
Resident       { id, name, flat, block, mobile, email, status }
Complaint      { id, title, category, status, priority, residentName, flat, createdAt }
Visitor        { id, name, purpose, flatNo, expectedAt, status }
ServiceProvider{ id, name, category, rating, experience, startingPrice, verified }
Notice         { id, title, content, category, publishedAt }
MaintenanceBill{ id, month, amount, dueDate, status }
ServiceBooking { id, service, providerName, scheduledAt, status, amount }
```

### Mock Data Highlights

**residents.ts** — 10 Indian residents
- Rahul Sharma (A-204), Priya Patel (B-102), Amit Verma (C-302)...
- Society: Green Valley Residency, Pune

**complaints.ts** — 8 complaints
- Water leakage in bathroom → In Progress
- Lift not working Block B → Open
- Garbage collection missed → Resolved

**visitors.ts** — Today's log
- Swiggy Delivery → Inside
- Ravi Kumar (Guest) → Expected 5:30 PM
- Amazon → Exited

**services.ts** — 12 providers
- Ramesh Kumar (Plumbing) ₹300, 4.8⭐
- Sunita Cleaning Services, ₹500, 4.6⭐
- CoolAir AC Service, ₹800, 4.9⭐

**notices.ts** — 6 notices
- Water tank cleaning scheduled
- Community Diwali Event
- Parking rule updates
- Maintenance due reminder

**maintenance.ts** — Monthly bills
- October 2025: ₹2,400 pending, due 5 days
- September 2025: ₹2,400 paid

---

## 9. Route Architecture

### Priority routes (Full implementation)
| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Authentication |
| `/signup` | Registration (multi-step) |
| `/resident/dashboard` | Resident main dashboard |
| `/resident/services` | Home services marketplace |
| `/admin/dashboard` | Admin management dashboard |
| `/security/dashboard` | Security guard interface |
| `/provider/dashboard` | Service provider dashboard |

### Placeholder routes (30 routes)
All use consistent sidebar layout + `PlaceholderPage` component. No broken routes.

---

## 10. Landing Page (`/`)

### Sections
1. **Hero** — Headline + CTA + CSS dashboard preview
2. **Trusted Ecosystem** — Resident → Management → Security → Providers
3. **Features** — 8 feature cards (4-col grid)
4. **Home Services** — Category pills + 3 provider previews
5. **AI Intelligence** — AavaasIQ Intelligence section (minimal)
6. **How It Works** — 3-step flow
7. **CTA** — Get Started prompt
8. **Footer** — Links + copyright

### Hero visual
Mini dashboard mockup built entirely in CSS/Tailwind (no images needed).
Shows: stat cards, activity items, badge colors — communicates product value.

---

## 11. Login Page (`/login`)

### Layout
- Desktop: Split — left brand panel + right form
- Mobile: Full-screen form

### Form fields
- Role selector tabs: Resident | Society Admin | Security | Service Provider
- Mobile/Email input
- Password input (show/hide toggle)
- Sign In button
- Forgot password link
- Sign up link

### Mock behavior
Any credentials → redirect to selected role's dashboard.

---

## 12. Signup Page (`/signup`)

### Multi-step flow (progress bar shown)
1. **Choose Role** — 4 role cards
2. **Basic Details** — Name, Mobile, Email, Password
3. **Role Details** — Society/flat (resident) or category/experience (provider)
4. **Success** — Welcome screen + redirect

---

## 13. Resident Dashboard (`/resident/dashboard`)

### Widgets
1. **Header** — "Good morning, Rahul 👋 · Green Valley Residency · Flat A-204"
2. **Stat Cards** — Maintenance Due, Active Complaints, Today's Visitors, Upcoming Events
3. **Quick Actions** — 5 action buttons
4. **Today's Activity** — Timeline feed (4 items)
5. **My Complaints** — List with status badges (3 items + View All)
6. **AavaasIQ Assistant** — Insight card + Ask button

---

## 14. Home Services Page (`/resident/services`)

### Content
- Search bar
- Category filter: All | Cleaning | Plumbing | Electrical | AC | Painting | Beauty | Appliances
- 12 provider cards (3-col desktop, 1-col mobile)
- Each card: Name, Category, Rating, Experience, Price, Verified badge, Book Now

---

## 15. Admin Dashboard (`/admin/dashboard`)

### Widgets
1. **Stat Cards** — Total Residents, Open Complaints, Maintenance Collection, Today's Visitors
2. **Complaint Overview** — CSS progress bars showing Open/In Progress/Resolved
3. **Society Activity** — Recent event feed
4. **AavaasIQ Insights** — 3 mock AI insights

---

## 16. Security Dashboard (`/security/dashboard`)

### Design: Simple, fast, high-contrast
1. **Visitor Counts** — Expected / Approved / Inside / Exited
2. **Quick Actions** — 4 large action buttons
3. **Recent Entries** — Table with name, flat, time, status, action

---

## 17. Service Provider Dashboard (`/provider/dashboard`)

### Widgets
1. **Stat Cards** — New Requests, Today's Jobs, Completed, Earnings
2. **New Requests** — Cards with Accept/Decline
3. **Today's Schedule** — Appointment list
4. **Earnings Summary** — Month summary with comparison

---

## 18. Placeholder Pages

Reusable `PlaceholderPage` component showing:
- Relevant icon
- Page title
- Description
- "Coming in Phase 2" message
- Back to Dashboard link

All 30 placeholder routes use this consistently.

---

## 19. Responsive Design Strategy

### Sidebar
- `lg+`: Fixed 240px sidebar
- `< lg`: Hidden, opens as overlay on hamburger tap

### Dashboard stat cards
- Desktop: 4-column `grid-cols-4`
- Tablet: 2-column `grid-cols-2`
- Mobile: 1-column `grid-cols-1`

### Services grid
- Desktop: 3-column
- Tablet: 2-column
- Mobile: 1-column

### Tables → Card list on mobile

### Navbar
- Desktop: horizontal links
- Mobile: hamburger → vertical menu

---

## 20. AI/Intelligence UX

### Naming rules
| ❌ Avoid | ✅ Use |
|---|---|
| "AI" everywhere | "AavaasIQ Intelligence" |
| "AI Assistant" | "AavaasIQ Assistant" |
| "AI Insights" | "AavaasIQ Insights" |
| Robot animations | Subtle `Sparkles` icon |

### Visual style
- No glowing effects, no pulsing animations
- Subtle `bg-primary-50` background
- `border-primary-100` border
- Short, specific, actionable text

---

## 21. Accessibility Checklist

- [ ] All inputs have `<label>` elements
- [ ] All buttons have accessible text or `aria-label`
- [ ] Color contrast ≥ 4.5:1
- [ ] `focus:ring-2 focus:ring-primary-500` on all interactive elements
- [ ] Semantic HTML: `nav`, `main`, `header`, `footer`, `section`, `aside`
- [ ] `alt` text on all images

---

## 22. Build & Verification Plan

### Commands
```bash
npm run lint         # ESLint check
npx tsc --noEmit    # TypeScript check
npm run build        # Production build
npm run dev          # Local test
```

### Route verification checklist
- [ ] `/` loads all 8 sections
- [ ] `/login` — role tabs + mock login works
- [ ] `/signup` — all 4 steps work
- [ ] `/resident/dashboard` — all 6 widgets render
- [ ] `/resident/services` — filter + cards work
- [ ] `/admin/dashboard` — all 4 sections render
- [ ] `/security/dashboard` — all 3 sections render
- [ ] `/provider/dashboard` — all 4 sections render
- [ ] All 30 placeholder routes load without errors
- [ ] Mobile: sidebar collapses, hamburger works
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build succeeds

---

## 23. Phase 2 Handoff Notes

### API integration pattern
```ts
// Phase 1 (current)
import { mockComplaints } from '@/lib/mock/complaints'

// Phase 2 (replace with)
import { getComplaints } from '@/lib/api/complaints'
```

### Auth integration points
- `app/layout.tsx` → SessionProvider
- Role layouts → auth guards
- `DashboardHeader` → real session user
- Login/Signup → real auth endpoints

### Env vars to add in Phase 6+
```env
NEXT_PUBLIC_API_URL=https://api.aavaasiq.com
NEXTAUTH_SECRET=...
DATABASE_URL=...
```

---

## Delivery Summary

| Category | Count |
|---|---|
| Full pages | 8 |
| Placeholder pages | ~25 |
| UI components | 12 |
| Layout components | 6 |
| Landing sections | 7 |
| Dashboard widgets | 15+ |
| Mock data files | 8 |
| TypeScript interfaces | 8 |

**Total routes: ~33**  
**Target: 0 TypeScript errors, 0 ESLint errors, successful build**

---

*AavaasIQ · Smarter Societies. Better Living.*
