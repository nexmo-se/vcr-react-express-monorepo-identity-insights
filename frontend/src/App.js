import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Collapse,
  IconButton,
  TextField,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhoneIcon from "@mui/icons-material/Phone";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import "./App.css";

const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://neru-4f2ff535-epic-call-app-backend-dev.use1.runtime.vonage.cloud"
    : "http://localhost:3000";

function App() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOlder, setExpandedOlder] = useState({});

  // Phone Match form state - Basic
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [simSwapPeriod, setSimSwapPeriod] = useState("240"); // Default 240 hours (10 days)

  // Location Verification state
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("50000"); // Default 50km

  // Subscriber Match state (detailed)
  const [idDocument, setIdDocument] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [streetName, setStreetName] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [locality, setLocality] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [houseNumberExtension, setHouseNumberExtension] = useState("");
  const [birthdate, setBirthdate] = useState("");

  // Number Verify form state
  const [verifyPhoneNumber, setVerifyPhoneNumber] = useState("");

  const handlePhoneMatch = async () => {
    if (!phoneNumber) {
      alert("Phone number is required");
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        phoneNumber,
        // Basic fields
        email: email || undefined,
        name: name || undefined,
        simSwapPeriod: simSwapPeriod || undefined,
        // Location verification fields
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        radius: radius || undefined,
        // Subscriber match fields
        idDocument: idDocument || undefined,
        givenName: givenName || undefined,
        familyName: familyName || undefined,
        streetName: streetName || undefined,
        streetNumber: streetNumber || undefined,
        postalCode: postalCode || undefined,
        locality: locality || undefined,
        region: region || undefined,
        country: country || undefined,
        houseNumberExtension: houseNumberExtension || undefined,
        birthdate: birthdate || undefined,
      };

      const result = await axios.post(
        `${BACKEND_URL}/api/identity/phone-match`,
        requestBody
      );
      setResponses((prev) => [
        {
          id: Date.now(),
          endpoint: "Phone Match",
          timestamp: new Date().toLocaleString(),
          data: result.data,
        },
        ...prev,
      ]);
    } catch (error) {
      setResponses((prev) => [
        {
          id: Date.now(),
          endpoint: "Phone Match",
          timestamp: new Date().toLocaleString(),
          error: error.response?.data?.error || error.message,
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberVerify = async () => {
    if (!verifyPhoneNumber) {
      alert("Phone number is required");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${BACKEND_URL}/api/identity/number-verify`,
        {
          phoneNumber: verifyPhoneNumber,
        }
      );
      setResponses((prev) => [
        {
          id: Date.now(),
          endpoint: "Number Verify",
          timestamp: new Date().toLocaleString(),
          data: result.data,
        },
        ...prev,
      ]);
    } catch (error) {
      setResponses((prev) => [
        {
          id: Date.now(),
          endpoint: "Number Verify",
          timestamp: new Date().toLocaleString(),
          error: error.response?.data?.error || error.message,
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleOlderResponse = (id) => {
    setExpandedOlder((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const recentResponses = responses.slice(0, 2);
  const olderResponses = responses.slice(2);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          Vonage Identity Insights API Demo
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          align="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Test phone number verification and identity matching
        </Typography>

        <Grid container spacing={3}>
          {/* Phone Match Section */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PhoneIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h5">
                  Identity Insights - Phone Match
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Verify phone number with comprehensive insights including format
                validation, carrier info, SIM swap detection, and optional
                subscriber/location matching.
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Basic Fields */}
                <TextField
                  label="Phone Number"
                  placeholder="+12089908002"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  fullWidth
                  required
                  helperText="Include country code (e.g., +1 for US)"
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Email (optional)"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Name (optional)"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="SIM Swap Period (hours)"
                      placeholder="240"
                      value={simSwapPeriod}
                      onChange={(e) => setSimSwapPeriod(e.target.value)}
                      fullWidth
                      type="number"
                      inputProps={{ min: 1, max: 2400 }}
                      helperText="1-2400 hours (default: 240)"
                    />
                  </Grid>
                </Grid>

                {/* Location Verification Accordion */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LocationOnIcon sx={{ mr: 1, color: "secondary.main" }} />
                      <Typography>Location Verification (Optional)</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Verify if the device is within a specified geographical
                        area. Requires Network Application.
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Latitude"
                            placeholder="40.7128"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            fullWidth
                            type="number"
                            inputProps={{ step: "any", min: -90, max: 90 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Longitude"
                            placeholder="-74.0060"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            fullWidth
                            type="number"
                            inputProps={{ step: "any", min: -180, max: 180 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Radius (meters)"
                            placeholder="50000"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            fullWidth
                            type="number"
                            inputProps={{ min: 2000, max: 200000 }}
                            helperText="2km - 200km"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Subscriber Match Accordion */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <PersonIcon sx={{ mr: 1, color: "success.main" }} />
                      <Typography>
                        Subscriber Match - Detailed KYC (Optional)
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Compare user information against operator KYC records.
                        Requires Network Application.
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="ID Document"
                            placeholder="66666666q"
                            value={idDocument}
                            onChange={(e) => setIdDocument(e.target.value)}
                            fullWidth
                            helperText="Official ID number"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Birthdate"
                            placeholder="1978-08-22"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            fullWidth
                            type="date"
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Given Name"
                            placeholder="Federica"
                            value={givenName}
                            onChange={(e) => setGivenName(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Family Name"
                            placeholder="Sanchez Arjona"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Street Name"
                            placeholder="Crawfords Corner Road"
                            value={streetName}
                            onChange={(e) => setStreetName(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Street Number"
                            placeholder="4"
                            value={streetNumber}
                            onChange={(e) => setStreetNumber(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Postal Code"
                            placeholder="07733"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Locality"
                            placeholder="Holmdel"
                            value={locality}
                            onChange={(e) => setLocality(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Region"
                            placeholder="Monmouth County"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Country"
                            placeholder="US"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            fullWidth
                            helperText="ISO 3166-1 alpha-2"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="House Number Extension"
                            placeholder="Suite 2416"
                            value={houseNumberExtension}
                            onChange={(e) =>
                              setHouseNumberExtension(e.target.value)
                            }
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Button
                  variant="contained"
                  onClick={handlePhoneMatch}
                  disabled={loading}
                  fullWidth
                  size="large"
                  sx={{ mt: 2 }}
                >
                  {loading ? "Processing..." : "Get Identity Insights"}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Number Verify Section - Simpler Legacy API */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, backgroundColor: "#fff3e0" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <VerifiedUserIcon sx={{ mr: 1, color: "warning.main" }} />
                <Typography variant="h6">
                  Number Insight API (Legacy)
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Basic number verification using the older Number Insight API.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Phone Number"
                  placeholder="+1234567890"
                  value={verifyPhoneNumber}
                  onChange={(e) => setVerifyPhoneNumber(e.target.value)}
                  fullWidth
                  required
                  helperText="Include country code (e.g., +1 for US)"
                  size="small"
                />
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleNumberVerify}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? "Processing..." : "Verify Number"}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Responses Section */}
        {responses.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Responses:
            </Typography>

            {/* Recent responses (last 2) - always expanded */}
            {recentResponses.map((response) => (
              <Paper
                key={response.id}
                elevation={1}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: response.error ? "#ffebee" : "#e8f5e9",
                }}
              >
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {response.endpoint} - {response.timestamp}
                </Typography>
                <pre
                  style={{
                    overflow: "auto",
                    margin: 0,
                    fontSize: "0.875rem",
                  }}
                >
                  {response.error
                    ? `Error: ${response.error}`
                    : JSON.stringify(response.data, null, 2)}
                </pre>
              </Paper>
            ))}

            {/* Older responses - collapsed by default */}
            {olderResponses.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Paper
                  elevation={1}
                  sx={{ p: 2, mb: 1, backgroundColor: "#f5f5f5" }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Older Responses ({olderResponses.length})
                  </Typography>
                </Paper>
                {olderResponses.map((response) => (
                  <Paper
                    key={response.id}
                    elevation={1}
                    sx={{
                      mb: 1,
                      backgroundColor: response.error ? "#ffebee" : "#e8f5e9",
                      opacity: 0.9,
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                      }}
                      onClick={() => toggleOlderResponse(response.id)}
                    >
                      <Typography variant="subtitle2" color="primary">
                        {response.endpoint} - {response.timestamp}
                      </Typography>
                      <IconButton
                        size="small"
                        sx={{
                          transform: expandedOlder[response.id]
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                    <Collapse in={expandedOlder[response.id]}>
                      <Box sx={{ px: 2, pb: 2 }}>
                        <pre
                          style={{
                            overflow: "auto",
                            margin: 0,
                            fontSize: "0.875rem",
                          }}
                        >
                          {response.error
                            ? `Error: ${response.error}`
                            : JSON.stringify(response.data, null, 2)}
                        </pre>
                      </Box>
                    </Collapse>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default App;
