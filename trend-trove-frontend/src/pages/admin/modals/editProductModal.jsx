import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";

import Image from "next/image";
import { Edit } from "@mui/icons-material";
import EditVariantModal from "./editVariantModel";
import axiosInstance from "@/utils/adminAxiosInstance";
import { styled } from "@mui/material/styles";

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


const StyledModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalContent = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: theme.shadows[5],
  width: '60%',
  maxHeight: '90vh',
  overflowY: 'auto',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
}));

const VariantCard = styled(Paper)(({ theme }) => ({
  padding: '16px',
  marginBottom: '16px',
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  border: '1px solid #e0e0e0',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderColor: '#bdbdbd',
  }
}));

const ImageContainer = styled(Box)({
  position: 'relative',
  width: '80px',
  height: '80px',
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  overflow: 'hidden',
  border: '1px solid #e0e0e0',
});

const EditProductModal = ({
  open,
  handleClose,
  product,
  handleProductUpdated,
}) => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("");
  const [material, setMaterial] = useState("");
  const [pattern, setPattern] = useState("");
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (product) {
      setProductName(product.name || "");
      setDescription(product.description || "");
      setGender(product.gender || "");
      setMaterial(product.material || "");
      setPattern(product.pattern || "");
      fetchVariants(product._id);
    }
  }, [product]);

  const fetchVariants = async (productId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        // `${process.env.NEXT_PUBLIC_API_URL}/variants/variant/get/${productId}`
        `${process.env.NEXT_PUBLIC_API_URL}/variants/variant/get/${productId}`
      );
      setVariants(response.data.variants || []);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching variants.",
        severity: "error",
      });
      console.error("Error fetching variants:", error);
    }
    setIsLoading(false);
  };

  const handleVariantEditClick = (variant) => {
    setSelectedVariant(variant);
    setOpenVariantModal(true);
  };

  const handleUpdateProduct = async () => {
    const updatedProductData = {
      name: productName,
      description: description,
      gender: gender,
      material: material,
      pattern: pattern,
    };

    try {
      const response = await axiosInstance.put(
        `/products/update/${product._id}`,
        updatedProductData
      );

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: "Product updated successfully!",
          severity: "success",
        });
        handleProductUpdated(response.data.product);
        handleClose();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error updating product.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <StyledModal
        open={open}
        onClose={handleClose}
        aria-labelledby="edit-product-modal"
      >
        <ModalContent elevation={3}>
          <Typography variant="h5" component="h2" gutterBottom>
            Edit Product
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              fullWidth
              label="Product Name"
              variant="outlined"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            
          sx={darkInputSx}/>
            <TextField
              fullWidth
              label="Product Description"
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            
          sx={darkInputSx}/>
            <TextField
              fullWidth
              label="Gender"
              variant="outlined"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            
          sx={darkInputSx}/>
            <TextField
              fullWidth
              label="Material"
              variant="outlined"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              required
            
          sx={darkInputSx}/>
            <TextField
              fullWidth
              label="Pattern"
              variant="outlined"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              required
            
          sx={darkInputSx}/>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2 
            }}>
              <SectionTitle>Product Variants</SectionTitle>
              <Typography variant="body2" color="text.secondary">
                {variants.length} variants
              </Typography>
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {variants.map((variant) => (
                  <Grid item xs={12} key={variant._id}>
                    <VariantCard>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <ImageContainer>
                            <Image
                              src={variant.colorImage}
                              alt={variant.color}
                              layout="fill"
                              objectFit="cover"
                            />
                          </ImageContainer>
                        </Grid>
                        <Grid item xs>
                          <Box>
                            <Typography variant="subtitle1" sx={{ 
                              fontWeight: 600,
                              color: "#FF9800",
                              mb: 1
                            }}>
                              {variant.color}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {variant.sizes?.map((size) => (
                                <Box
                                  key={size._id}
                                  sx={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: size.inStock ? '#e8f5e9' : '#ffebee',
                                    color: size.inStock ? '#2e7d32' : '#c62828',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  {size.size}: {size.stockCount}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item>
                          <ImageContainer sx={{ width: '100px', height: '100px' }}>
                            <Image
                              src={variant.mainImage}
                              alt="Main"
                              layout="fill"
                              objectFit="cover"
                            />
                          </ImageContainer>
                        </Grid>
                        <Grid item>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              onClick={() => handleVariantEditClick(variant)}
                              sx={{
                                backgroundColor: '#FF9800',
                                '&:hover': {
                                  backgroundColor: '#F57C00',
                                },
                              }}
                              startIcon={<Edit />}
                            >
                              Edit Variant
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </VariantCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleUpdateProduct}
            sx={{
              mt: 2,
              py: 1.5,
              backgroundColor: "#FF9800",
              fontSize: '16px',
              fontWeight: 500,
              '&:hover': { backgroundColor: "#F57C00",
              },
            }}
          >
            Update Product
          </Button>
        </ModalContent>
      </StyledModal>

      <EditVariantModal
        open={openVariantModal}
        onClose={() => setOpenVariantModal(false)}
        variant={selectedVariant}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditProductModal;
