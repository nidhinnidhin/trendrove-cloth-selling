import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

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


const EditSizeVariantModal = ({ open, onClose, selectedVariant, onSave }) => {
  // If no selectedVariant is passed, return null
  if (!selectedVariant) return null;

  // State for the form data initialized with the selectedVariant data
  const [formData, setFormData] = useState({
    size: selectedVariant.size,
    price: selectedVariant.price,
    discountPrice: selectedVariant.discountPrice,
    stockCount: selectedVariant.stockCount,
    description: selectedVariant.description,
    inStock: selectedVariant.inStock, // New state for inStock
  });

  // Update the formData when the selectedVariant changes
  useEffect(() => {
    setFormData({
      size: selectedVariant.size,
      price: selectedVariant.price,
      discountPrice: selectedVariant.discountPrice,
      stockCount: selectedVariant.stockCount,
      description: selectedVariant.description,
      inStock: selectedVariant.inStock, // Update inStock state as well
    });
  }, [selectedVariant]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const updatedData = {
        size: formData.size,
        price: formData.price,
        discountPrice: formData.discountPrice,
        stockCount: formData.stockCount,
        description: formData.description,
        inStock: formData.inStock,
      };
  
      const response = await axiosInstance.put(
        `/sizes/sizeVariants/${selectedVariant._id}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Successfully updated size variant:", response.data);
      onSave(response.data.sizeVariant); 
      onClose();
    } catch (error) {
      console.error("Error saving changes:", error.response?.data || error.message);
    }
  };
  
  

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: "40%",
          margin: "auto",
          mt: 5,
          p: 3,
          backgroundColor: "#1E1F23",
          borderRadius: 2,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          Edit Size Variant
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Size"
              value={formData.size}
              name="size"
              onChange={handleInputChange}
          sx={darkInputSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Price"
              value={formData.price}
              name="price"
              onChange={handleInputChange}
              type="number" // Ensuring price is numeric
          sx={darkInputSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Discount Price"
              value={formData.discountPrice}
              name="discountPrice"
              onChange={handleInputChange}
              type="number" // Ensuring discountPrice is numeric
          sx={darkInputSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Stock Count"
              value={formData.stockCount}
              name="stockCount"
              onChange={handleInputChange}
              type="number" // Ensuring stockCount is numeric
          sx={darkInputSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              name="description"
              onChange={handleInputChange}
              multiline
              rows={3}
          sx={darkInputSx}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.inStock}
                  onChange={handleCheckboxChange}
                  name="inStock"
                />
              }
              label="In Stock"
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, py: 1.5, backgroundColor: "orange" }}
          onClick={handleSaveChanges}
        >
          Save Changes
        </Button>
      </Box>
    </Modal>
  );
};

export default EditSizeVariantModal;
