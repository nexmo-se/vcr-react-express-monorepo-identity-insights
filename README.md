# VCR React Express Monorepo - Vonage Identity Insights API Demo

A full-stack monorepo demonstrating the [Vonage Identity Insights API](https://developer.vonage.com/en/identity-insights/overview?source=identity-insights) with a ReactJS frontend and ExpressJS backend, designed for deployment on Vonage Cloud Runtime (VCR).

## Overview

This demo application showcases two main Identity Insights features:

1. **Phone Match** - Verify if a phone number matches the provided email and/or name
2. **Number Verify** - Get detailed information about a phone number including carrier, line type, and validity

The monorepo contains two separate applications:

- **Frontend** (`/frontend`): ReactJS application with Material-UI interface for testing Identity Insights API
- **Backend** (`/backend`): ExpressJS API server that integrates with Vonage Identity Insights API

Each application has its own `vcr.yml` configuration file and must be run and deployed independently.

## Prerequisites

- [VCR (Vonage Cloud Runtime) CLI](https://developer.vonage.com/en/vcr)
- Node.js and npm
- Two VCR Application IDs (one for frontend, one for backend)
- Vonage API Key and Secret (for Identity Insights API access)

## Setup

1. **Get Vonage API Credentials:**

   - Sign up at [Vonage Dashboard](https://dashboard.nexmo.com/)
   - Get your API Key and API Secret from the dashboard
   - Note: The app will work with mock data if credentials are not configured

2. **Install dependencies** in both directories:

   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Initialize VCR applications** in both directories:

   ```bash
   # In frontend directory
   cd frontend
   vcr init

   # In backend directory
   cd backend
   vcr init
   ```

4. **Configure VCR files** using the provided samples as reference:
   - Copy `vcr-frontend-sample.yml` to `vcr-frontend.yml` in the frontend directory
   - Copy `vcr-backend-sample.yml` to `vcr-backend.yml` in the backend directory
   - Update the following in both files:
     - `application-id`: Your VCR Application ID
     - In backend `vcr.yml`, add your Vonage credentials:
       - `VONAGE_API_KEY`: Your Vonage API Key
       - `VONAGE_API_SECRET`: Your Vonage API Secret

## Local Development

Run both applications in separate terminal windows:

**Terminal 1 - Backend:**

```bash
cd backend
vcr debug -y -f ./vcr-backend.yml
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

## Deployment

### 1. Deploy Backend

```bash
cd backend
vcr deploy
```

Note the deployed backend URL.

### 2. Deploy Frontend

1. Update `BACKEND_URL` in `/frontend/src/App.js` with your deployed backend URL
2. Update `FRONTEND_URL` in `/backend/vcr.yml` with your frontend URL (you may need to deploy twice to get the URL)
3. Deploy:

   ```bash
   cd frontend
   vcr deploy
   ```

## Features

### Phone Match

- Enter a phone number (with country code)
- Optionally add email and/or name
- Get a match score indicating how well the provided information matches the phone number
- Useful for verifying user identity during registration or login

### Number Verify

- Enter a phone number (with country code)
- Get detailed information including:
  - Validity status
  - Country information
  - Carrier/network information
  - Line type (mobile, landline, VoIP)
  - Porting status
  - Roaming status
  - Reachability

## API Endpoints

### Backend API Routes

- `POST /api/identity/phone-match` - Match phone number with email/name

  ```json
  {
    "phoneNumber": "+1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
  ```

- `POST /api/identity/number-verify` - Verify phone number details
  ```json
  {
    "phoneNumber": "+1234567890"
  }
  ```

## Mock Mode

If `VONAGE_API_KEY` and `VONAGE_API_SECRET` are not configured in the backend, the application will operate in mock mode, returning simulated data for demonstration purposes. This allows you to test the UI without needing actual API credentials.

## Project Structure

```text
.
├── backend/
│   ├── index.js              # Express server entry point
│   ├── vcr.yml               # Backend VCR configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   └── App.js            # React application
│   ├── vcr.yml               # Frontend VCR configuration
│   └── package.json
└── README.md
```
