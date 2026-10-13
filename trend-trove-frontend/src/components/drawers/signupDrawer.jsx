import React, { useState } from "react";
import { useRouter } from "next/router"; // Import the useRouter hook
import styled, { keyframes, css } from 'styled-components';
import { Box, Typography, TextField, Grid, Avatar, CircularProgress, Snackbar, Alert, InputAdornment, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { width } from "@mui/system";
import axios from "axios";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import OtpVerificationModal from "../modals/openOtpVerification";
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

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const StyledBox = styled(Box)`
  width: 600px;
  height: 100vh;
  padding: 2rem 3rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  position: relative;
  animation: ${css`${slideIn}`} 0.3s ease-out;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  @media (max-width: 600px) {
    width: 100%;
    padding: 2rem 1.5rem;
  }
`;

const StyledForm = styled('form')`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
`;

const AvatarWrapper = styled(Box)`
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  &::after {
    content: '${props => props.hasImage ? 'Change Photo' : 'Add Photo'}';
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    color: #ff3366;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const StyledAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
  margin: 0 auto;
  cursor: pointer;
  border: 3px solid #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: ${css`${pulseAnimation}`} 2s infinite;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const StyledButton = styled.button`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  background: ${props => props.variant === 'google' ? '#fff' : 'linear-gradient(135deg, #ff3366 0%, #ff6b6b 100%)'};
  color: ${props => props.variant === 'google' ? '#666' : '#fff'};
  box-shadow: ${props => props.variant === 'google' ? '0 2px 10px rgba(0,0,0,0.1)' : '0 4px 15px rgba(255, 51, 102, 0.2)'};
  border: ${props => props.variant === 'google' ? '1px solid #ddd' : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'google' 
      ? '0 4px 15px rgba(0,0,0,0.15)' 
      : '0 6px 20px rgba(255, 51, 102, 0.3)'};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #666;
  transition: all 0.3s ease;

  &:hover {
    color: #ff3366;
    transform: rotate(90deg);
  }
`;

const GoogleIcon = styled.div`
  width: 24px;
  height: 24px;
  background-image: url('/google-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
`;

const SignupDrawer = ({ open, onClose }) => {
  const router = useRouter();
  const [image, setImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  // Field-level errors
  const [errors, setErrors] = useState({});

  // Validation rules
  const nameRegex = /^[A-Za-z][A-Za-z\s'-]{0,48}[A-Za-z]$|^[A-Za-z]$/;
  const usernameRegex = /^[A-Za-z0-9_]{3,30}$/;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (!nameRegex.test(value.trim())) return "First name must contain only letters (and spaces/hyphens between letters)";
        return "";
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (!nameRegex.test(value.trim())) return "Last name must contain only letters (and spaces/hyphens between letters)";
        return "";
      case "userName":
        if (!value.trim()) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        if (!usernameRegex.test(value)) return "Username can only contain letters, numbers and underscores";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value.trim())) return "Please enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (name, value) => {
    // Update field value
    switch (name) {
      case "firstName": setFirstName(value); break;
      case "lastName": setLastName(value); break;
      case "userName": setUserName(value); break;
      case "email": setEmail(value); break;
      case "password": setPassword(value); break;
      case "confirmPassword": setConfirmPassword(value); break;
    }
    // Clear error on change
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (name, value) => {
    if (!value || !value.toString().trim()) {
      return;
    }
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    const fields = { firstName, lastName, userName, email, password, confirmPassword };
    let valid = true;
    for (const [name, value] of Object.entries(fields)) {
      const err = validateField(name, value);
      if (err) {
        newErrors[name] = err;
        valid = false;
      }
    }
    // If image is set, validate type
    if (image && !["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      newErrors.image = "Only JPEG, PNG, or WEBP images are allowed";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    setErrors({});
    try {
      await axiosInstance.post("/otp/send-otp", { email: email.trim() });
      setOtpModalOpen(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to send OTP";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerificationSuccess = async () => {
    try {
      setLoading(true);
      setErrors({});
      
      const formData = new FormData();
      formData.append("firstname", firstName);
      formData.append("lastname", lastName);
      formData.append("username", userName);
      formData.append("email", email);
      if (image) formData.append("image", image);
      formData.append("password", password);
      formData.append("confirmpassword", confirmPassword);
      
      if (referralCode && referralCode.trim()) {
        formData.append("referralCode", referralCode.trim().toUpperCase());
      }

      const response = await axiosInstance.post("/users/register", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setErrors({});
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      localStorage.setItem("usertoken", response.data.token);
      setTimeout(() => { 
        if (onClose) onClose();
        router.push("/"); 
      }, 1000);

    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || "Registration failed";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const handleGoogleSignup = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrors({});
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/users/auth/google`;
  };

  return (
    <StyledBox>
      <CloseButton onClick={onClose}>
        <CloseIcon />
      </CloseButton>

      <Typography
        variant="h4"
        sx={{
          textAlign: 'center',
          fontWeight: 700,
          marginBottom: "2rem",
          background: "linear-gradient(135deg, #1a1a1a 0%, #ff3366 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Create Account
      </Typography>

      <StyledForm onSubmit={handleSubmit} noValidate>
        {/* Profile Image (Optional) */}
        <Box sx={{ textAlign: "center" }}>
          <AvatarWrapper hasImage={!!image}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-image"
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                    setErrors((prev) => ({ ...prev, image: "Only JPEG, PNG, or WEBP images are allowed" }));
                  } else {
                    setErrors((prev) => ({ ...prev, image: "" }));
                    setImage(file);
                  }
                }
              }}
            />
            <label htmlFor="profile-image">
              <StyledAvatar src={image ? URL.createObjectURL(image) : ''} />
            </label>
          </AvatarWrapper>
          <Typography variant="caption" sx={{ color: "#64748b", mt: 4, display: "block" }}>
            Profile photo (optional)
          </Typography>
          {errors.image && (
            <Typography variant="caption" sx={{ color: "#ef4444", display: "block", mt: 0.5 }}>
              {errors.image}
            </Typography>
          )}
        </Box>

        {/* First Name & Last Name */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="First Name"
              fullWidth
              required
              value={firstName}
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              onBlur={(e) => handleBlur("firstName", e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              sx={textFieldStyle}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Last Name"
              fullWidth
              required
              value={lastName}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              onBlur={(e) => handleBlur("lastName", e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              sx={textFieldStyle}
            />
          </Grid>
        </Grid>

        {/* Username */}
        <TextField
          label="Username"
          fullWidth
          required
          value={userName}
          onChange={(e) => handleFieldChange("userName", e.target.value)}
          onBlur={(e) => handleBlur("userName", e.target.value)}
          error={!!errors.userName}
          helperText={errors.userName}
          sx={textFieldStyle}
        />

        {/* Email */}
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          onBlur={(e) => handleBlur("email", e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          sx={textFieldStyle}
        />

        {/* Password */}
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          required
          value={password}
          onChange={(e) => handleFieldChange("password", e.target.value)}
          onBlur={(e) => handleBlur("password", e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: '#64748b' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={textFieldStyle}
        />

        {/* Confirm Password */}
        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          fullWidth
          required
          value={confirmPassword}
          onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
          onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  sx={{ color: '#64748b' }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={textFieldStyle}
        />

        {/* Referral Code (Optional) */}
        <TextField
          label="Referral Code (Optional)"
          fullWidth
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          sx={textFieldStyle}
          placeholder="Enter referral code if you have one"
        />

        <StyledButton type="submit" disabled={loading} loading={loading}>
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ color: "white" }} />
              <span>Creating Account...</span>
            </>
          ) : (
            'Create Account'
          )}
        </StyledButton>

        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          margin: "1rem 0",
          color: '#666',
          '&::before, &::after': {
            content: '""',
            flex: 1,
            height: '1px',
            background: 'rgba(0, 0, 0, 0.1)',
            margin: '0 1rem',
          }
        }}>
          or
        </Box>

        <StyledButton type="button" variant="google" onClick={handleGoogleSignup}>
          <GoogleIcon />
          Continue with Google
        </StyledButton>
      </StyledForm>

      <OtpVerificationModal
        open={otpModalOpen}
        onClose={(success) => {
          setOtpModalOpen(false);
          if (success) { handleOtpVerificationSuccess(); }
        }}
        email={email}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </StyledBox>
  );
};

// Common TextField styling
const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'white',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: '#e2e8f0',
    },
    '&:hover fieldset': {
      borderColor: '#ff3366',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ff3366',
      borderWidth: '2px',
    },
    '&.Mui-error fieldset': {
      borderColor: '#ef4444',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#64748b',
    '&.Mui-focused': {
      color: '#ff3366',
    },
    '&.Mui-error': {
      color: '#ef4444',
    },
  },
  '& .MuiInputBase-input': {
    padding: '16px',
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    fontSize: '0.75rem',
  },
};

export default SignupDrawer;

