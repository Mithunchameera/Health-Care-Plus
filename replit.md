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

- June 21, 2025: Created dedicated doctor profile pages for individual doctor details
  - Built doctor-profile.html with comprehensive layout for doctor information display
  - Added doctor-profile-page.js with complete profile rendering functionality
  - Created doctor-profile.css with professional styling and responsive design
  - Modified "View Profile" buttons to navigate to separate pages instead of modal popups
  - Enhanced user experience with dedicated pages showing detailed doctor information
  - Implemented navigation breadcrumbs and back button functionality
  - Added quick action buttons for booking appointments directly from profile pages

- June 21, 2025: Fixed doctor booking process database connection issues
  - Removed PostgreSQL database dependency causing booking failures
  - Updated patient-api.php to use mock data for immediate functionality
  - Fixed getDoctors, getAvailableSlots, and bookAppointment API endpoints
  - Enhanced booking.js to use correct API endpoints for time slots and confirmations
  - Added comprehensive doctor data with 6 specialists covering major medical fields
  - Implemented complete booking flow from doctor selection to appointment confirmation
  - All booking functionality now works without database connectivity requirements

- June 21, 2025: Completed migration from Replit Agent to standard Replit environment
  - Successfully migrated HealthCare+ project with all functionality intact
  - PHP development server running properly on port 5000
  - All static assets, API endpoints, and authentication system operational
  - Fixed register form icon positioning and text alignment with proper spacing (icons at 1.2rem, text at 3rem padding)
  - Added Three.js video background to register page with medical-themed 3D elements
  - Redesigned register page to match consistent styling across all HealthCare+ pages
  - Updated register page to use modern-auth-section layout with proper navigation and theme integration
  - Changed register form to use floating labels matching login page exactly
  - Updated Create Account button to match login page styling with arrow icon
  - Maintained form functionality while improving visual consistency with login and other pages
  - Resolved Three.js deprecation warnings (informational only, no impact on functionality)
  - All migration checklist items completed successfully

- June 21, 2025: Successfully redesigned register page with modern glassmorphism design
  - Created completely new register.html with professional styling matching HealthCare+ brand
  - Implemented glassmorphism design with floating animated shapes and gradient backgrounds
  - Added comprehensive form sections with icons, visual feedback, and smooth animations
  - Integrated password strength checker with real-time validation and color-coded feedback
  - Created features showcase highlighting platform benefits (secure, 24/7 support, expert doctors)
  - Enhanced form validation with proper error notifications and user-friendly messages
  - Resolved JavaScript duplicate class declaration errors by streamlining script includes
  - Applied consistent blue and white color scheme throughout the registration interface
  - Mobile-responsive design with optimized layouts for all screen sizes

- June 20, 2025: Fixed all button linking problems and navigation issues across the platform
  - Corrected dashboard navigation buttons to use proper window.patientDashboard reference
  - Fixed sidebar link navigation with proper section targeting and error handling  
  - Enhanced appointment table buttons with proper onclick functionality
  - Added missing loadBookingDoctors method with doctor pre-selection support
  - Improved appointment viewing with modal dialogs and payment redirection
  - Fixed syntax errors causing JavaScript execution problems
  - Enhanced logout functionality with proper session cleanup
  - All navigation now works seamlessly within dashboard environment

- June 20, 2025: Redesigned doctor profile cards with modern component architecture
  - Created doctor-card-component.js with reusable card designs
  - Modern circular avatars with availability indicators and gradient backgrounds
  - Compact and full card variants for different use cases
  - Interactive profile modals with detailed doctor information
  - Smooth hover animations and visual feedback
  - Responsive design optimized for mobile and desktop
  - Global functions for consistent booking and profile viewing

- June 20, 2025: Added comprehensive auto-scroll functionality across all pages
  - Created auto-scroll-manager.js with smooth scrolling between form fields
  - Automatic progression when selecting dropdown options (specialty, doctor, designation)
  - Visual feedback with highlight animations and smooth transitions
  - Keyboard navigation support with Tab key auto-scrolling
  - Enhanced form field focus states with animated outlines
  - Integrated across all pages: contact, booking, registration, dashboards, payment
  - Smart next-field detection for logical form progression

