import React, { useState } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axiosInstance from "@/utils/adminAxiosInstance";
import { isBefore, isAfter, isToday } from "date-fns";

const darkInputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#ffffff',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
    '&:hover fieldset': { borderColor: '#FF9800' },
    '&.Mui-focused fieldset': { borderColor: '#FF9800' },
  },
  '& .MuiInputLabel-root': { color: '#B8BBC2' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#FF9800' },
};


const AddCoupon = ({ open, handleClose, handleCouponAdded }) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const validateFields = () => {
    const newErrors = {};
    if (!couponCode.trim() || couponCode.length !== 10 || /[a-z]/.test(couponCode)) {
      newErrors.couponCode = "Coupon code must be 10 characters long and contain no lowercase letters.";
    }
    if (discountType === "percentage" && (discountValue <= 0 || discountValue >= 100)) {
      newErrors.discountValue = "Percentage discount must be between 0 and 100.";
    }
    if (discountType === "fixed" && (discountValue <= 0 || discountValue >= minOrderAmount)) {
      newErrors.discountValue = "Fixed discount must be less than the minimum order amount.";
    }
    if (!startDate || isBefore(startDate, dayjs().startOf('day'))) {
      newErrors.startDate = "Start date must be today or in the future.";
    }
    if (!endDate || isBefore(endDate, startDate)) {
      newErrors.endDate = "End date must be after the start date.";
    }
    if (!minOrderAmount) newErrors.minOrderAmount = "Minimum order amount is required.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCouponCode = () => {
    setLoading(true);
    setTimeout(() => {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 10; i++) {
        code += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      setCouponCode(code);
      setLoading(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const newCoupon = {
      couponCode,
      discountType,
      discountValue,
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      minOrderAmount,
    };

    try {
      const response = await axiosInstance.post(
        "/coupon/add",
        newCoupon
      );
      handleCouponAdded(response.data.coupon)
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });
      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to add coupon",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-coupon-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 550,
            bgcolor: "#1E1F23",
            color: "#000",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{ bgcolor: "#222", color: "#fff", p: 2, textAlign: "center" }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Add New Coupon
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={8}>
                <TextField
                  label="Coupon Code"
                  variant="outlined"
                  fullWidth
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  error={!!errors.couponCode}
                  helperText={errors.couponCode}
                  sx={{ bgcolor: "#1E1F23" }}
                
          sx={darkInputSx}/>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#855c03",
                    color: "#fff",
                    "&:hover": { bgcolor: "#444" },
                    height: "100%",
                  }}
                  onClick={generateCouponCode}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    "Auto Generate"
                  )}
                </Button>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Discount Type"
                  variant="outlined"
                  fullWidth
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  sx={{ bgcolor: "#1E1F23" }}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Discount Value"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  error={!!errors.discountValue}
                  helperText={errors.discountValue}
                  sx={{ bgcolor: "#1E1F23" }}
                
          sx={darkInputSx}/>
              </Grid>
            </Grid>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={5.5}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    minDate={dayjs()}
                    sx={{ bgcolor: "#1E1F23", width: "100%" }}
                  />
                  {errors.startDate && (
                    <Typography color="error" variant="caption">
                      {errors.startDate}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={1}>
                  <Typography sx={{ color: "#666", textAlign: "center" }}>
                    to
                  </Typography>
                </Grid>
                <Grid item xs={5.5}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    minDate={startDate}
                    sx={{ bgcolor: "#1E1F23", width: "100%" }}
                  />
                  {errors.endDate && (
                    <Typography color="error" variant="caption">
                      {errors.endDate}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </LocalizationProvider>

            <TextField
              label="Minimum Order Amount"
              type="number"
              variant="outlined"
              fullWidth
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              error={!!errors.minOrderAmount}
              helperText={errors.minOrderAmount}
              sx={{ bgcolor: "#1E1F23", mb: 3 }}
            
          sx={darkInputSx}/>
          </Box>

          <Box
            sx={{ bgcolor: "#222", color: "#fff", p: 2, textAlign: "center" }}
          >
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#d49202",
                color: "#222",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#ddd" },
              }}
              onClick={handleSubmit}
            >
              Add Coupon
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddCoupon;
