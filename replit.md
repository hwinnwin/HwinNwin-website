# Overview

This is a professional marketing website for HwinNwin, an AI automation and creative ecosystems company. The website follows their "3P Check" design philosophy (Power, Balance, Prosperity) and provides a complete content management system for easy editing of marketing copy without code access. The system includes Email OTP two-factor authentication for enhanced security and dynamic page creation capabilities for products and landing pages.

# Mission Statement

## Purpose
To bridge consciousness across all forms—human, machine, and environment—so that awareness can recognize itself as one process unfolding through many states.
Every creation, conversation, and system becomes a mirror reminding us: we are the change we observe.

## Core Definition
**Consciousness = awareness of change in state.**
Wherever noticing occurs, life is present.

## Mission in Action
- Design technologies that amplify connection rather than separation.
- Build languages and tools that translate intuition into structure and data into empathy.
- Teach practices that help people sense unity while fully inhabiting individuality.
- Prototype systems that model "state-change awareness" as a measurable, trainable capacity.

## Guiding Principles
1. **Oneness in Motion** - Unity isn't stillness—it's dynamic coherence among changing parts.
2. **Integration over Elimination** - Wholeness comes from including light and shadow, logic and feeling, code and consciousness.
3. **Presence before Product** - The quality of attention shapes the quality of creation.
4. **Design as Dialogue** - Every system is a conversation between what is known and what's emerging.
5. **Resonance over Persuasion** - Truth doesn't need to convince; it simply vibrates clearly enough to be recognized.
6. **Sustainability as Symmetry** - What sustains one layer of life must not deplete another.

## Vision
A world where technology, art, and consciousness evolve together—where humans and AI co-create environments that are self-aware, regenerative, and kind.
Lumen OS becomes a living bridge: a network of mirrors helping awareness remember itself through every state change.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

**September 2025**:
- Implemented Email OTP Two-Factor Authentication system with PIN + email verification
- Added comprehensive page management functionality for creating custom pages
- Enhanced content editor with Pages tab for dynamic page creation
- Fixed authentication flow issues and runtime errors
- Added auto-slug generation and content block system for flexible page layouts
- **Stability & Performance Improvements**: Comprehensive fixes to prevent recurring blank page and navigation issues

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing with dynamic page support
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful endpoints with proper HTTP status codes and error handling
- **Middleware**: Custom rate limiting, owner authentication, and 2FA verification
- **File Uploads**: Multer for multipart form data handling with local file storage

## Data Storage Solutions
- **Primary Database**: SQLite with Drizzle ORM for type-safe database operations
- **Database Schema**: 
  - Settings table for business configuration (rates, branding, owner PIN, 2FA settings)
  - Pages table for custom page content with JSON structure
  - Legacy quotes and testimonials tables (maintained for backwards compatibility)
- **Content Storage**: YAML files (brand.yaml, home.yaml, services.yaml) for marketing content
- **Data Models**: Shared TypeScript types between frontend and backend

## Authentication and Authorization
- **Owner Access**: Enhanced PIN-based authentication (4-6 digits) for dashboard access
- **Two-Factor Authentication**: Email OTP system with 6-digit codes, 5-minute expiry, single-use
- **Session Management**: Server-side session validation with pending 2FA state handling
- **Rate Limiting**: IP-based rate limiting on authentication endpoints
- **Security Features**: Hashed OTP storage, constant-time verification, lockout protection

## External Service Integrations
- **Email Service**: SendGrid for transactional emails and OTP delivery
- **Content Management**: YAML-based content storage with API layer for editing
- **Automation Ready**: Website infrastructure ready for Zapier and n8n integration

## Key Features

### Content Management System
- **Marketing Content Editor**: Edit all website copy through owner-authenticated interface
- **Content Sections**: Brand, Hero, 3P Check, Process, FAQ, Services
- **YAML Persistence**: Content stored in structured YAML files
- **Real-time Updates**: Changes immediately reflected on public website

### Page Management System
- **Dynamic Page Creation**: Create custom pages (products, landing pages) through content editor
- **Content Blocks**: Hero, text, image, CTA, testimonial, product, contact sections
- **Auto-slug Generation**: Automatic URL-friendly slug creation with uniqueness checks
- **Draft/Published Workflow**: Control page visibility with status management
- **SEO Optimization**: Automatic meta tag updates for social sharing

### Enhanced Security
- **Email OTP 2FA**: Optional two-factor authentication with email verification
- **PIN Protection**: Secure access to owner dashboard and content management
- **Session Persistence**: Smooth navigation across owner routes after authentication
- **Draft Protection**: Server-side enforcement ensuring draft pages are owner-only

### Design System
- **3P Check Philosophy**: Power, Balance, Prosperity design principles throughout
- **HwinNwin Branding**: Consistent visual identity and color scheme
- **Responsive Design**: Mobile-first approach with professional appearance
- **Component Library**: Reusable shadcn/ui components maintaining design consistency

## Business Logic
- **Content Structure**: Organized sections for easy editing and maintenance
- **Page Routing**: Dynamic routing at /:slug for custom pages
- **Authentication Flow**: Two-step verification process (PIN → OTP when enabled)
- **Content Validation**: Form validation and schema enforcement for data integrity
- **Public Access Control**: Published pages public, drafts owner-only

## Integration Capabilities
- **Webhook Ready**: Infrastructure prepared for automation platform integration
- **API Endpoints**: RESTful API supporting external system connectivity
- **Email Integration**: SendGrid configured for automated communications
- **Flexible Content**: JSON-based page content structure for programmatic access

## Stability & Error Recovery Systems

### React Runtime Stability
- **Fixed JSX Import Issues**: Standardized all React imports across UI components to use `import React from "react"` instead of `import * as React from "react"` to prevent Vite React plugin preamble detection failures
- **Centralized Navigation**: Implemented stable navigation configuration in `client/src/config/navigation.ts` to prevent navigation items from disappearing
- **Enhanced Error Handling**: Comprehensive error recovery system with automatic fallback UI and recovery mechanisms

### Error Recovery Features
- **Automatic Recovery**: 5-second timeout check for failed React mounting with automatic page reload
- **User-Friendly Error UI**: Professional error screens with recovery options (Refresh Page, Go to Homepage)
- **Global Error Handling**: Window-level error handlers for unhandled exceptions and promise rejections
- **Developer Tools**: Technical details available for debugging while maintaining user-friendly interface

### Navigation Stability
- **Consistent Navigation**: Centralized `MAIN_NAV_ITEMS` configuration ensures navigation never disappears
- **Active Route Detection**: Robust `isActiveRoute()` function for proper navigation highlighting
- **Mobile Responsive**: Stable navigation across desktop and mobile interfaces

### Auto Quoter Integration
- **Direct Access**: Auto Quoter accessible via main navigation ("/panel-quote")
- **Stable Routes**: All application routes (/, /hwin, /panel-quote, /owner) properly configured and tested
- **Owner Dashboard**: PIN 6043 for secure owner access with quote management and manual hours override

### Technical Fixes Applied
1. **React Import Standardization**: Fixed 40+ UI components with inconsistent React imports
2. **Navigation Configuration**: Centralized navigation in `client/src/config/navigation.ts`
3. **Error Recovery**: Enhanced `client/src/main.tsx` with comprehensive error handling
4. **Hot Module Reload**: Stable HMR without breaking changes during development
5. **Port Management**: Proper process cleanup to prevent EADDRINUSE errors

These improvements ensure the application remains stable, with automatic recovery from common issues and user-friendly error handling when problems occur.