# VCR React Express Monorepo - Vonage Identity Insights API Demo

A full-stack monorepo demonstrating the [Vonage Identity Insights API](https://developer.vonage.com/en/api/identity-insights) with a ReactJS frontend and ExpressJS backend, designed for deployment on Vonage Cloud Runtime (VCR).

## Overview

This demo application showcases the Vonage Identity Insights API, which provides real-time intelligence about phone numbers through multiple insights in a single API call:

### Available Insights

1. **Format Validation** - Validates phone number format and provides country information, time zones, and international/national formatting
2. **SIM Swap Detection** - Checks if a SIM card has been swapped within a specified time period (helps detect potential account takeover)
3. **Current Carrier** - Returns information about the network the number is currently assigned to (mobile only)
4. **Original Carrier** - Returns information about the network the number was initially assigned to based on the numbering plan
5. **Roaming Status** - Checks if the device is roaming and in which countries
6. **Reachability** - Verifies device connectivity status (connected for DATA and/or SMS)
7. **Location Verification** - Verifies if a device is within a specified geographical area (Developer Preview)
8. **Subscriber Match** - Compares user information against operator KYC records (Developer Preview)

The monorepo contains two separate applications:

- **Frontend** (`/frontend`): ReactJS application with Material-UI interface for testing Identity Insights API
- **Backend** (`/backend`): ExpressJS API server that integrates with Vonage Identity Insights API using JWT authentication

Each application has its own `vcr.yml` configuration file and must be run and deployed independently.

## Prerequisites

- [VCR (Vonage Cloud Runtime) CLI](https://developer.vonage.com/en/vcr)
- Node.js and npm
- VCR Application ID with Identity Insights API access
- VCR automatically provides credentials when running `vcr debug` or `vcr deploy`

## Setup

1. **Create a Vonage Application:**

   - Sign up at [Vonage Dashboard](https://dashboard.nexmo.com/)
   - Create a new application with Identity Insights API access
   - Note your Application ID (VCR will automatically provide credentials)

2. **Install dependencies** in both directories:

   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Configure VCR files** using the provided samples as reference:
   - Copy `vcr-frontend-sample.yml` to `vcr.yml` in the frontend directory
   - Copy `vcr-backend-sample.yml` to `vcr-backend.yml` in the backend directory
   - Update the `application-id` in both files with your VCR Application ID
   - VCR automatically provides these environment variables when running:
     - `API_ACCOUNT_ID` - Your Vonage API Key
     - `API_ACCOUNT_SECRET` - Your Vonage API Secret
     - `VCR_API_APPLICATION_ID` - Your Application ID
     - `PRIVATE_KEY` - Your application private key for JWT generation

## Local Development

Run both applications in separate terminal windows:

**Terminal 1 - Backend:**

```bash
cd backend
vcr debug -y -f ./vcr-backend.yml
```

The backend will run on `http://localhost:3000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3002`

## Deployment

### 1. Deploy Backend

```bash
cd backend
vcr deploy -f ./vcr-backend.yml
```

Note the deployed backend URL.

### 2. Deploy Frontend

1. Update `BACKEND_URL` in `/frontend/src/App.js` with your deployed backend URL
2. Update `FRONTEND_URL` in `/backend/vcr-backend.yml` with your frontend URL (you may need to deploy twice to get the URL)
3. Deploy:

   ```bash
   cd frontend
   vcr deploy -f ./vcr.yml
   ```

## Features

### Phone Match

Test phone number verification with optional email and name matching:

- **Phone Number** (required): Enter with country code (e.g., +12089908002)
- **Email** (optional): Email address to match against phone number
- **Name** (optional): Full name to match against phone number

**Returns:**

- Match score (0-100) based on available insights
- Format validation (country, location, time zones)
- SIM swap status (if authorized)
- Current and original carrier information
- Roaming status (if authorized)
- Reachability status (if authorized)

### Number Verify

Get comprehensive information about any phone number:

- **Phone Number** (required): Enter with country code

**Returns:**

- Format validation and international/national formatting
- Country and regional information
- Carrier/network details (current and original)
- Network type (mobile, landline, etc.)
- Time zone information
- Reachability and connectivity status

## API Endpoints

### Backend API Routes

#### `POST /api/identity/phone-match`

Match phone number with email/name and retrieve comprehensive insights.

**Request Body:**

```json
{
  "phoneNumber": "+12089908002",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Identity Insights verification result",
  "requestId": "aaaaaaaa-bbbb-cccc-dddd-0123456789ab",
  "data": {
    "phoneNumber": "+12089908002",
    "matchScore": 70,
    "format": {
      "isValid": true,
      "countryCode": "US",
      "countryName": "United States",
      "international": "+12089908002",
      "national": "(208) 990-8002"
    },
    "simSwap": {
      "isSwapped": false,
      "latestSimSwapAt": "2024-07-08T09:30:27.504Z"
    },
    "currentCarrier": {
      "name": "Verizon Wireless",
      "networkType": "MOBILE",
      "countryCode": "US"
    },
    "originalCarrier": {
      "name": "Verizon Wireless",
      "networkType": "MOBILE"
    },
    "roaming": {
      "isRoaming": false
    },
    "reachability": {
      "isReachable": true,
      "connectivity": ["DATA", "SMS"]
    }
  }
}
```

#### `POST /api/identity/number-verify`

Verify phone number details.

**Request Body:**

```json
{
  "phoneNumber": "+12089908002"
}
```

## Identity Insights API Details

### Authentication

The backend uses JWT (JSON Web Token) authentication with the Vonage Identity Insights API:

- JWT tokens are generated using the RS256 algorithm
- Tokens include: `application_id`, `iat` (issued at), `exp` (expiration), `jti` (unique ID)
- Private key is provided automatically by VCR via the `PRIVATE_KEY` environment variable

### Insight Status Codes

Each insight in the response includes a status code:

- **OK** - All insight attributes are available
- **PARTIAL_SUCCESS** - Some attributes were omitted
- **NOT_FOUND** - Information could not be found for this number
- **UNAUTHORIZED** - Request not authorized (requires Network Application)
- **INVALID_PURPOSE** - Purpose parameter is invalid or not allowed
- **NO_COVERAGE** - Country or network not supported
- **INVALID_NUMBER_FORMAT** - Phone number format is invalid
- **SUPPLIER_ERROR** - Supplier returned an error
- **INTERNAL_ERROR** - Internal processing error

### Network Application Requirements

Some insights require a Network Application to be associated with your Vonage Application:

- **SIM Swap** - Requires production network registry with purpose "FraudPreventionAndDetection"
- **Roaming** - Requires Network Application authorization
- **Reachability** - Requires Network Application authorization
- **Location Verification** - Requires Network Application authorization
- **Subscriber Match** - Requires Network Application authorization

Without a Network Application, these insights will return `UNAUTHORIZED` status.

## Project Structure

```text
.
├── backend/
│   ├── index.js                    # Express server with Identity Insights integration
│   ├── vcr-backend.yml            # Backend VCR configuration
│   ├── vcr-backend-sample.yml     # Sample configuration file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js                 # React application with Material-UI
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── vcr.yml                    # Frontend VCR configuration
│   ├── vcr-frontend-sample.yml    # Sample configuration file
│   └── package.json
└── README.md
```

## Technical Implementation

### Backend (Express.js)

- Uses `@vonage/server-sdk` and `@vonage/auth` for Vonage API integration
- JWT token generation using `jsonwebtoken` library with RS256 algorithm
- CORS enabled for local development
- Identity Insights API endpoint: `https://api-eu.vonage.com/v0.1/identity-insights`

**Key Features:**

- Automatic credential detection from VCR environment variables
- Comprehensive error handling with detailed status messages
- Match score calculation based on multiple data points
- Structured response formatting for all insights

### Frontend (React + Material-UI)

- Material-UI v7 for modern, responsive interface
- Axios for HTTP requests
- Real-time response display with expandable history
- Color-coded status indicators (green for success, red for errors)
- Form validation and user-friendly error messages

## Testing

### Test Phone Number

Use Vonage Long Virtual Numbers (LVN) for testing:

- Example: `+12089908002` (US, Idaho)

**Expected Results:**

- ✅ Format validation: OK
- ✅ Original carrier: Verizon Wireless
- ⚠️ Current carrier: NOT_FOUND (expected for LVN)
- ⚠️ SIM swap/Roaming/Reachability: UNAUTHORIZED (requires Network Application)

## Resources

- [Vonage Identity Insights API Documentation](https://developer.vonage.com/en/api/identity-insights)
- [VCR Documentation](https://developer.vonage.com/en/vcr)
- [Vonage Dashboard](https://dashboard.nexmo.com/)

## License

MIT
