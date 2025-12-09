# VCR React Express Monorepo - Vonage Identity Insights API Demo

A full-stack monorepo demonstrating the [Vonage Identity Insights API](https://developer.vonage.com/en/api/identity-insights) with a ReactJS frontend and ExpressJS backend, designed for deployment on Vonage Cloud Runtime (VCR).

## Overview

This demo application showcases the Vonage Identity Insights API, which provides real-time intelligence about phone numbers through multiple insights in a single API call:

### Available Insights (All 8 Supported)

This demo provides complete coverage of all Identity Insights API features:

#### Core Insights (Beta Features)

1. **Format Validation** - Validates phone number format and provides country information, time zones, and international/national formatting
2. **SIM Swap Detection** - Checks if a SIM card has been swapped within a configurable time period (1-2400 hours, default 240). Helps detect potential account takeover attempts
3. **Current Carrier** - Returns real-time information about the network the number is currently assigned to (mobile only)
4. **Original Carrier** - Returns information about the network the number was initially assigned to based on the numbering plan prefix

#### Advanced Insights (Developer Preview Features)

5. **Roaming Status** - Checks if the device is roaming and identifies the countries where roaming is occurring
6. **Reachability** - Verifies device connectivity status (connected for DATA and/or SMS)
7. **Location Verification** - Verifies if a device is within a specified geographical area using circle-based location matching (radius: 2-200km)
8. **Subscriber Match** - Compares user-provided information (ID document, name, address, birthdate) against operator KYC records with 11 matchable fields

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

### Identity Insights - Phone Match

Comprehensive phone number verification with all 8 available insights:

#### Basic Fields (Always Requested)

- **Phone Number** (required): Enter with country code (e.g., +12089908002)
- **Email** (optional): Email address for basic matching
- **Name** (optional): Full name for basic matching
- **SIM Swap Period** (optional): Hours to check for SIM swap (1-2400, default 240)

#### Advanced Features (Expandable Sections)

**Location Verification (Developer Preview)**

- Latitude (-90 to 90)
- Longitude (-180 to 180)
- Radius (2,000 to 200,000 meters)
- Returns: TRUE/FALSE/UNKNOWN/PARTIAL verification status

**Subscriber Match - Detailed KYC (Developer Preview)**

- ID Document number
- Given Name & Family Name
- Complete address fields (street, number, postal code, locality, region, country)
- House number extension (apartment/suite)
- Birthdate (YYYY-MM-DD)
- Returns: Match levels (EXACT, HIGH, PARTIAL, LOW, NONE, DATA_UNAVAILABLE)

#### Response Data

All requests return comprehensive insights:

- Match score (0-100) based on available data points
- Format validation with country, location, and time zone details
- SIM swap detection within specified period
- Current and original carrier information
- Roaming status and country codes
- Reachability and connectivity status (DATA/SMS)
- Location verification results (if requested)
- Subscriber match results for each KYC field (if requested)

### Number Insight API (Legacy)

Basic number verification using the older Number Insight Standard API:

- **Phone Number** (required): Enter with country code
- Returns: Basic carrier information, validity status, and country details

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

### Supported Request Parameters

This demo supports **100% of the Identity Insights API parameters**:

#### Required Parameters

- `phone_number` - Phone number to verify (E.164 format recommended)
- `insights` - At least one insight must be requested

#### Optional Parameters

- `purpose` - Set to "FraudPreventionAndDetection" (required for Network Registry insights)

#### Insight Configuration

- **format** - Empty object `{}`
- **sim_swap** - `period` (1-2400 hours, configurable via UI)
- **current_carrier** - Empty object `{}`
- **original_carrier** - Empty object `{}`
- **roaming** - Empty object `{}`
- **reachability** - Empty object `{}`
- **location_verification** - `type`, `radius`, `center.latitude`, `center.longitude`
- **subscriber_match** - Up to 11 KYC fields (id_document, names, address, birthdate)

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

### Vonage Identity Insights Documentation

- **[API Reference](https://developer.vonage.com/en/api/identity-insights)** - Complete API specification with request/response schemas and examples
- **[Overview](https://developer.vonage.com/en/identity-insights/overview)** - Introduction to Identity Insights features and capabilities
- **[Use Cases Guide](https://developer.vonage.com/en/identity-insights/use-cases-guide)** - Real-world implementation examples and best practices

### Additional Resources

- [VCR Documentation](https://developer.vonage.com/en/vcr) - Vonage Cloud Runtime setup and deployment guide
- [Vonage Dashboard](https://dashboard.nexmo.com/) - Create applications and manage credentials
- [JWT Authentication Guide](https://developer.vonage.com/en/getting-started/concepts/authentication#json-web-tokens-jwt) - Understanding JWT tokens for API authentication

## Support

For issues or questions:

- Check the [API Reference](https://developer.vonage.com/en/api/identity-insights) for detailed parameter information
- Review the [Use Cases Guide](https://developer.vonage.com/en/identity-insights/use-cases-guide) for implementation patterns
- Visit [Vonage Developer Portal](https://developer.vonage.com/) for comprehensive documentation

## License

MIT
