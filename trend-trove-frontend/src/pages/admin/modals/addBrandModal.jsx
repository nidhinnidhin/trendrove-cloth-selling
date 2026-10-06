import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
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


const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "#1E1F23",
  color: "#ffffff",
  boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
  p: 4,
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
};


const AddBrandModal = ({ open, handleClose }) => {
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBrandImage(file);
    }
  };

  const handleRemoveImage = () => {
    setBrandImage(null);
  };

  const handleSubmit = async () => {
    if (brandName.trim() === "") {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);

    const formData = new FormData();
    formData.append("name", brandName);
    if (brandImage) {
      formData.append("image", brandImage);
    }

    try {
      const response = await axiosInstance.post("/brands/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {

        setSnackbar({
          open: true,
          message: response.data.message || "Brand added successfully!",
          type: "success",
        });

        setBrandName("");
        setBrandImage(null);
        handleClose();
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error("Error adding brand:", err); 
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          "Failed to add brand. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", type: "" });
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" mb={2}>
            Add New Brand
          </Typography>
          <TextField
            fullWidth
            label="Brand Name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            error={error}
            helperText={error ? "Brand name is required" : ""}
            required
            disabled={loading}
          
          sx={darkInputSx}/>
          <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<AddPhotoAlternateIcon />}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            <Typography>
              {brandImage ? brandImage.name : "No image selected"}
            </Typography>
          </Box>
          {brandImage && (
            <Box sx={{ mt: 2, position: "relative", display: "inline-block" }}>
              <img
                src={URL.createObjectURL(brandImage)}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "150px",
                  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
              <IconButton
                onClick={handleRemoveImage}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              bgcolor: "#FF9800",
              "&:hover": { bgcolor: "#F57C00" },
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Adding Brand..." : "Add Brand"}
          </Button>
        </Box>
      </Modal>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.type}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddBrandModal;
