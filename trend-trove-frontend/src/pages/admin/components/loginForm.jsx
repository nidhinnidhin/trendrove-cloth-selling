import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, EmailOutlined, LockOutlined, AdminPanelSettings } from "@mui/icons-material";
import axios from "axios";
import { useRouter } from "next/router";
import axiosInstance from "@/utils/adminAxiosInstance";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/csrf-token`);
      return response.data.csrfToken;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      setError("Failed to initialize secure connection. Please try again.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        setLoading(false);
        return;
      }
      
      const response = await axiosInstance.post(
        "/adminlogin",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          }
        }
      );

      if (response.data.message === "Login successful") {
        localStorage.setItem("admin-logged", true);
        router.push("/admin/dashboard/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let admin_logged = localStorage.getItem("admin-logged");
    if (admin_logged) {
      router.push("/admin/dashboard/dashboard");
    }
  }, [router]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          width: { xs: "100%", sm: "440px" },
          borderRadius: "24px",
          background: "rgba(18, 20, 28, 0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.65), 0 0 1px inset rgba(255, 255, 255, 0.2)",
          overflow: "hidden",
          
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          {/* Header Section */}
          <Box sx={{ textCenter: "center", textAlign: "center", mb: 3.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                color: "#d4af37",
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 32 }} />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                
                letterSpacing: "1px",
                fontFamily: "'Playfair Display', serif",
                fontSize: { xs: "1.75rem", sm: "2.1rem" },
                mb: 0.5,
              }}
            >
              TREND TROVE
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                color: "#d4af37",
                fontWeight: 600,
                fontSize: "0.875rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Admin Management Portal
            </Typography>
            
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                mt: 0.5,
                fontSize: "0.825rem",
              }}
            >
              Enter credentials to access administrative dashboard
            </Typography>
          </Box>

          {/* Inline Error Alert */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{
                mb: 3,
                backgroundColor: "rgba(211, 47, 47, 0.15)",
                color: "#ff8a80",
                border: "1px solid rgba(211, 47, 47, 0.3)",
                borderRadius: "12px",
                "& .MuiAlert-icon": { color: "#ff5252" },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Form Section */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 500,
                  mb: 0.75,
                  display: "block",
                  fontSize: "0.8rem",
                }}
              >
                Email Address
              </Typography>
              <TextField
                type="email"
                placeholder="admin@trendrove.com"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.15)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#d4af37",
                      boxShadow: "0 0 12px rgba(212, 175, 55, 0.25)",
                    },
                  },
                  "& input::placeholder": {
                    color: "rgba(255, 255, 255, 0.35)",
                    opacity: 1,
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 500,
                  mb: 0.75,
                  display: "block",
                  fontSize: "0.8rem",
                }}
              >
                Password
              </Typography>
              <TextField
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                      >
                        {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.15)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#d4af37",
                      boxShadow: "0 0 12px rgba(212, 175, 55, 0.25)",
                    },
                  },
                  "& input::placeholder": {
                    color: "rgba(255, 255, 255, 0.35)",
                    opacity: 1,
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.6,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #d4af37 0%, #997a15 100%)",
                color: "#000000",
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "0.8px",
                textTransform: "none",
                boxShadow: "0 8px 24px rgba(212, 175, 55, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #e5be48 0%, #b38f1e 100%)",
                  boxShadow: "0 12px 28px rgba(212, 175, 55, 0.45)",
                  transform: "translateY(-1px)",
                },
                "&.Mui-disabled": {
                  background: "rgba(212, 175, 55, 0.3)",
                  color: "rgba(0, 0, 0, 0.4)",
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CircularProgress size={20} sx={{ color: "#000000" }} />
                  <span>Authenticating...</span>
                </Box>
              ) : (
                "Sign In to Admin Portal"
              )}
            </Button>
          </form>

          {/* Footer Security Badge */}
          <Box sx={{ mt: 3.5, textAlign: "center" }}>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.45)",
                fontSize: "0.75rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              🔒 256-bit Encrypted Admin Connection
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          sx={{
            width: "100%",
            borderRadius: "12px",
            backgroundColor: "#181824",
            color: "#ff8a80",
            border: "1px solid rgba(211, 47, 47, 0.5)",
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginForm;
