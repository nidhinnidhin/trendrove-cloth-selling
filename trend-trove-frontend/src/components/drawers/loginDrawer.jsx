import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  TextField,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Image from "next/image";
import axios from "axios";
import google from "../../media/google.png";
import { useRouter } from "next/router";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import styled, { keyframes } from 'styled-components';
import axiosInstance from "@/utils/axiosInstance";

// Animations
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const DrawerContainer = styled(Box)`
  width: 100%;
  max-width: 600px;
  height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 2rem;
  position: relative;
  animation: ${slideIn} 0.3s ease-out;
  overflow-y: auto;

  @media (min-width: 600px) {
    padding: 3rem;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
`;

const FormContainer = styled.form`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
  padding: 0 1rem;

  @media (min-width: 600px) {
    padding: 0;
  }
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #666;
  transition: all 0.3s ease;

  @media (min-width: 600px) {
    top: 1.5rem;
    right: 1.5rem;
  }

  &:hover {
    color: #ff3366;
    transform: rotate(90deg);
  }
`;

const StyledButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  background: ${props => props.variant === 'contained' ? '#ff3366' : 'transparent'};
  color: ${props => props.variant === 'contained' ? 'white' : '#1a1a1a'};
  border: ${props => props.variant === 'outlined' ? '2px solid #1a1a1a' : 'none'};

  @media (min-width: 600px) {
    padding: 1rem;
    font-size: 1rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'contained' ? '0 4px 12px rgba(255, 51, 102, 0.2)' : 'none'};
    background: ${props => props.variant === 'contained' ? '#e62e5c' : props.variant === 'outlined' ? '#1a1a1a' : 'transparent'};
    color: ${props => props.variant === 'outlined' && 'white'};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 2rem 0;
  color: #666;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
    margin: 0 1rem;
  }
`;

const GoogleButton = styled(StyledButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.1);
  color: #1a1a1a;
  font-size: 0.9rem;

  @media (min-width: 600px) {
    gap: 1rem;
    font-size: 1rem;
  }

  &:hover {
    background: #f8f9fa;
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    border-radius: 12px;
    background: white;
    transition: all 0.3s ease;
    font-size: 0.9rem;

    @media (min-width: 600px) {
      font-size: 1rem;
    }

    &:hover fieldset {
      border-color: #ff3366;
    }

    &.Mui-focused fieldset {
      border-color: #ff3366;
    }
  }

  .MuiInputLabel-root {
    font-size: 0.9rem;
    
    @media (min-width: 600px) {
      font-size: 1rem;
    }
    
    &.Mui-focused {
      color: #ff3366;
    }
  }
`;

const ForgotPassword = styled(Typography)`
  color: #ff3366;
  cursor: pointer;
  font-weight: 500;
  text-align: right;
  margin-top: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;

const WelcomeText = styled(Typography)`
  font-weight: 700;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  text-align: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #ff3366 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (min-width: 600px) {
    font-size: 2.2rem;
    text-align: left;
  }
`;

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 256 262"
    style={{ height: 24 }}
  >
    <path
      fill="#4285F4"
      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
    />
    <path
      fill="#34A853"
      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
    />
    <path
      fill="#FBBC05"
      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
    />
    <path
      fill="#EB4335"
      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
    />
  </svg>
);

const LoginDrawer = ({ onClose }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Client-side validations
      if (!email.trim() || !password.trim()) {
        setSnackbarMessage("Email and password are required");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

      const response = await axiosInstance.post("/users/login", {
        email: email.trim(),
        password: password,
      }
    )
      
      .catch((error) => {
        // Handle specific error cases
        if (error.response) {
          // Server responded with error status
          const errorMessage = error.response.data.message || "Invalid credentials";
          setSnackbarMessage(errorMessage);
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          throw new Error(errorMessage); // Stop execution here
        }
        // Network or other errors
        setSnackbarMessage("Connection error. Please try again.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        throw error;
      });

      // Handle successful login
      if (response && response.data) {
        setSnackbarMessage("Login successful!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        localStorage.setItem("usertoken", response.data.token);
        
        setTimeout(() => {
          router.push("/");
          if (onClose) onClose();
        }, 2000);
      }

    } catch (error) {
      // This will only log to console, not show to user
      console.log("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleGoogleLogin = () => {
    // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/users/auth/google`;
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/users/auth/google`;
  };

  return (
    <DrawerContainer>
      <CloseButton onClick={onClose}>
        <CloseIcon />
      </CloseButton>

      <FormContainer onSubmit={handleSubmit} noValidate>
        <WelcomeText variant="h4">
          Welcome Back
        </WelcomeText>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <StyledTextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: password && (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledButton
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ color: "white", marginRight: 1 }} />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </StyledButton>
          </Grid>

          <Grid item xs={12}>
            <ForgotPassword onClick={() => router.push("/forgotPassword/forgotpassword")}>
              Forgot password?
            </ForgotPassword>
          </Grid>

          <Grid item xs={12}>
            <Divider>or</Divider>
          </Grid>

          <Grid item xs={12}>
            <GoogleButton onClick={handleGoogleLogin}>
              <GoogleIcon />
              Continue with Google
            </GoogleButton>
          </Grid>
        </Grid>
      </FormContainer>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DrawerContainer>
  );
};

export default LoginDrawer;
