import { Vonage } from "@vonage/server-sdk";
import { Assets, vcr, State } from "@vonage/vcr-sdk";
import { Auth } from "@vonage/auth";
import express from "express";
import axios from "axios";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();

const frontendUrl = process.env.FRONTEND_URL || "*"; // fallback for local/dev

app.use(
  cors({
    origin: frontendUrl,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

const port = process.env.VCR_PORT;

// VCR Providers
const session = vcr.createSession();
const assets = new Assets(vcr.getGlobalSession());
const state = new State(vcr.getGlobalSession());

// Get the VCR instance service name from the environment
const instanceServiceName = process.env.INSTANCE_SERVICE_NAME;
let VCR_URL = "";
if (instanceServiceName) {
  VCR_URL = `https://${instanceServiceName}.use1.runtime.vonage.cloud`;
  console.log("VCR_URL:", VCR_URL);
} else {
  console.log("INSTANCE_SERVICE_NAME not set in environment.");
}

app.use(express.json());
app.use(express.static("public"));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/_/health", async (req, res) => {
  res.sendStatus(200);
});

app.get("/_/metrics", async (req, res) => {
  res.sendStatus(200);
});

// Log environment variables for debugging
console.log("\n=== Environment Variables ===");
// console.log(process.env);
console.log("API_ACCOUNT_ID:", process.env.API_ACCOUNT_ID);
console.log("API_ACCOUNT_SECRET:", process.env.API_ACCOUNT_SECRET);
console.log("VCR_API_APPLICATION_ID:", process.env.VCR_API_APPLICATION_ID);
// console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
if (process.env.PRIVATE_KEY) {
  console.log(
    "PRIVATE_KEY (first 100 chars):",
    process.env.PRIVATE_KEY.substring(0, 100)
  );
}
console.log("\n");

// Initialize Vonage client
// VCR automatically provides these from the application configuration
const vonageApiKey = process.env.API_ACCOUNT_ID;
const vonageApiSecret = process.env.API_ACCOUNT_SECRET;
const vonageApplicationId = process.env.VCR_API_APPLICATION_ID;
const vonagePrivateKey = process.env.PRIVATE_KEY;

console.log("Initializing Vonage client...");
console.log("API Key available:", !!vonageApiKey);
console.log("API Secret available:", !!vonageApiSecret);
console.log("Application ID available:", !!vonageApplicationId);
console.log("Private Key available:", !!vonagePrivateKey);

let vonage = null;
if (vonageApiKey && vonageApiSecret) {
  const config = {
    apiKey: vonageApiKey,
    apiSecret: vonageApiSecret,
  };

  // Add application credentials if available for JWT-based APIs
  if (vonageApplicationId && vonagePrivateKey) {
    config.applicationId = vonageApplicationId;
    config.privateKey = vonagePrivateKey;
    console.log(
      "✅ Vonage client initialized with application credentials (JWT enabled)"
    );
  } else {
    console.log(
      "⚠️  Vonage client initialized (API Key/Secret only - JWT APIs not available)"
    );
  }

  vonage = new Vonage(config);
} else {
  console.warn(
    "❌ API credentials not found. Identity Insights features will return mock data."
  );
}

// API Routes

// Test endpoint to verify routing
app.get("/api/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({ success: true, message: "Backend is working!" });
});

