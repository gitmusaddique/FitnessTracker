# Overview

This is a fitness tracking mobile-first web application built with React, TypeScript, and Express. The app provides comprehensive fitness management features including workout tracking, meal logging with photo uploads, trainer discovery and booking, and gym search functionality. The application uses a modern tech stack with shadcn/ui components for a polished user interface and follows a full-stack architecture with JWT authentication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety and modern development
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and data fetching
- **shadcn/ui** component library built on Radix UI primitives for accessible, customizable components
- **Tailwind CSS** with CSS custom properties for theming and responsive design
- **Mobile-first design** with bottom navigation pattern optimized for mobile devices

## Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **RESTful API** design with JWT-based authentication using bcryptjs for password hashing
- **File upload support** using multer for handling meal photo uploads
- **Middleware-based architecture** with authentication guards and request logging
- **Error handling** with centralized error middleware

## Database Design
- **PostgreSQL** database with Drizzle ORM for type-safe database operations
- **Neon Database** as the hosted PostgreSQL solution
- **Schema-first approach** with Zod validation for runtime type checking
- **Database tables**: users, workouts, meals, trainers, gyms, bookings
- **UUID primary keys** with foreign key relationships for data integrity

## Authentication & Authorization
- **JWT token-based authentication** stored in localStorage
- **AuthManager** state management for user sessions with subscription pattern
- **Protected routes** using route guards that redirect unauthenticated users
- **Public/private route separation** for secure access control

## State Management
- **Local state** using React hooks for component-level state
- **Server state** managed by TanStack Query with caching and synchronization
- **Authentication state** managed by custom AuthManager with observer pattern
- **Theme management** using React Context for dark/light mode switching

## File Structure
- **Monorepo structure** with shared types and schemas
- **Client-server separation** with `client/`, `server/`, and `shared/` directories
- **Component organization** following shadcn/ui patterns with reusable UI components
- **Type-safe imports** using TypeScript path mapping for clean imports

# External Dependencies

## Core Framework & Build Tools
- **Vite** - Frontend build tool and development server
- **React 18** - Frontend framework with TypeScript support
- **Express.js** - Backend web framework

## Database & ORM
- **Neon Database (@neondatabase/serverless)** - Hosted PostgreSQL database
- **Drizzle ORM** - Type-safe database toolkit with PostgreSQL dialect
- **Drizzle-kit** - Database migration and schema management tool

## UI & Styling
- **Radix UI** - Unstyled, accessible UI primitives for components
- **Tailwind CSS** - Utility-first CSS framework with custom theme configuration
- **Lucide React** - Icon library for consistent iconography
- **shadcn/ui** - Pre-built component system based on Radix UI

## Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing and comparison
- **connect-pg-simple** - PostgreSQL session store (if using sessions)

## Data Management
- **TanStack Query** - Server state management and data fetching
- **React Hook Form** - Form state management with validation
- **Zod** - Runtime type validation and schema definition
- **date-fns** - Date manipulation and formatting utilities

## File Upload & Processing
- **Multer** - File upload middleware for handling multipart/form-data
- **Image upload support** - For meal photo functionality

## Development & Tooling
- **TypeScript** - Static type checking and development experience
- **Wouter** - Lightweight client-side routing
- **Class Variance Authority** - Utility for managing CSS class variants
- **clsx** - Conditional CSS class composition utility