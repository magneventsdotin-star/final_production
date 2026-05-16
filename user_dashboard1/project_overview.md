# 🏰 Magnevents Project Overview

This document provides a comprehensive summary of the **Magnevents** platform, its architectural decisions, and current implementation status.

## 🏗️ Architecture
The project is built using a modern **Next.js 14 App Router** architecture, optimized for performance and scalability.

- **Frontend**: Next.js 14 (Server & Client Components)
- **Styling**: Unified Design System via `tokens.css` and `flow-unify.css`
- **Animations**: Integrated Framer Motion for high-end UI interactions
- **State Management**: TanStack Query for server-state synchronization
- **Backend**: Supabase for real-time data and authentication

## 🎨 Design System (Current State)
The project currently utilizes a **"Luxury Gold & Ruby"** design system.

| Token | Value | Description |
| :--- | :--- | :--- |
| **Primary Brand** | `#FFE032` | Vibrant Gold/Yellow used for primary CTAs and accents. |
| **Secondary Brand**| `#D65050` | Ruby Red used for highlights and specific indicators. |
| **Background** | `#0a0a0a` | Deep obsidian base for a premium dark-mode experience. |
| **Typography** | `Inter` | Clean, modern sans-serif for readability. |

## 🚀 Core Modules

### 1. Landing Page (`app/page.jsx`)
A high-conversion hub featuring:
- **Hero Section**: Premium introduction with glassmorphic CTAs.
- **Top Performers**: Showcase of elite talent with hover effects.
- **Process Flow**: Step-by-step guide on how to book.

### 2. Dual Modal System
- **Contact/Booking Modal**: Triggered for client inquiries with a gold luxury aesthetic.
- **Artist Registration**: A dedicated portal (`/register`) for talent onboarding.

### 3. Mobile Navigation
- Custom bottom navigation bar tailored for mobile-first users.
- Translucent, glassmorphic design consistent with the desktop experience.

## 🛠️ Implementation Progress

- [x] **Core UI Framework**: Next.js setup with App Router.
- [x] **Design Tokens**: Standardized CSS variables for theme consistency.
- [x] **Modals**: Functional dual-modal system for bookings and registration.
- [x] **Responsiveness**: Mobile-optimized layouts and navigation.
- [ ] **Data Persistence**: Full integration with Supabase tables (In progress).
- [ ] **Artist Search**: Advanced filtering and category-based discovery.

---

*This project is optimized for high-performance and a premium user experience.*
