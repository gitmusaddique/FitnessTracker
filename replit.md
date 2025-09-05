# Replit Project Documentation

## Overview

This is a comprehensive fitness tracking web application called "FitTracker Pro" built as a full-stack TypeScript application. The system provides users with tools to track workouts, meals, browse trainers and gyms, and manage their fitness journey through a mobile-first interface. It includes both user-facing features and administrative capabilities for managing trainers and gym data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system supporting multiple themes
- **State Management**: TanStack Query for server state and custom auth manager for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Mobile-First Design**: Responsive layout optimized for mobile devices with bottom navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcryptjs for password hashing
- **File Uploads**: Multer middleware for handling image uploads
- **API Design**: RESTful API with separate admin and user endpoints

### Data Storage Solutions
- **Primary Database**: SQLite with better-sqlite3 driver for simplicity and portability
- **Admin Database**: Separate SQLite database for administrative data isolation
- **Schema Management**: Drizzle schema with TypeScript types for compile-time safety
- **Database Tables**: Users, workouts, meals, trainers, gyms, bookings, and admin_users

### Authentication and Authorization
- **User Authentication**: JWT tokens with configurable secret keys
- **Admin Authentication**: Separate JWT-based system for administrative access
- **Password Security**: bcryptjs hashing with salt rounds
- **Role-Based Access**: Super admin role for administrative functions
- **Token Storage**: Client-side localStorage with automatic token refresh handling

### External Dependencies
- **UI Components**: Extensive use of Radix UI primitives for accessible components
- **Validation**: Zod for runtime type checking and schema validation
- **Date Handling**: date-fns for date manipulation and formatting
- **Icons**: Lucide React for consistent iconography
- **Development**: Replit-specific plugins for development environment integration
- **Theming**: Custom theme system with JSON-based color configurations supporting light/dark modes

### Key Design Patterns
- **Repository Pattern**: Storage abstraction layer with interface-based design
- **Component Composition**: Modular UI components with consistent design patterns
- **Type Safety**: End-to-end TypeScript with shared schemas between client and server
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Theme System**: Dynamic theming with CSS custom properties and JSON configuration files