import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import Header from "../components/header";
import Footer from "../components/footer";
import axios from "axios";
import { useRouter } from "next/router";
import axiosInstance from "@/utils/axiosInstance";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [timer, setTimer] = useState(60);
  const [timerExpired, setTimerExpired] = useState(false);
  const router = useRouter();

  function refreshPage() {
    window.location.reload();
  }

  useEffect(() => {
    const hasRefreshed = sessionStorage.getItem("hasRefreshed");

    if (!hasRefreshed) {
      sessionStorage.setItem("hasRefreshed", "true");
      refreshPage();
    }
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setSnackbar({ open: true, message: "Email is missing.", type: "error" });
    }

    const storedTimer = localStorage.getItem("otp-timer");
    let interval;

    if (storedTimer) {
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = Math.max(0, parseInt(storedTimer) - currentTime);
      setTimer(remainingTime);
      if (remainingTime === 0) {
        setTimerExpired(true);
      } else {
        interval = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer <= 1) {
              clearInterval(interval);
              setTimerExpired(true);
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
      }
    } else {
      localStorage.setItem("otp-timer", Math.floor(Date.now() / 1000) + 60);
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer === 0) {
      localStorage.removeItem("otp-timer");
    } else {
      localStorage.setItem("otp-timer", Math.floor(Date.now() / 1000) + timer);
    }
  }, [timer]);

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", type: "" });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6 || isNaN(otp)) {
      setSnackbar({
        open: true,
        message: "Please enter a valid 6-digit OTP.",
        type: "error",
      });
      setIsFormSubmitted(true);
      return;
    }

    if (!email) {
      setSnackbar({ open: true, message: "Email is missing.", type: "error" });
      return;
    }

    try {
      setVerifyLoading(true);

      const response = await axiosInstance.post("/otp/verify-otp", {
        otp,
        email,
      });

      setVerifyLoading(false);
      setSnackbar({
        open: true,
        message: response.data.message,
        type: "success",
      });
      localStorage.removeItem("email");
      router.push("/");
    } catch (error) {
      setVerifyLoading(false);

      if (error.response && error.response.data) {
        setSnackbar({
          open: true,
          message: error.response.data.message,
          type: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to verify OTP. Try again.",
          type: "error",
        });
      }
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);

    try {
      const response = await axiosInstance.post("/otp/resend-otp", {
        email,
      });

      setResendLoading(false);
      setSnackbar({
        open: true,
        message: response.data.message,
        type: "success",
      });

      setTimer(60); 
      setTimerExpired(false);

      localStorage.setItem("otp-timer", Math.floor(Date.now() / 1000) + 60);

      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval); 
            setTimerExpired(true); 
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(interval); 
    } catch (error) {
      setResendLoading(false); 

      if (error.response && error.response.data) {
        setSnackbar({
          open: true,
          message: error.response.data.message,
          type: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to resend OTP. Try again.",
          type: "error",
        });
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          backgroundColor: "#f4f4f4",
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            padding: 4,
            border: "1px solid #ddd",
            borderRadius: 2,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h5" textAlign="center" gutterBottom>
            Verify OTP
          </Typography>
          <form onSubmit={handleVerifyOtp} noValidate>
            <TextField
              label="Email Address"
              variant="outlined"
              type="email"
              fullWidth
              required
              value={email}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#FFA500",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FFA500",
                },
              }}
            />
            <TextField
              label="OTP"
              variant="outlined"
              type="number"
              fullWidth
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={isFormSubmitted && (otp.length !== 6 || isNaN(otp))}
              helperText={
                isFormSubmitted && (otp.length !== 6 || isNaN(otp))
                  ? "OTP must be 6 digits."
                  : ""
              }
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#FFA500",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FFA500",
                },
              }}
            />
            {email && (
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={verifyLoading}
                sx={{
                  backgroundColor: "#FFA500",
                  "&:hover": { backgroundColor: "#FF8C00" },
                }}
              >
                {verifyLoading ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{ marginRight: 1, color: "white" }}
                    />
                    Verifying OTP...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            )}
          </form>

          {email && timerExpired ? (
            <Button
              variant="contained"
              color="warning"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleResendOtp}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{ marginRight: 1, color: "white" }}
                  />
                  Resending OTP...
                </>
              ) : (
                "Resend OTP"
              )}
            </Button>
          ) : (
            email && (
              <Typography
                variant="body2"
                color="textSecondary"
                align="center"
                sx={{ mt: 2 }}
              >
                OTP expires in: {formatTime(timer)}
              </Typography>
            )
          )}

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.type}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default VerifyOtp;
