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

   **Backend Configuration:**

   ```bash
   cd backend
   cp vcr-backend-sample.yml vcr-backend.yml
   ```

   - Update `application-id` with your VCR Application ID
   - For local development, set `FRONTEND_URL` to `http://localhost:3002`
   - For production deployment, you'll update `FRONTEND_URL` after deploying the frontend (see Deployment section)

   **Frontend Configuration:**

   ```bash
   cd frontend
   cp vcr-frontend-sample.yml vcr.yml
   ```

   - Update `application-id` with your VCR Application ID
   - No additional configuration needed for local development

   **Auto-Provided Environment Variables:**
   VCR automatically provides these when running `vcr debug` or `vcr deploy`:

   - `API_ACCOUNT_ID` - Your Vonage API Key
   - `API_ACCOUNT_SECRET` - Your Vonage API Secret
   - `VCR_API_APPLICATION_ID` - Your Application ID
   - `PRIVATE_KEY` - Your application private key for JWT generation

## Local Development

### Port Configuration

- **Backend**: Runs on port `3000` (VCR default)
- **Frontend**: Runs on port `3002` (configured in `package.json`)
- **CORS**: Backend accepts requests from `http://localhost:3002` in local development

### Running the Applications

Run both applications in separate terminal windows:

**Terminal 1 - Backend:**

```bash
cd backend
# Make sure FRONTEND_URL is set to http://localhost:3002 in vcr-backend.yml
vcr debug -y -f ./vcr-backend.yml
```

The backend API will be available at `http://localhost:3000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

The frontend UI will be available at `http://localhost:3002` and will automatically connect to the backend at `http://localhost:3000`

## Demo Instructions

### Quick Demo Walkthrough

Once both backend and frontend are running locally, follow these steps to demonstrate all features:

#### 1. Basic Phone Number Verification

**Test with a Vonage LVN number:**

1. Open the frontend at `http://localhost:3002`
2. In the "Identity Insights - Phone Match" section, enter:
   - **Phone Number**: `+12089908002`
3. Click **"Get Identity Insights"**

**Expected Results:**

- ✅ Format validation shows US/Idaho location
- ✅ Original carrier identified (Verizon Wireless)
- ⚠️ SIM swap/Roaming/Reachability show UNAUTHORIZED (requires Network Application)

#### 2. Test with Email/Name Matching

1. Enter the same phone number: `+12089908002`
2. Add optional fields:
   - **Email**: `test@example.com`
   - **Name**: `John Doe`
3. Click **"Get Identity Insights"**

**Results:** Same insights plus subscriber match attempts (will show UNAUTHORIZED without Network Application)

#### 3. Configure SIM Swap Period

1. Enter phone number: `+12089908002`
2. Change **SIM Swap Period** to `720` (30 days)
3. Click **"Get Identity Insights"**

**Results:** Backend will request SIM swap check for 720 hours instead of default 240

#### 4. Test Location Verification (Advanced)

1. Enter phone number: `+12089908002`
2. Click to expand **"Location Verification (Optional)"** accordion
3. Enter coordinates:
   - **Latitude**: `40.7128` (New York City)
   - **Longitude**: `-74.0060`
   - **Radius**: `50000` (50km)
4. Click **"Get Identity Insights"**

**Results:** Response includes `locationVerification` with UNAUTHORIZED status (requires Network Application to work)

#### 5. Test Subscriber Match KYC Fields (Advanced)

1. Enter phone number: `+12089908002`
2. Click to expand **"Subscriber Match - Detailed KYC (Optional)"** accordion
3. Fill in sample data:
   - **ID Document**: `123456789`
   - **Given Name**: `John`
   - **Family Name**: `Doe`
   - **Street Name**: `Main Street`
   - **Street Number**: `123`
   - **Postal Code**: `12345`
   - **Locality**: `New York`
   - **Region**: `NY`
   - **Country**: `US`
   - **Birthdate**: `1990-01-01`
4. Click **"Get Identity Insights"**

**Results:** Response includes `subscriberMatch` with detailed match results (UNAUTHORIZED without Network Application)

#### 6. Test Legacy Number Insight API

1. Scroll down to **"Number Insight API (Legacy)"** section
2. Enter phone number: `+12089908002`
3. Click **"Verify Number"**

**Results:** Basic number information using the older Number Insight Standard API

### Demo Scenarios

#### Scenario 1: Fraud Prevention

**Use Case:** Detect potential account takeover during login

1. Enter user's phone number
2. Set SIM Swap Period to `168` (7 days)
3. Check if SIM was recently swapped
4. **Action:** If swapped recently, trigger additional verification

#### Scenario 2: Identity Verification

**Use Case:** Verify user identity during registration

1. Enter phone number, email, and full name
2. Expand Subscriber Match section
3. Enter all available KYC data
4. **Action:** Use match scores to determine if identity is verified

#### Scenario 3: Location-Based Security

**Use Case:** Verify user is in expected location

1. Enter phone number
2. Expand Location Verification
3. Enter expected coordinates and radius
4. **Action:** Confirm device is within acceptable range

### Response Indicators

The UI shows responses with color coding:

- 🟢 **Green background**: Successful API response
- 🔴 **Red background**: Error occurred
- **Recent Responses**: Last 2 responses shown expanded
- **Older Responses**: Collapsed by default, click to expand

### Testing Different Phone Numbers

Try various number formats to test format validation:

- **US**: `+12089908002` or `12089908002`
- **UK**: `+447700900123`
- **International**: Include country code for accurate results

## Deployment

### Deployment Process

Deployment requires a two-step process due to the circular dependency between frontend and backend URLs:

### Step 1: Initial Backend Deployment

```bash
cd backend
# Deploy with temporary FRONTEND_URL (will update in Step 3)
vcr deploy -f ./vcr-backend.yml
```

