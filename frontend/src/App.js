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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhoneIcon from "@mui/icons-material/Phone";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import "./App.css";

const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://neru-4f2ff535-epic-call-app-backend-dev.use1.runtime.vonage.cloud"
    : "http://localhost:3000";

function App() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOlder, setExpandedOlder] = useState({});

  // Phone Match form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // Number Verify form state
  const [verifyPhoneNumber, setVerifyPhoneNumber] = useState("");

  const handlePhoneMatch = async () => {
    if (!phoneNumber) {
      alert("Phone number is required");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${BACKEND_URL}/api/identity/phone-match`,
        {
          phoneNumber,
          email: email || undefined,
          name: name || undefined,
        }
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
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PhoneIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h5">Phone Match</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Verify if a phone number matches the provided email and/or name.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Phone Number"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  fullWidth
                  required
                  helperText="Include country code (e.g., +1 for US)"
                />
                <TextField
                  label="Email (optional)"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Name (optional)"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handlePhoneMatch}
                  disabled={loading}
                  fullWidth
                  size="large"
                >
                  {loading ? "Processing..." : "Match Phone"}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Number Verify Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <VerifiedUserIcon sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="h5">Number Verify</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Get detailed information about a phone number including carrier
                and line type.
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
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleNumberVerify}
                  disabled={loading}
                  fullWidth
                  size="large"
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