- June 20, 2025: Successfully migrated project from Replit Agent to standard Replit environment
  - Fixed querySelector DOMException error with invalid '#' selector validation
  - Added comprehensive language selector with English and Sinhala support
  - Implemented bilingual translation system with complete Sinhala translations
  - Resolved content visibility issues with proper z-index layering
  - All Node.js packages installed and PHP server running properly

- June 20, 2025: Completed comprehensive Three.js video backgrounds and enhanced animations across entire system
  - Implemented Three.js video backgrounds on all pages: homepage, about, contact, login, register, booking, dashboards, payment pages
  - Added unique video background containers (hero-video-background, about-video-background, contact-video-background, login-video-background, register-video-background, booking-video-background, admin-video-background, doctor-video-background, patient-video-background, payment-video-background, success-video-background)
  - Enhanced animations system with comprehensive CSS keyframes and JavaScript controllers
  - Medical-themed 3D elements: floating crosses, DNA helix, heartbeat waves, particle systems
  - Integrated enhanced-animations.js and three-video-background.js across all pages
  - Professional fade-in, slide-up, scale, and glow animations for all UI components
  - Smooth transitions and hover effects throughout the entire system
  - Maintained blue and white color consistency in all 3D animations

- June 20, 2025: Implemented comprehensive blue and white color scheme throughout entire system
  - Converted all color variables to use only blue (#2563eb, #3b82f6, #1d4ed8) and white (#ffffff, #f8fafc) colors
  - Updated both light and dark theme variants to maintain blue and white consistency
  - Transformed all button styles (primary, secondary, success) to use blue gradients and white backgrounds
  - Modified dropdown lists, form elements, and interactive components to blue/white scheme
  - Updated password strength indicators, search elements, and filter components
  - Applied blue and white styling to all dashboard pages (admin, doctor, patient)
  - Maintained accessibility with proper contrast ratios throughout color transformation
  - Ensured consistent visual identity across all pages and components

- June 19, 2025: Implemented comprehensive dropdown lists styling with dark theme integration
  - Applied universal dark background (#0a0a0a) with white text to all dropdown lists across entire website
  - Completely removed dropdown arrow icons using cross-browser CSS overrides (appearance: none, -webkit-appearance, -moz-appearance, -ms-appearance)
  - Added universal selectors targeting all select elements regardless of class or ID names
  - Implemented comprehensive CSS with !important declarations to override any conflicting styles
  - Enhanced hover effects with lighter dark background (#1a1a1a) for better user interaction
  - Applied styling to all pages: contact, booking, registration, admin dashboard, doctor dashboard, patient dashboard
  - Used attribute selectors to catch dynamically generated dropdowns and filter elements
  - Added vendor-specific pseudo-element removal for complete arrow elimination

- June 19, 2025: Created comprehensive doctor profile management system with photo upload
  - Interactive profile photo upload with click-to-change functionality and hover overlay effects
  - Enhanced profile form with organized sections: personal info, contact details, professional qualifications
  - Added practice information fields including consultation fees, services offered, and availability settings
  - Implemented photo validation (image file types and 5MB size limit) with user feedback
  - Profile data persistence using localStorage with reset functionality
  - Real-time sidebar avatar updates when profile photo is changed
  - Professional styling with dark theme integration and responsive design
  - Comprehensive form fields: specialty selection, license numbers, certifications, languages, bio

- June 19, 2025: Applied comprehensive dark color palette across all pages
  - Enhanced dark theme with deeper black backgrounds (#0a0a0a vs #121212)
  - Updated primary colors to refined blue tones (#3b82f6)
  - Applied consistent dark styling to all components: forms, cards, modals, tables
  - Added hover effects and glowing accents for improved user experience
  - Implemented dark theme for all pages: homepage, about, contact, login, register, booking, dashboards
  - Enhanced scrollbars, notifications, and interactive elements with dark palette
  - Maintained accessibility with proper contrast ratios

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