**Save the deployed backend URL** (e.g., `https://your-app-backend.use1.runtime.vonage.cloud`)

### Step 2: Deploy Frontend with Backend URL

1. Update `BACKEND_URL` in `/frontend/src/App.js`:

   ```javascript
   const BACKEND_URL =
     process.env.NODE_ENV === "production"
       ? "https://your-app-backend.use1.runtime.vonage.cloud" // Your backend URL from Step 1
       : "http://localhost:3000";
   ```

2. Deploy the frontend:

   ```bash
   cd frontend
   vcr deploy -f ./vcr.yml
   ```

**Save the deployed frontend URL** (e.g., `https://your-app-frontend.use1.runtime.vonage.cloud`)

### Step 3: Update Backend with Frontend URL

1. Update `FRONTEND_URL` in `/backend/vcr-backend.yml`:

   ```yaml
   environment:
     - name: FRONTEND_URL
       value: "https://your-app-frontend.use1.runtime.vonage.cloud" # Your frontend URL from Step 2
   ```

2. Redeploy the backend:

   ```bash
   cd backend
   vcr deploy -f ./vcr-backend.yml
   ```

### Deployment Complete

Your application is now fully deployed with proper CORS configuration. Access the frontend at your deployed URL.

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

## Phone Number Validity

The Identity Insights API provides several ways to assess the validity of a phone number:

### 1. Format Validity

- Checks if the number is globally assignable and compliant with international standards.
- Use the `format.is_format_valid` field in the response.
- A valid format is necessary, but not sufficient, for reachability.

### 2. Carrier Assigned Validity

- Checks if the number is currently assigned to a carrier.
- Use `current_carrier.network_type` (should be `mobile`) and `original_carrier` for non-mobile numbers.
- If these fields are populated, the number is assigned to a carrier, but may not be assigned to a subscriber.

### 3. Reachability

- Checks if the number is currently reachable via voice, SMS, or data.
- Use the `reachability` insight for real-time connectivity status.
- Even if a number is valid and assigned, it may not be reachable (e.g., device off or out of service).

**Recommended approach:**

1. Validate format with `format.is_format_valid`.
2. Check carrier assignment with `current_carrier.network_type`.
3. Optionally, check real-time reachability with the `reachability` insight.

See the [Phone Number Validity Guide](https://developer.vonage.com/en/identity-insights/guides/phone-number-validity) for more details.

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

- `purpose` - Set to "FraudPreventionAndDetection" (required for Network Registry insights: SIM Swap, Roaming, Reachability, Location Verification, Subscriber Match)

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
│   ├── index.js                   # Express server with Identity Insights integration
│   ├── vcr-backend-sample.yml     # Sample configuration file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js                 # React application with Material-UI
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── vcr-frontend-sample.yml    # Sample configuration file
│   └── package.json
└── README.md
```

## Testing

### Test Phone Numbers

Use Vonage Long Virtual Numbers (LVN) for testing:

- Example: `+12089908002` (US, Idaho)
- Use international E.164 format: +[country code][number]

**Expected Results:**

- ✅ Format validation: OK
- ✅ Original carrier: Verizon Wireless
- ⚠️ Current carrier: NOT_FOUND (expected for LVN)
- ⚠️ SIM swap/Roaming/Reachability: UNAUTHORIZED (requires Network Application)

### Testing Recommendations

**Basic Testing (Without Network Application):**

- Test format validation with various phone numbers
- Verify original carrier lookup works
- Test configurable SIM swap period (1-2400 hours)
- Try location verification coordinates (will return UNAUTHORIZED but validates input)
- Test subscriber match fields (will return UNAUTHORIZED but validates input)

**Advanced Testing (With Network Application):**

- Test SIM swap detection with real mobile numbers
- Verify location-based device verification
- Test subscriber KYC matching with operator records
- Check roaming and reachability status

## Resources

### Vonage Identity Insights Documentation

- **[API Reference](https://developer.vonage.com/en/api/identity-insights)**
- **[Overview](https://developer.vonage.com/en/identity-insights/overview)**
- **[Use Cases Guide](https://developer.vonage.com/en/identity-insights/use-cases-guide)**
- **[Using Multiple Insights](https://developer.vonage.com/en/identity-insights/guides/using-multiple-insights)**
- **[Format Insight Guide](https://developer.vonage.com/en/identity-insights/guides/format)**
- **[Original Carrier Insight Guide](https://developer.vonage.com/en/identity-insights/guides/original-carrier)**
- **[Current Carrier Insight Guide](https://developer.vonage.com/en/identity-insights/guides/current-carrier)**
- **[SIM Swap Insight Guide](https://developer.vonage.com/en/identity-insights/guides/sim-swap)**
- **[Subscriber Match Insight Guide](https://developer.vonage.com/en/identity-insights/guides/subscriber-match)**
- **[Location Verification Insight Guide](https://developer.vonage.com/en/identity-insights/guides/location-verification)**
- **[Roaming Insight Guide](https://developer.vonage.com/en/identity-insights/guides/roaming)**
- **[Reachability Insight Guide](https://developer.vonage.com/en/identity-insights/guides/reachability)**
- **[Phone Number Validity Guide](https://developer.vonage.com/en/identity-insights/guides/phone-number-validity)**

### Additional Resources

- [VCR Documentation](https://developer.vonage.com/en/vcr) - Vonage Cloud Runtime setup and deployment guide
- [Vonage Dashboard](https://dashboard.nexmo.com/) - Create applications and manage credentials
- [JWT Authentication Guide](https://developer.vonage.com/en/getting-started/concepts/authentication#json-web-tokens-jwt) - Understanding JWT tokens for API authentication

## License

MIT
