# Overview

This is a professional automotive damage assessment and quote generation system for Lee Murdok Panels, a body shop in Australia. The application provides a customer-facing form for submitting vehicle damage claims with photo uploads, and an owner dashboard for reviewing, editing, and approving quotes. The system handles Australian tax requirements (GST), generates PDF quotes, sends emails via SendGrid, and provides public quote sharing capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful endpoints with proper HTTP status codes and error handling
- **Middleware**: Custom rate limiting, owner authentication, and file upload handling
- **File Uploads**: Multer for multipart form data handling with local file storage

## Data Storage Solutions
- **Primary Database**: SQLite with Drizzle ORM for type-safe database operations
- **Database Schema**: 
  - Settings table for business configuration (rates, branding, owner PIN)
  - Quotes table with JSON columns for flexible data storage (damage items, calculations, photos)
  - Testimonials table for customer feedback
- **File Storage**: Local filesystem storage with abstracted interface for future cloud migration
- **Data Models**: Shared TypeScript types between frontend and backend

## Authentication and Authorization
- **Owner Access**: PIN-based authentication (4-6 digits) for dashboard access
- **Session Management**: Server-side session validation
- **Rate Limiting**: IP-based rate limiting to prevent abuse
- **Spam Protection**: Honeypot fields and form validation

## External Service Integrations
- **Email Service**: SendGrid for transactional emails with graceful fallback
- **PDF Generation**: Server-side HTML-to-PDF conversion for quote documents
- **Image Processing**: Client-side image validation (size, dimensions, blur detection)

## Key Features
- **Quote Calculation Engine**: Sophisticated pricing logic with Australian GST (10%)
- **Photo Upload System**: Multi-file upload with validation and error handling
- **Owner Approval Workflow**: Two-stage process where customers submit requests and owners approve final quotes
- **Public Quote Sharing**: Secure slug-based URLs for approved quotes
- **Mobile-First Design**: Responsive interface optimized for mobile devices
- **Confidence Scoring**: Automatic assessment of quote reliability based on damage complexity and photo quality

## Business Logic
- **Pricing Structure**: Labour rates, materials costs, parts markup with paint type multipliers
- **Damage Assessment**: Panel-by-panel severity rating with repair vs replacement logic
- **Australian Compliance**: GST calculation, AUD currency formatting, legal disclaimers
- **Quality Assurance**: Photo requirements, confidence indicators, provisional estimate warnings