import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Modal,
} from "@mui/material";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";
import styled from "styled-components";

const ModalContent = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 600px) {
    width: 95%;
    padding: 24px;
  }
`;

const Title = styled(Typography)` 
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(45deg, #FF9800, #FF5722);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StyledTextField = styled(TextField)`
  margin-bottom: 24px;
  
  .MuiOutlinedInput-root {
    border-radius: 12px;
    background: #f8f9fa;
    transition: all 0.3s ease;
    
    &:hover {
      background: #fff;
      box-shadow: 0 0 0 2px #FF980033;
    }
    
    &.Mui-focused {
      background: #fff;
      box-shadow: 0 0 0 2px #FF9800;
    }
  }
`;

const VerifyButton = styled(Button)`
  background: linear-gradient(45deg, #FF9800, #FF5722);
  border-radius: 12px;
  padding: 12px;
  text-transform: none;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  
  &:hover {
    background: linear-gradient(45deg, #FF5722, #FF9800);
  }
`;

const ResendButton = styled(Button)`
  color: #FF9800;
  border-color: #FF9800;
  border-radius: 12px;
  text-transform: none;
  
  &:hover {
    border-color: #FF5722;
    background: rgba(255, 152, 0, 0.08);
  }
`;

const OtpVerificationModal = ({ open, onClose, email }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [timer, setTimer] = useState(60);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    let interval;
    if (open) {
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
    return () => clearInterval(interval);
  }, [open]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(otp)) {
      setSnackbar({
        open: true,
        message: "Please enter a valid 6-digit OTP.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/otp/verify-otp", {
        otp,
        email,
      });
      setSnackbar({
        open: true,
        message: response.data.message,
        type: "success",
      });
      onClose(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to verify OTP.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/otp/resend-otp", { email });
      setSnackbar({
        open: true,
        message: response.data.message,
        type: "success",
      });
      setTimer(60);
      setTimerExpired(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to resend OTP.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", type: "" });
  };

  return (
    <Modal open={open} onClose={() => onClose(false)}>
      <ModalContent>
        <Title variant="h6">
          Verify OTP
        </Title>
        <form onSubmit={handleVerifyOtp}>
          <StyledTextField
            label="Enter OTP"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <VerifyButton
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Verify OTP"}
          </VerifyButton>
          {timerExpired ? (
            <ResendButton
              variant="outlined"
              fullWidth
              onClick={handleResendOtp}
              disabled={loading}
            >
              Resend OTP
            </ResendButton>
          ) : (
            <Typography 
              variant="body2" 
              align="center"
              sx={{ color: '#FF9800', fontWeight: 500 }}
            >
              OTP expires in: {timer} seconds
            </Typography>
          )}
        </form>
      </ModalContent>
    </Modal>
  );
};

export default OtpVerificationModal;
