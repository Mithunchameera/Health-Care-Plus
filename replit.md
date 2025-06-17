# HealthCare+ E-Channelling System

## Overview

HealthCare+ is a comprehensive web-based e-channelling (appointment booking) system designed for healthcare providers. It provides a modern, responsive platform for patients to book appointments with doctors, while offering role-based dashboards for doctors, patients, and administrators. The system operates in a demo mode with mock data storage to showcase functionality without requiring a live database.

## System Architecture

### Frontend Architecture
- **Technology Stack**: HTML5, CSS3 (with CSS variables for theming), Vanilla JavaScript
- **Design Pattern**: Component-based architecture with class-based JavaScript modules
- **Responsive Design**: Mobile-first approach with flexible grid layouts
- **Theme System**: Dynamic theme switching with automatic time-based themes and manual controls
- **Multi-step Forms**: Complex booking flow with step-by-step navigation and validation

### Backend Architecture
- **Server Technology**: PHP 8.2 with built-in development server
- **Data Storage**: Mock data storage system (simulating database functionality)
- **API Architecture**: RESTful API endpoints with role-based access control
- **Session Management**: Custom session handling with secure cookie implementation
- **Authentication**: Static demo authentication with role-based permissions

## Key Components

### Authentication System
- **Problem**: Secure user authentication across multiple user roles
- **Solution**: Mock authentication system with session-based security
- **Roles Supported**: Patient, Doctor, Admin, Staff
- **Features**: Login/logout, registration, session validation, role-based access

### Booking System
- **Problem**: Complex multi-step appointment booking process
- **Solution**: JavaScript-driven wizard interface with step validation
- **Components**: Doctor selection, date/time picker, patient details, payment processing
- **Features**: Real-time availability checking, booking confirmation, payment integration

### Dashboard System
- **Problem**: Different interfaces needed for different user types
- **Solution**: Role-specific dashboards with shared navigation framework
- **Patient Dashboard**: Appointment management, doctor search, profile management
- **Doctor Dashboard**: Schedule management, patient records, availability settings
- **Admin Dashboard**: System overview, user management, reporting

### Theme Management
- **Problem**: User preference for light/dark themes and automatic switching
- **Solution**: CSS variable-based theme system with JavaScript controller
- **Features**: Manual theme switching, automatic time-based themes, system preference detection
- **Themes**: Light, Dark, Auto (time-based switching)

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. PHP auth handler validates against mock user data
3. Session created and stored in mock storage
4. Session ID set as HTTP-only cookie
5. Subsequent requests validate session for protected routes

### Booking Flow
1. Patient selects doctor from public listings
2. JavaScript loads available time slots via API
3. Patient fills booking form across multiple steps
4. Form validation at each step before progression
5. Final booking stored in mock data storage
6. Confirmation sent to user and doctor

### Dashboard Data Flow
1. Authentication check on page load
2. Role-based API calls to fetch relevant data
3. JavaScript renders data into dashboard components
4. Real-time updates through periodic API calls
5. User actions trigger API updates and UI refresh

## External Dependencies

### Frontend Libraries
- **Font Awesome 6.0.0**: Icon library for UI elements
- **CDN Delivered**: Reduces bundle size and improves loading

### Backend Dependencies
- **PHP Built-in Server**: Development server for local testing
- **Session Management**: Custom implementation without external dependencies
- **No Database**: Mock storage system eliminates database requirements

## Deployment Strategy

### Development Environment
- **Server**: PHP built-in development server on port 5000
- **Hot Reload**: Manual refresh required for changes
- **Configuration**: Replit-based development with multi-language support

### Production Considerations
- **Database Migration**: Designed to easily integrate with PostgreSQL/MySQL
- **Session Storage**: Can be upgraded to Redis or database-backed sessions
- **File Storage**: Currently local, can be moved to cloud storage
- **Security**: HTTPS termination, secure headers, input validation ready

### Scalability Approach
- **API-First Design**: Frontend and backend are loosely coupled
- **Role-Based Architecture**: Easy to add new user types and permissions
- **Modular Components**: Individual features can be upgraded independently

