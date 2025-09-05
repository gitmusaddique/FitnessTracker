# FitTracker Pro

## Overview

FitTracker Pro is a comprehensive fitness tracking mobile web application that helps users manage their workouts, meals, and fitness goals. The app provides a complete fitness ecosystem with features for tracking exercises, logging meals, finding trainers and gyms, and monitoring personal progress through an intuitive dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a modern component-based architecture. The UI framework leverages shadcn/ui components built on top of Radix UI primitives, providing a consistent design system with Material Design 3 color theming. The application uses Wouter for lightweight client-side routing and TanStack Query for efficient data fetching and state management.

Key design decisions:
- **Mobile-first approach**: The app is designed specifically for mobile devices with a bottom navigation pattern and responsive layout constrained to mobile viewport
- **Component architecture**: Modular UI components promote reusability and maintainability
- **State management**: TanStack Query handles server state while local component state manages UI interactions
- **Styling**: Tailwind CSS with CSS custom properties enables consistent theming and responsive design

### Backend Architecture
The server follows a REST API architecture built with Express.js and TypeScript. The application implements a clean separation between route handlers, business logic, and data access layers through a storage interface pattern.

Core architectural patterns:
- **RESTful API design**: Standard HTTP methods and status codes for predictable client-server communication
- **Middleware pattern**: Authentication, logging, and error handling implemented as Express middleware
- **Interface-driven storage**: Abstract storage interface allows for flexible data persistence implementations
- **JWT authentication**: Stateless token-based authentication for secure API access

### Data Storage Solutions
The application uses SQLite as the primary database with Drizzle ORM for type-safe database operations. The schema includes comprehensive user profiles, workout tracking, meal logging, trainer/gym directories, and booking systems.

Database design principles:
- **Relational modeling**: Normalized schema with proper foreign key relationships
- **Type safety**: Drizzle ORM provides compile-time type checking for database operations
- **Schema validation**: Zod schemas ensure data integrity at both client and server boundaries
- **Audit trails**: Timestamps and user attribution for data tracking

### Authentication and Authorization
The system implements JWT-based authentication with bcrypt for password hashing. User sessions are managed client-side with localStorage persistence and automatic token refresh capabilities.

Security considerations:
- **Password security**: BCrypt hashing with salt for secure password storage
- **Token management**: JWT tokens with configurable expiration and refresh mechanisms
- **Route protection**: Authentication middleware guards protected API endpoints
- **Client-side auth**: AuthManager pattern for centralized authentication state management

## External Dependencies

### UI and Component Libraries
- **Radix UI**: Headless UI primitives for accessible component foundations
- **shadcn/ui**: Pre-built component library with consistent design patterns
- **Lucide React**: Icon library for consistent visual elements
- **Tailwind CSS**: Utility-first CSS framework for rapid styling

### Data Management
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Form management with validation and performance optimization
- **Zod**: Schema validation for type-safe data handling across client and server

### Backend Infrastructure
- **Express.js**: Web framework for REST API implementation
- **Drizzle ORM**: Type-safe database query builder and migrations
- **Better SQLite3**: Embedded database for local development and deployment
- **Multer**: Middleware for handling file uploads (profile pictures, meal photos)

### Development and Build Tools
- **Vite**: Fast build tool with hot module replacement for development
- **TypeScript**: Static typing for improved developer experience and code quality
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration