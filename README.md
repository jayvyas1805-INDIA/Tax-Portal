# Tax Partner Management Platform

A production-oriented partner management and tax-services platform built with a modern JavaScript stack. The application provides secure partner onboarding, KYC and banking verification, referral and commission management, partner dashboards, administrative controls, notifications, and document management.

The platform is designed around a separate frontend/backend architecture, with the frontend built using React + Vite and the backend powered by Node.js, Express, MongoDB, and Mongoose.

---

## Overview

The Tax Partner Management Platform enables organizations to manage their partner ecosystem throughout the complete partner lifecycle:

- Partner registration and onboarding
- Multi-step profile completion
- KYC document submission and verification
- Banking information verification
- Partner tier management
- Referral tracking
- Commission calculation and rules
- Partner dashboard and analytics
- Administrative partner management
- Notifications
- Secure document storage
- Account and security management

The application follows a modular frontend/backend architecture so that the client and server can be developed, deployed, and scaled independently.

---

## Key Features

### Partner Management

- Partner registration and authentication
- Multi-step partner onboarding
- Personal information management
- Professional information management
- Address management
- Partner profile management
- Partner account status management
- Partner tier management
- Partner application review

### KYC Management

Partners can submit verification documents including:

- PAN Card
- Aadhaar Card
- Live Photograph

Administrators can:

- View submitted documents
- Preview documents
- Approve documents
- Reject documents
- Add administrative remarks
- Track document verification status
- Review overall KYC status

### Banking Verification

The platform supports:

- Bank account information
- Account holder name
- Bank name
- Branch
- Account number
- IFSC code
- Account type
- Cancelled cheque upload
- Banking verification
- Admin remarks

Banking information is treated as sensitive data and access is restricted according to application authorization rules.

### Partner Tiers

Partners can belong to different tiers:

- Emerging Bronze
- Standard Silver
- Strategic Gold

The partner tier determines which commission rule applies when eligible referrals are converted.

### Referral & Commission Management

The platform supports commission-oriented workflows including:

- Referral tracking
- Commission rules
- Tier-based commission configuration
- Commission calculations
- Commission dashboard statistics
- Referral trends
- Commission charts
- Administrative commission configuration

### Admin Dashboard

Administrators can manage:

- Partners
- Partner applications
- KYC verification
- Banking verification
- Partner tiers
- Commission configuration
- Notifications
- System configuration
- Dashboard analytics

### Notifications

The system supports application-level notifications for important partner and administrative events.

Examples include:

- KYC status changes
- Banking verification updates
- Commission-related events
- Partner status changes
- Administrative actions

### Authentication & Security

The backend implements authentication and account security mechanisms including:

- JWT-based authentication
- Password hashing with bcrypt
- Refresh token handling
- Email verification
- Password reset flow
- Role-based access
- Protected administrative routes
- Protected partner routes
- Account activation controls
- Login history
- Session tracking

---

# Technology Stack

## Frontend

- React
- Vite
- JavaScript / JSX
- CSS
- Axios
- React Router
- Charting / dashboard visualization libraries
- Cloudinary-hosted media

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary
- REST APIs

## Infrastructure / Services

- MongoDB / MongoDB Atlas
- Cloudinary
- Vercel / equivalent frontend hosting
- Render / equivalent backend hosting
- Git / GitHub

---

# Architecture

The application follows a decoupled client-server architecture.

```text
                    ┌─────────────────────┐
                    │      End User       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + Vite        │
                    │ Frontend            │
                    └──────────┬──────────┘
                               │
                         REST / JSON
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │ Backend API         │
                    └───────┬─────┬───────┘
                            │     │
               ┌────────────┘     └────────────┐
               ▼                               ▼
      ┌─────────────────┐             ┌─────────────────┐
      │ MongoDB         │             │ Cloudinary      │
      │ Application Data│             │ Documents/Media │
      └─────────────────┘             └─────────────────┘