# Overview

This is a professional marketing website for HwinNwin, an AI automation and creative ecosystems company. The website follows their "3P Check" design philosophy (Power, Balance, Prosperity) and provides a complete content management system for easy editing of marketing copy without code access. The system includes Email OTP two-factor authentication for enhanced security and dynamic page creation capabilities for products and landing pages.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

**September 2025**:
- Implemented Email OTP Two-Factor Authentication system with PIN + email verification
- Added comprehensive page management functionality for creating custom pages
- Enhanced content editor with Pages tab for dynamic page creation
- Fixed authentication flow issues and runtime errors
- Added auto-slug generation and content block system for flexible page layouts

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