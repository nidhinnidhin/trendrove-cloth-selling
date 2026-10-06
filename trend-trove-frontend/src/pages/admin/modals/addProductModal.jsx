import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Divider,
  Paper,
} from "@mui/material";

import { Controller, useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from '@mui/material/styles';
import axios from "axios";
import AddVariantModal from "./addVariantModal";
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


// Styled Components
const StyledModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalContent = styled(Paper)({
  width: '80%',
  maxWidth: '900px',
  maxHeight: '85vh',
  overflowY: 'auto',
  padding: '32px',
  borderRadius: '12px',
  backgroundColor: "#1E1F23",
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: "#555",
    borderRadius: '4px',
  },
});

const FormSection = styled(Box)({
  marginBottom: '24px',
});

const SectionTitle = styled(Typography)({
  fontSize: '16px',
  fontWeight: 600,
  color: "#ffffff",
  marginBottom: '16px',
});

const AddProductModal = ({ open, onClose, onProductAdded }) => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpenVariantModal = () => {
    setShowVariantModal(true);
  };

  const handleCloseVariantModal = () => {
    setShowVariantModal(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchBrands();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching categories",
        severity: "error",
      });
    }
  };

  const fetchBrands = async () => {
    try {
      // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/brands`);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/brands`);
      setBrands(response.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching brands",
        severity: "error",
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      const productPayload = {
        name: data.productName,
        description: data.description,
        brand: brands.find((brand) => brand.name === data.brand)?._id,
        category: categories.find((category) => category.name === data.category)
          ?._id,
        gender: data.gender,
        pattern: data.pattern,
        material: data.material,
      };

      const response = await axiosInstance.post(
        "/products/add",
        productPayload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: "Product added successfully!",
          severity: "success",
        });

        // Store the newly created product ID for variant modal
        const newProductId = response.data.product._id;

        // Call the callback to update parent component with complete product data
        if (onProductAdded) {
          onProductAdded(response.data.product);
        }

        reset(); // Reset form
        
        // Close the product modal
        onClose();
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setSnackbar({
        open: true,
        message: "Failed to add product. Please try again.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <StyledModal open={open} onClose={onClose}>
        <ModalContent elevation={3}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600,
              color: "#FF9800",
              fontSize: '24px'
            }}>
              Add New Product
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information Section */}
            <FormSection>
              <SectionTitle>Basic Information</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name="productName"
                    control={control}
                    rules={{ required: "Product Name is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Product Name"
                        fullWidth
                        error={!!errors.productName}
                        helperText={errors.productName?.message}
                        placeholder="Enter product name"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: "#FF9800",
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: "Description is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        placeholder="Enter product description"
          sx={darkInputSx}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* Classification Section */}
            <FormSection>
              <SectionTitle>Product Classification</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="brand"
                    control={control}
                    rules={{ required: "Brand is required" }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.brand}>
                        <InputLabel>Brand</InputLabel>
                        <Select
                          {...field}
                          label="Brand"
                          sx={{ backgroundColor: "#1E1F23" }}
                        >
                          {brands.map((brand) => (
                            <MenuItem key={brand._id} value={brand.name}>
                              {brand.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.brand && (
                          <Typography color="error" variant="caption">
                            {errors.brand.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: "Category is required" }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.category}>
                        <InputLabel>Category</InputLabel>
                        <Select
                          {...field}
                          label="Category"
                          sx={{ backgroundColor: "#1E1F23" }}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category._id} value={category.name}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.category && (
                          <Typography color="error" variant="caption">
                            {errors.category.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* Details Section */}
            <FormSection>
              <SectionTitle>Product Details</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: "Gender is required" }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.gender}>
                        <InputLabel>Gender</InputLabel>
                        <Select {...field} label="Gender">
                          <MenuItem value="Men">Men</MenuItem>
                          <MenuItem value="Women">Women</MenuItem>
                          <MenuItem value="Unisex">Unisex</MenuItem>
                        </Select>
                        {errors.gender && (
                          <Typography color="error" variant="caption">
                            {errors.gender.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="pattern"
                    control={control}
                    rules={{ required: "Pattern is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Pattern"
                        fullWidth
                        error={!!errors.pattern}
                        helperText={errors.pattern?.message}
          sx={darkInputSx}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="material"
                    control={control}
                    rules={{ required: "Material is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Material"
                        fullWidth
                        error={!!errors.material}
                        helperText={errors.material?.message}
          sx={darkInputSx}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* Submit Button */}
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                sx={{
                  py: 1.5,
                  backgroundColor: "#FF9800",
                  fontSize: '16px',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: "#F57C00",
                  },
                }}
              >
                Add Product
              </Button>
            </Box>
          </form>
        </ModalContent>
      </StyledModal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddProductModal;
