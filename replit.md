# AI Occupancy Translator - Replit Project Guide

## Overview

This is a full-stack web application that serves as an AI-powered occupancy code translator for an insurance platform. The system helps internal sales agents translate customer business descriptions into accurate technical "Workmen Compensation Occupancy" codes using OpenAI's GPT-4o model.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Style**: RESTful endpoints with JSON responses
- **Middleware**: Custom logging, JSON parsing, and error handling
- **Development**: Hot reload with Vite integration in development mode

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Neon serverless PostgreSQL (configured via DATABASE_URL)
- **Connection**: Connection pooling with @neondatabase/serverless
- **Schema**: Centralized schema definition with relations and validations

## Key Components

### AI Integration
- **Provider**: Google Gemini 2.5 Pro model for business description analysis
- **Core Function**: Translate plain language business descriptions to occupancy codes
- **Input Processing**: Supports English, Hindi, and Hinglish descriptions
- **Output Format**: Structured JSON with suggestions, reasoning, and confidence levels
- **Feedback Loop**: Correction system to improve AI accuracy over time

### Database Schema
- **Users**: Basic user authentication and management
- **Occupancy Codes**: Master list of valid occupancy codes with descriptions
- **Analyses**: Stores AI analysis results with suggestions and reasoning
- **Feedback**: Tracks positive/negative feedback and corrections for continuous improvement

### API Endpoints
- `POST /api/analyze` - Analyze business descriptions and return occupancy suggestions
- `POST /api/feedback` - Submit feedback (positive/negative) on AI suggestions
- `GET /api/occupancy-codes` - Retrieve master list of occupancy codes
- `GET /api/stats` - Get analysis statistics and performance metrics
- `GET /api/recent-corrections` - Fetch recent correction feedback for learning

### User Interface Components
- **BusinessDescriptionInput**: Form for entering business descriptions
- **AnalysisResults**: Display AI suggestions with confidence indicators
- **CorrectionModal**: Interface for providing correction feedback
- **Sidebar**: Statistics dashboard and recent corrections view
- **Header**: Application branding and user context

## Data Flow

1. **Input Phase**: User enters business description in multiple languages
2. **AI Analysis**: System sends description to OpenAI with master occupancy list context
3. **Processing**: AI returns structured suggestions with reasoning and confidence
4. **Storage**: Analysis results stored in database for tracking and learning
5. **Display**: Results shown to user with feedback options
6. **Feedback Loop**: User provides positive/negative feedback, corrections stored for improvement
7. **Learning**: System uses correction history to improve future suggestions

## External Dependencies

### Core Dependencies
- **OpenAI API**: GPT-4o model for natural language processing
- **Neon Database**: Serverless PostgreSQL hosting
- **Radix UI**: Headless UI components for accessibility
- **TanStack Query**: Server state management and caching

### Development Tools
- **Vite**: Build tool with hot reload and optimization
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Production bundling for server code
- **TypeScript**: Type safety across frontend and backend

### Styling and UI
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library with consistent design
- **Lucide Icons**: Icon library for UI elements

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public` directory
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Shared Code**: TypeScript compilation for shared schemas and types

### Environment Configuration
- **Development**: Uses tsx for hot reload and Vite dev server
- **Production**: Compiled JavaScript with Node.js runtime
- **Database**: Environment variable configuration for connection string

### Monorepo Structure
- `client/`: Frontend React application
- `server/`: Backend Express.js API
- `shared/`: Common types, schemas, and utilities
- Root level configuration files for build tools and dependencies

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `GEMINI_API_KEY`: Google Gemini API access key (required)
- `NODE_ENV`: Environment mode (development/production)

The application follows a clean separation of concerns with shared TypeScript types ensuring type safety across the full stack. The AI-powered core functionality is wrapped in a user-friendly interface designed for insurance agents to quickly and accurately translate business descriptions into technical occupancy codes.