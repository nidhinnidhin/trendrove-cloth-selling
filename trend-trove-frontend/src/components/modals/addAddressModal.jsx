import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const AddAddressModal = ({ open, onClose, onAddressAdded }) => {
  const [addressData, setAddressData] = useState({
    fullName: "",
    mobileNumber: "",
    pincode: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    alternatePhone: "",
    addressType: "Home",
    coordinates: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!addressData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    const mobileNumberRegex = /^\d{10}$/;
    if (!addressData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile Number is required";
    } else if (!mobileNumberRegex.test(addressData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile Number must be 10 digits";
    }

    const pincodeRegex = /^\d{6}$/;
    if (!addressData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!pincodeRegex.test(addressData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    if (!addressData.locality.trim()) {
      newErrors.locality = "Locality is required";
    }

    if (!addressData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!addressData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!addressData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (addressData.alternatePhone.trim()) {
      if (!mobileNumberRegex.test(addressData.alternatePhone)) {
        newErrors.alternatePhone = "Alternate Phone must be 10 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const formatDetailedAddress = (addressData) => {
    const parts = [];
    if (addressData.road) parts.push(addressData.road);
    if (addressData.house_number) parts.push(addressData.house_number);
    if (addressData.suburb) parts.push(addressData.suburb);
    if (addressData.neighbourhood) parts.push(addressData.neighbourhood);
    if (addressData.residential) parts.push(addressData.residential);
    if (addressData.building) parts.push(addressData.building);

    return parts.filter(Boolean).join(', ');
  };

  const getCityFromResponse = (addressData) => {
    // Try different fields that might contain city information
    return addressData.city || 
           addressData.town || 
           addressData.municipality || 
           addressData.suburb || 
           addressData.district || 
           addressData.county ||
           "";
  };

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError("");

    try {
      // Get user's geolocation
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Use Nominatim API with more detailed parameters
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&` +
        `lat=${latitude}&` +
        `lon=${longitude}&` +
        `addressdetails=1&` +
        `zoom=18&` + // Higher zoom level for more detail
        `namedetails=1&` + // Include name details
        `accept-language=en` // Ensure English response
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address details');
      }

      const data = await response.json();
      console.log('Nominatim Response:', data); // For debugging

      if (data.address) {
        // Create a detailed address string
        const detailedAddress = formatDetailedAddress(data.address);
        const city = getCityFromResponse(data.address);

        // Map the Nominatim response to our address format
        const address = {
          ...addressData, // Keep existing data
          pincode: data.address.postcode || "",
          locality: data.address.suburb || 
                   data.address.neighbourhood || 
                   data.address.residential || 
                   "",
          address: detailedAddress,
          city: city,
          state: INDIAN_STATES.find(state => 
            data.address.state?.toLowerCase().includes(state.toLowerCase())
          ) || "",
          coordinates: {
            latitude,
            longitude
          }
        };

        setAddressData(prev => ({
          ...prev,
          ...address
        }));

        setSnackbar({
          open: true,
          message: "Location detected successfully! Please verify the details.",
          severity: "success"
        });
      } else {
        throw new Error('No address data found');
      }
    } catch (error) {
      console.error("Error getting location:", error);
      let errorMessage = "Unable to get your location. ";
      
      if (error.code === 1) {
        errorMessage += "Please enable location access in your browser.";
      } else if (error.code === 2) {
        errorMessage += "Location unavailable. Please try again.";
      } else if (error.code === 3) {
        errorMessage += "Request timed out. Please try again.";
      } else {
        errorMessage += "Please try again or enter address manually.";
      }

      setLocationError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Add this helper function to validate coordinates before saving
  const validateCoordinates = (coords) => {
    if (!coords) return false;
    const { latitude, longitude } = coords;
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const addressPayload = {
        ...addressData,
        coordinates: validateCoordinates(addressData.coordinates) 
          ? addressData.coordinates 
          : undefined
      };

      const response = await axiosInstance.post("/address/add-address", addressPayload);
      
      if (response.data) {
        onAddressAdded(response.data.address);
        setSnackbar({
          open: true,
          message: "Address added successfully!",
          severity: "success"
        });
        onClose();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error adding address",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            backgroundColor: "#f7f7f7",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#1a1a1a",
            color: "white",
            py: 2,
            px: 3,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            fontWeight: 600,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon color="primary" />
            <Typography variant="h6">Add New Address</Typography>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: "#ffffff",
            py: 3,
            px: 3,
          }}
        >
          <Box sx={{ mb: 3, mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LocationOnIcon />}
              onClick={handleGetCurrentLocation}
              disabled={isLoadingLocation}
              sx={{
                borderColor: '#1a1a1a',
                color: '#1a1a1a',
                '&:hover': {
                  borderColor: '#000000',
                  backgroundColor: 'rgba(0,0,0,0.04)'
                },
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {isLoadingLocation ? (
                <>
                  <CircularProgress size={20} />
                  <span>Detecting Location...</span>
                </>
              ) : (
                "Use Current Location"
              )}
            </Button>
            {locationError && (
              <Typography 
                color="error" 
                variant="caption" 
                sx={{ 
                  mt: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 0.5 
                }}
              >
                <ErrorOutlineIcon fontSize="small" />
                {locationError}
              </Typography>
            )}
          </Box>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={addressData.fullName}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                    "&.Mui-focused fieldset": {
                      borderColor: "#1a1a1a",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#1a1a1a",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobileNumber"
                value={addressData.mobileNumber}
                onChange={handleChange}
                type="number"
                variant="outlined"
                error={!!errors.mobileNumber}
                helperText={errors.mobileNumber}
                required
                inputProps={{ maxLength: 10 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                    "&.Mui-focused fieldset": {
                      borderColor: "#1a1a1a",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#1a1a1a",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={addressData.pincode}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.pincode}
                helperText={errors.pincode}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                    "&.Mui-focused fieldset": {
                      borderColor: "#1a1a1a",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#1a1a1a",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Locality"
                name="locality"
                value={addressData.locality}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.locality}
                helperText={errors.locality}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                    "&.Mui-focused fieldset": {
                      borderColor: "#1a1a1a",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#1a1a1a",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={addressData.address}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={2}
                error={!!errors.address}
                helperText={errors.address}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                    "&.Mui-focused fieldset": {
                      borderColor: "#1a1a1a",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#1a1a1a",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={addressData.city}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.city}
                helperText={errors.city}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                    "&.Mui-focused fieldset": {
                      borderColor: "#1a1a1a",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#1a1a1a",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                variant="outlined"
                required
                error={!!errors.state}
              >
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={addressData.state}
                  onChange={handleChange}
                  label="State"
                >
                  {INDIAN_STATES.map((stateName) => (
                    <MenuItem key={stateName} value={stateName}>
                      {stateName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.state && (
                  <FormHelperText error>{errors.state}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Landmark (Optional)"
                name="landmark"
                value={addressData.landmark}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                    "&.Mui-focused fieldset": {
                      borderColor: "#1a1a1a",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#1a1a1a",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Alternate Phone (Optional)"
                name="alternatePhone"
                value={addressData.alternatePhone}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.alternatePhone}
                helperText={errors.alternatePhone}
                inputProps={{ maxLength: 10 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                    "&.Mui-focused fieldset": {
                      borderColor: "#1a1a1a",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#1a1a1a",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Address Type</InputLabel>
                <Select
                  name="addressType"
                  value={addressData.addressType}
                  onChange={handleChange}
                  label="Address Type"
                >
                  <MenuItem value="Home">Home</MenuItem>
                  <MenuItem value="Work">Work</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: "#f7f7f7",
            py: 2,
            px: 3,
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              color: "#1a1a1a",
              borderColor: "#1a1a1a",
              textTransform: "none",
              px: 3,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "rgba(26,26,26,0.05)",
              },
            }}
            variant="outlined"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "#1a1a1a",
              color: "white",
              textTransform: "none",
              px: 3,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#333333",
              },
              "&.Mui-disabled": {
                backgroundColor: "#666666",
                color: "#cccccc",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Add Address"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            backgroundColor: "#1a1a1a",
            color: "white",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddAddressModal;
