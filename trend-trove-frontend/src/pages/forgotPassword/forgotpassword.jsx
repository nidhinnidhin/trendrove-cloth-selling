import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Stack,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";

const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      showMessage("Email is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/users/forgot-password-send-otp",
        { email }
      );
      showMessage(response.data.message);
      setStep(2);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Failed to send OTP",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      showMessage("OTP is required", "error");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/users/verify-forgot-password-otp", {
        email,
        otp,
      });
      setStep(3);
    } catch (error) {
      showMessage(error.response?.data?.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      showMessage(
        "Password must be at least 8 characters and contain special characters",
        "error"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/users/reset-password", {
        email,
        otp,
        newPassword,
      });
      showMessage(response.data.message);
      setTimeout(() => {
        router.push("/authentication/loginSignup");
      }, 2000);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Failed to reset password",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setCanResend(false);
    setResendTimer(60);

    try {
      const response = await axiosInstance.post(
        "/users/resend-forgot-password-otp",
        { email }
      );
      showMessage(response.data.message);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Failed to resend OTP",
        "error"
      );
      setCanResend(true);
      setResendTimer(0);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOtp}>
            <Stack spacing={3}>
              <Typography variant="h6">Enter Your Email</Typography>
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: "#FFA500",
                  "&:hover": { bgcolor: "#FF8C00" },
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Send OTP"}
              </Button>
            </Stack>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyOtp}>
            <Stack spacing={3}>
              <Typography variant="h6">Enter OTP</Typography>
              <TextField
                fullWidth
                label="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: "#FFA500",
                  "&:hover": { bgcolor: "#FF8C00" },
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Verify OTP"}
              </Button>
              <Button
                type="button"
                variant="text"
                disabled={!canResend}
                onClick={handleResendOtp}
                sx={{ color: "#FFA500" }}
              >
                {resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : "Resend OTP"}
              </Button>
            </Stack>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleResetPassword}>
            <Stack spacing={3}>
              <Typography variant="h6">Reset Password</Typography>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: "#FFA500",
                  "&:hover": { bgcolor: "#FF8C00" },
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Reset Password"}
              </Button>
            </Stack>
          </form>
        );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background:
          "url(https://images.pexels.com/photos/3353621/pexels-photo-3353621.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          bgcolor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        {renderStep()}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForgotPassword;