// Phone Match endpoint - verifies if a phone number matches the provided details
app.post("/api/identity/phone-match", async (req, res) => {
  console.log("Phone Match endpoint hit with body:", req.body);
  try {
    const {
      phoneNumber,
      email,
      name,
      simSwapPeriod,
      // Location verification fields
      latitude,
      longitude,
      radius,
      // Subscriber match fields
      idDocument,
      givenName,
      familyName,
      streetName,
      streetNumber,
      postalCode,
      locality,
      region,
      country,
      houseNumberExtension,
      birthdate,
    } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    // If Vonage client is not initialized, return mock data
    if (!vonage) {
      return res.json({
        success: true,
        message: "Mock response (API credentials not configured)",
        timestamp: new Date().toISOString(),
        data: {
          phoneNumber,
          matchScore: Math.floor(Math.random() * 100),
          status: "mock",
          email: email
            ? {
                match: Math.random() > 0.5,
                score: Math.floor(Math.random() * 100),
              }
            : undefined,
          name: name
            ? {
                match: Math.random() > 0.5,
                score: Math.floor(Math.random() * 100),
              }
            : undefined,
        },
      });
    }

    // Use Identity Insights API
    console.log("Calling Identity Insights API for:", phoneNumber);

    // Generate JWT token for authentication
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      application_id: vonageApplicationId,
      iat: now,
      exp: now + 3600, // 1 hour expiry
      jti: Math.random().toString(36).substring(2),
    };

    const jwtToken = jwt.sign(jwtPayload, vonagePrivateKey, {
      algorithm: "RS256",
    });

    console.log("JWT token generated successfully");

    // Build insights request based on provided parameters
    const insightsRequest = {
      format: {},
      sim_swap: {
        period: simSwapPeriod ? parseInt(simSwapPeriod) : 240,
      },
      current_carrier: {},
      original_carrier: {},
      roaming: {},
      reachability: {},
    };

    // Add location_verification if coordinates provided
    if (latitude !== undefined && longitude !== undefined && radius) {
      insightsRequest.location_verification = {
        location: {
          type: "CIRCLE",
          radius: parseInt(radius),
          center: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          },
        },
      };
    }

    // Add subscriber_match if any subscriber data provided
    const hasSubscriberData =
      email ||
      name ||
      idDocument ||
      givenName ||
      familyName ||
      streetName ||
      streetNumber ||
      postalCode ||
      locality ||
      region ||
      country ||
      houseNumberExtension ||
      birthdate;

    if (hasSubscriberData) {
      insightsRequest.subscriber_match = {};

      // Add all provided subscriber match fields
      if (idDocument) insightsRequest.subscriber_match.id_document = idDocument;
      if (givenName) insightsRequest.subscriber_match.given_name = givenName;
      if (familyName) insightsRequest.subscriber_match.family_name = familyName;
      if (streetName) insightsRequest.subscriber_match.street_name = streetName;
      if (streetNumber)
        insightsRequest.subscriber_match.street_number = streetNumber;
      if (postalCode) insightsRequest.subscriber_match.postal_code = postalCode;
      if (locality) insightsRequest.subscriber_match.locality = locality;
      if (region) insightsRequest.subscriber_match.region = region;
      if (country) insightsRequest.subscriber_match.country = country;
      if (houseNumberExtension)
        insightsRequest.subscriber_match.house_number_extension =
          houseNumberExtension;
      if (birthdate) insightsRequest.subscriber_match.birthdate = birthdate;

      // Legacy support: if only email or name provided (without detailed fields)
      if (email && !givenName) insightsRequest.subscriber_match.email = email;
      if (name && !givenName && !familyName) {
        // Split name into given_name and family_name
        const nameParts = name.trim().split(/\s+/);
        if (nameParts.length > 1) {
          insightsRequest.subscriber_match.given_name = nameParts[0];
          insightsRequest.subscriber_match.family_name = nameParts
            .slice(1)
            .join(" ");
        } else {
          insightsRequest.subscriber_match.given_name = name;
        }
      }
    }

    const requestBody = {
      phone_number: phoneNumber,
      purpose: "FraudPreventionAndDetection",
      insights: insightsRequest,
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    // Make request to Identity Insights API
    const response = await axios.post(
      "https://api-eu.vonage.com/v0.1/identity-insights",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Identity Insights response:",
      JSON.stringify(response.data, null, 2)
    );

    // Extract insights from response
    const insights = response.data.insights || {};
    const formatInsight = insights.format || {};
    const simSwapInsight = insights.sim_swap || {};
    const currentCarrierInsight = insights.current_carrier || {};
    const originalCarrierInsight = insights.original_carrier || {};
    const subscriberMatchInsight = insights.subscriber_match || {};
    const roamingInsight = insights.roaming || {};
    const reachabilityInsight = insights.reachability || {};
    const locationVerificationInsight = insights.location_verification || {};

    // Calculate match score based on available data
    let matchScore = 50; // Base score
    if (formatInsight.is_format_valid) matchScore += 20;
    if (currentCarrierInsight.name) matchScore += 10;
    if (simSwapInsight.is_swapped === false) matchScore += 10;
    if (subscriberMatchInsight.given_name_match === "EXACT") matchScore += 10;

    res.json({
      success: true,
      message: "Identity Insights verification result",
      timestamp: new Date().toISOString(),
      requestId: response.data.request_id,
      data: {
        phoneNumber: formatInsight.number_international || phoneNumber,
        matchScore: matchScore,
        format: {
          isValid: formatInsight.is_format_valid,
          countryCode: formatInsight.country_code,
          countryName: formatInsight.country_name,
          countryPrefix: formatInsight.country_prefix,
          offlineLocation: formatInsight.offline_location,
          timeZones: formatInsight.time_zones,
          international: formatInsight.number_international,
          national: formatInsight.number_national,
          status: formatInsight.status,
        },
        simSwap: {
          isSwapped: simSwapInsight.is_swapped,
          latestSwapAt: simSwapInsight.latest_sim_swap_at,
          status: simSwapInsight.status,
        },
        currentCarrier: {
          name: currentCarrierInsight.name,
          networkType: currentCarrierInsight.network_type,
          countryCode: currentCarrierInsight.country_code,
          networkCode: currentCarrierInsight.network_code,
          status: currentCarrierInsight.status,
        },
        originalCarrier: {
          name: originalCarrierInsight.name,
          networkType: originalCarrierInsight.network_type,
          countryCode: originalCarrierInsight.country_code,
          networkCode: originalCarrierInsight.network_code,
          status: originalCarrierInsight.status,
        },
        roaming: {
          isRoaming: roamingInsight.is_roaming,
          latestStatusAt: roamingInsight.latest_status_at,
          countryCodes: roamingInsight.country_codes,
          status: roamingInsight.status,
        },
        reachability: {
          isReachable: reachabilityInsight.is_reachable,
          latestStatusAt: reachabilityInsight.latest_status_at,
          connectivity: reachabilityInsight.connectivity,
          status: reachabilityInsight.status,
        },
        ...(locationVerificationInsight &&
          Object.keys(locationVerificationInsight).length > 0 && {
            locationVerification: {
              isVerified: locationVerificationInsight.is_verified,
              latestLocationAt: locationVerificationInsight.latest_location_at,
              matchRate: locationVerificationInsight.match_rate,
              status: locationVerificationInsight.status,
            },
          }),
        ...(subscriberMatchInsight &&
          Object.keys(subscriberMatchInsight).length > 0 && {
            subscriberMatch: subscriberMatchInsight,
          }),
      },
    });
  } catch (error) {
    console.error("Phone Match Error:", error.response?.data || error.message);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    res.status(error.response?.status || 500).json({
      success: false,
      error:
        error.response?.data?.error_text ||
        error.response?.data?.detail ||
        error.message,
      errorType: error.response?.data?.type || "unknown",
    });
  }
});

