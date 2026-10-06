import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Paper,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close"; // Import CloseIcon
import EditIcon from "@mui/icons-material/Edit"; // Import EditIcon
import axios from "axios";
import EditSizeVariantModal from "./editSizeModal";
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


const EditVariantModal = ({ open, onClose, variant }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    color: "",
    mainImage: null,
    subImages: [],
    colorImage: "",
    category: "",
    sizeVariants: [],
  });

  useEffect(() => {
    if (variant) {
      setFormData({
        color: variant.color || "",
        mainImage: variant.mainImage || null,
        subImages: variant.subImages || [],
        colorImage: variant.colorImage || "",
        category: variant.category || "",
      });
      fetchSizeVariants(variant._id);
    }
  }, [variant]);

  const fetchSizeVariants = async (variantId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        // `${process.env.NEXT_PUBLIC_API_URL}/sizes/sizes/${variantId}`
        `${process.env.NEXT_PUBLIC_API_URL}/sizes/sizes/${variantId}`
      );
      setFormData((prevData) => ({
        ...prevData,
        sizeVariants: response.data.sizeVariants || [],
      }));
    } catch (error) {
      console.error("Error fetching size variants:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "mainImage" || name === "colorImage") {
      setFormData({ ...formData, [name]: files[0] });
    } else if (name === "subImages") {
      setFormData((prevData) => ({
        ...prevData,
        subImages: [...prevData.subImages, ...Array.from(files)],
      }));
    }
  };

  const handleImageDelete = (index, type) => {
    setFormData((prevData) => {
      if (type === "subImages") {
        return {
          ...prevData,
          subImages: prevData.subImages.filter((_, idx) => idx !== index),
        };
      }
      return prevData;
    });
  };

  const handleImageEdit = (index, newImage) => {
    setFormData((prevData) => {
      const updatedSubImages = [...prevData.subImages];
      updatedSubImages[index] = newImage;
      return { ...prevData, subImages: updatedSubImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = new FormData();
    updatedData.append("color", formData.color);
    updatedData.append("category", formData.category);

    if (formData.colorImage) {
      updatedData.append("colorImage", formData.colorImage);
    }
    if (formData.mainImage) {
      updatedData.append("mainImage", formData.mainImage);
    }
    formData.subImages.forEach((img) => updatedData.append("subImages", img));

    try {
      await axiosInstance.put(
        `/variants/variant/edit/${variant._id}`,
        updatedData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onClose();
    } catch (error) {
      console.error("Error updating variant:", error);
    }
  };

  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleEditButtonClick = (sizeVariant) => {
    setSelectedVariant(sizeVariant);
    setOpenEditModal(true);
  };

  const handleEditModalClose = () => {
    setOpenEditModal(false);
  };

  const handleSaveSizeVariant = (updatedSizeVariant) => {
    const updatedSizeVariants = formData.sizeVariants.map((sv) =>
      sv._id === updatedSizeVariant._id ? updatedSizeVariant : sv
    );
    setFormData((prevData) => ({
      ...prevData,
      sizeVariants: updatedSizeVariants,
    }));
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            width: "50%",
            margin: "auto",
            mt: 5,
            p: 3,
            backgroundColor: "#1E1F23",
            borderRadius: 2,
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            overflowY: "auto",
            maxHeight: "90vh",
            position: "relative",
          }}
        >
          {/* Close Icon */}
          <IconButton
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1,
            }}
            onClick={() => onClose()}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h5"
            sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
          >
            Edit Product Variant
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Color Field */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="color"
                  label="Color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
          sx={darkInputSx}
                />
              </Grid>

              {/* Color Image Upload */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Color Image
                  <input
                    type="file"
                    accept="image/*"
                    name="colorImage"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
                {formData.colorImage && (
                  <Box mt={2} display="flex" alignItems="center" gap={2}>
                    <img
                      src={
                        formData.colorImage instanceof File
                          ? URL.createObjectURL(formData.colorImage)
                          : formData.colorImage
                      }
                      alt="Color Preview"
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      onClick={() =>
                        setFormData({ ...formData, colorImage: null })
                      }
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Box>
                )}
              </Grid>

              {/* Main Image Upload */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Main Image
                  <input
                    type="file"
                    accept="image/*"
                    name="mainImage"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
                {formData.mainImage && (
                  <Box mt={2} display="flex" alignItems="center" gap={2}>
                    <img
                      src={
                        formData.mainImage instanceof File
                          ? URL.createObjectURL(formData.mainImage)
                          : formData.mainImage
                      }
                      alt="Main Preview"
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      onClick={() =>
                        setFormData({ ...formData, mainImage: null })
                      }
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Box>
                )}
              </Grid>

              {/* Sub Images Upload */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Sub Images
                  <input
                    type="file"
                    accept="image/*"
                    name="subImages"
                    multiple
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
                <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                  {formData.subImages.map((image, index) => (
                    <Box key={index} sx={{ position: "relative" }}>
                      <img
                        src={
                          image instanceof File
                            ? URL.createObjectURL(image)
                            : image
                        }
                        alt={`Sub Image ${index}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      {/* Delete Icon */}
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: -10,
                          right: -10,
                          background: "white",
                        }}
                        onClick={() => handleImageDelete(index, "subImages")}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                      {/* Edit Icon */}
                      <IconButton
                        sx={{
                          position: "absolute",
                          bottom: -10,
                          right: -10,
                          background: "white",
                        }}
                        onClick={() => {
                          const fileInput = document.createElement("input");
                          fileInput.type = "file";
                          fileInput.accept = "image/*";
                          fileInput.onchange = (e) => {
                            const newImage = e.target.files[0];
                            if (newImage) {
                              handleImageEdit(index, newImage);
                            }
                          };
                          fileInput.click();
                        }}
                      >
                        <EditIcon color="primary" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Category Select Field */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="size-variant-label">Size Variant</InputLabel>
                  <Select
                    labelId="size-variant-label"
                    id="size-variant"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Size Variant"
                  >
                    {isLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : formData.sizeVariants.length > 0 ? (
                      formData.sizeVariants.map((sizeVariant) => (
                        <MenuItem
                          key={sizeVariant._id}
                          value={sizeVariant.size}
                        >
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={3}>
                              <Typography>{sizeVariant.size}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography>
                                {sizeVariant.description.slice(0, 30)}
                              </Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <Typography>{sizeVariant.price} $</Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Button
                                variant="filled"
                                sx={{backgroundColor:'orange', color:"white"}}
                                onClick={() =>
                                  handleEditButtonClick(sizeVariant)
                                }
                              >
                                Edit
                              </Button>
                            </Grid>
                          </Grid>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No size variants available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 4, py: 1.5, backgroundColor: "orange" }}
              type="submit"
            >
              Update Variant
            </Button>
          </form>
        </Box>
      </Modal>
      <EditSizeVariantModal
        open={openEditModal}
        onClose={handleEditModalClose}
        selectedVariant={selectedVariant}
        onSave={handleSaveSizeVariant}
      />
    </>
  );
};

export default EditVariantModal;
