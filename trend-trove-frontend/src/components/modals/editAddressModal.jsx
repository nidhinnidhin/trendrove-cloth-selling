import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

const EditAddressModal = ({ open, onClose, address, onAddressUpdated }) => {
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
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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

  useEffect(() => {
    if (address) {
      setAddressData(address);
    }
  }, [address]);

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

    if (
      addressData.alternatePhone.trim() &&
      !mobileNumberRegex.test(addressData.alternatePhone)
    ) {
      newErrors.alternatePhone = "Alternate Phone must be 10 digits";
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/address/edit-address/${address._id}`,
        addressData
      );

      onAddressUpdated(response.data.address || addressData);

      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });

      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error updating address",
        severity: "error",
      });
      console.error("Error updating address:", error);
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
          Edit Address
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#ffffff", py: 3, px: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={addressData.fullName}
                onChange={handleChange}
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
                error={!!errors.pincode}
                helperText={errors.pincode}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
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
                error={!!errors.locality}
                helperText={errors.locality}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
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
                error={!!errors.address}
                helperText={errors.address}
                required
                multiline
                rows={2}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
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
                error={!!errors.city}
                helperText={errors.city}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.state} required>
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={addressData.state}
                  onChange={handleChange}
                  label="State"
                >
                  {INDIAN_STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
                {errors.state && (
                  <FormHelperText>{errors.state}</FormHelperText>
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Alternate Phone (Optional)"
                name="alternatePhone"
                type="number"
                value={addressData.alternatePhone}
                onChange={handleChange}
                error={!!errors.alternatePhone}
                helperText={errors.alternatePhone}
                inputProps={{ maxLength: 10 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
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
              "Save Changes"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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

export default EditAddressModal;