// Number Verification endpoint - verifies ownership of a phone number
app.post("/api/identity/number-verify", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    // If Vonage client is not initialized, return mock data
    if (!vonage) {
      return res.json({
        success: true,
        message: "Mock response (API credentials not configured)",
        timestamp: new Date().toISOString(),
        data: {
          phoneNumber,
          verified: Math.random() > 0.3,
          carrier: "Mock Carrier",
          lineType: ["mobile", "landline", "voip"][
            Math.floor(Math.random() * 3)
          ],
          status: "mock",
        },
      });
    }

    // Make request to Vonage Number Insight API
    const numberInsightUrl = `https://api.nexmo.com/ni/standard/json?api_key=${vonageApiKey}&api_secret=${vonageApiSecret}&number=${phoneNumber}`;

    const response = await axios.get(numberInsightUrl);

    res.json({
      success: true,
      message: "Number Verification result",
      timestamp: new Date().toISOString(),
      data: {
        phoneNumber,
        status: response.data.status_message,
        countryCode: response.data.country_code,
        countryName: response.data.country_name,
        carrier: response.data.current_carrier?.name,
        lineType: response.data.current_carrier?.network_type,
        validNumber: response.data.status === 0,
        reachable: response.data.reachable,
        ported: response.data.ported,
        roaming: response.data.roaming,
      },
    });
  } catch (error) {
    console.error(
      "Number Verify Error:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error_text || error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
