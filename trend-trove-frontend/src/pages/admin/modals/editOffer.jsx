import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axiosInstance from "@/utils/adminAxiosInstance";

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


const EditOfferModal = ({ open, handleClose, offer, handleOfferUpdated }) => {
  const [offerName, setOfferName] = useState(offer?.offerName || "");
  const [offerType, setOfferType] = useState(offer?.offerType || "product");
  const [discountValue, setDiscountValue] = useState(
    offer?.discountValue || ""
  );
  const [startDate, setStartDate] = useState(dayjs(offer?.startDate));
  const [endDate, setEndDate] = useState(dayjs(offer?.endDate));
  const [selectedItems, setSelectedItems] = useState(offer?.items || []);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchProducts();
    }
  }, [open]);

  useEffect(() => {
    if (offer) {
      setOfferName(offer.offerName);
      setOfferType(offer.offerType);
      setDiscountValue(offer.discountValue);
      setStartDate(dayjs(offer.startDate));
      setEndDate(dayjs(offer.endDate));
      setSelectedItems(offer.items);
    }
  }, [offer]);

  const fetchCategories = async () => {
    try {
      // const response = await axios.get("https://www.trendrove.shop/api/categories");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        // `${process.env.NEXT_PUBLIC_API_URL}/products/get`
        `${process.env.NEXT_PUBLIC_API_URL}/products/get`
      );
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!offerName.trim()) newErrors.offerName = "Offer name is required";
    if (!discountValue) newErrors.discountValue = "Discount % is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (selectedItems.length === 0)
      newErrors.selectedItems = "At least one item must be selected";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const updatedOffer = {
      offerName,
      offerType,
      discountValue: parseFloat(discountValue),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      items: selectedItems,
    };

    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/offer/edit/${offer._id}`,
        updatedOffer,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      handleOfferUpdated(response.data.offer);
      setSnackbar({
        open: true,
        message: "Offer updated successfully",
        severity: "success",
      });
      handleClose();
    } catch (error) {
      console.error(
        "Error updating offer:",
        error.response?.data || error.response
      );
      setSnackbar({
        open: true,
        message: "Failed to update offer",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="edit-offer-modal">
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
          sx={{
            bgcolor: "#222",
            color: "#fff",
            p: 2,
            textAlign: "center",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Edit Offer
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 3 }}>
          <TextField
            label="Offer Name"
            fullWidth
            value={offerName}
            onChange={(e) => setOfferName(e.target.value)}
            sx={{ bgcolor: "#1E1F23", mb: 2 }}
          
          sx={darkInputSx}/>
          <TextField
            select
            label="Offer Type"
            fullWidth
            value={offerType}
            onChange={(e) => setOfferType(e.target.value)}
            sx={{ bgcolor: "#1E1F23", mb: 2 }}
          >
            <MenuItem value="product">Product</MenuItem>
            <MenuItem value="category">Category</MenuItem>
          </TextField>
          <TextField
            label="Discount %"
            type="number"
            fullWidth
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            sx={{ bgcolor: "#1E1F23", mb: 2 }}
          
          sx={darkInputSx}/>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>

        <Box sx={{ bgcolor: "#222", color: "#fff", p: 2, textAlign: "center" }}>
          <Button
            variant="contained"
            fullWidth
            sx={{ bgcolor: "#1E1F23", color: "#222" }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Update Offer"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditOfferModal;