## Recent Changes

- June 17, 2025: Redesigned search boxes across all dashboards with enhanced functionality
  - Implemented modern rounded search styling with focus animations and hover effects
  - Added autocomplete suggestions dropdown with real-time filtering
  - Enhanced search functionality with clear buttons and search result counters
  - Integrated search term highlighting in results with yellow background
  - Admin dashboard: Enhanced doctor and appointment search with specialty filtering
  - Patient dashboard: Improved doctor search with location and availability filters
  - Doctor dashboard: Redesigned patient search with enhanced suggestions and clearing
  - All search boxes now support keyboard navigation (Escape to clear, Enter to execute)
  - Mobile-responsive design with touch-friendly controls and proper input sizing

- June 17, 2025: Recreated admin dashboard pages with complete functionality overhaul
  - Fixed JavaScript error by removing undefined setupFormHandlers method
  - Complete redesign of admin dashboard interface with professional styling
  - Enhanced sidebar navigation with admin profile information and avatar
  - Comprehensive stats display with animated cards and hover effects
  - Advanced filtering and search functionality across all management sections
  - Doctor management with specialty filtering and status controls
  - Appointment management with date and status filtering capabilities
  - Patient management with search and history viewing options
  - Staff management with role-based filtering and status controls
  - Reports section with real-time analytics and performance metrics
  - System settings with configuration management interface
  - Mobile-responsive design with collapsible sidebar and touch-friendly controls

- June 17, 2025: Recreated doctor dashboard pages with enhanced functionality
  - Complete redesign of doctor dashboard interface with modern styling
  - Enhanced sidebar navigation with doctor profile information
  - Professional appointment cards with patient details and action buttons
  - Advanced weekly schedule management with interactive time slots
  - Comprehensive availability setting system with time slot selection
  - Patient management section with search and history viewing
  - Mobile-responsive design with collapsible sidebar
  - Modal-based patient history viewing with tabbed interface
  - Enhanced stats display with gradient animations and hover effects

- June 16, 2025: Created comprehensive view doctor schedule function
  - Enhanced weekly schedule display with interactive day cards
  - Modal-based schedule detail viewing for individual time slots
  - Availability management system with time slot selection
  - Real-time appointment viewing with patient information
  - Professional CSS styling with hover effects and transitions
  - Backend API endpoints for schedule data retrieval and management

- June 16, 2025: Migration from Replit Agent to standard Replit environment completed
  - Project successfully running on PHP 8.2 development server
  - All static assets and API endpoints functioning properly
  - Session handling and authentication system operational
  - Enhanced schedule viewing functionality fully integrated

- June 13, 2025: Enhanced auto-scroll and page transitions across all pages
  - Smooth auto-scroll functionality when selecting dropdown options and form fields
  - Enhanced step-by-step navigation with fade and slide animations
  - Improved dashboard section transitions with opacity and transform effects
  - Added CSS keyframe animations for highlight focus and smooth transitions
  - Enhanced form field focus states with scaling and shadow effects
  - Professional navigation with hover and active state animations

- June 13, 2025: Added profile picture upload and store location functionality
  - Interactive profile picture with hover overlay and click-to-upload
  - File validation for image types and size limits (5MB max)
  - Store/pharmacy location dropdown in profile forms
  - Real-time image preview and localStorage persistence
  - Professional profile section layout with user info display

- June 13, 2025: Enhanced dropdown styling with gradient colors
  - Applied blue gradient background to all select elements
  - Added white text for better readability
  - Enhanced focus effects with glowing shadows
  - Consistent styling across registration and dashboard forms

- June 13, 2025: Added 3D animated video background to homepage using Three.js
  - Medical-themed 3D elements: floating crosses, DNA helix, heartbeat wave
  - Particle system with healthcare color palette
  - Smooth camera movements and element animations
  - Integrated with existing hero section styling

## Changelog

- June 13, 2025. Initial setup
- June 13, 2025. Migration from Replit Agent to standard Replit environment completed
- June 13, 2025. Added Three.js 3D video background feature

## User Preferences

Preferred communication style: Simple, everyday language.