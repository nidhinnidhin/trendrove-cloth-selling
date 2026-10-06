import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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


const EditBrandModal = ({ open, onClose, brand, handleBrandUpdated }) => {
  console.log(brand);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (brand) {
      setName(brand.name || "");
      setImage(brand.image || "");
    }
  }, [brand]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setImage(file);
    }
  };

  const handleUpdate = async () => {
    if (name.trim() === "") {
      setSnackbar({
        open: true,
        message: "Brand name cannot be empty!",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      if (image instanceof File) {
        formData.append("image", image);
      }

      const response = await axiosInstance.patch(
        `/brands/edit/${brand._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      handleBrandUpdated(response.data.brand);
      setSnackbar({
        open: true,
        message: "Brand updated successfully!",
        severity: "success",
      });
      onClose();
    } catch (error) {
      console.error("Error updating brand:", error);
      setSnackbar({
        open: true,
        message: "Failed to update brand. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Modal open={open} onClose={onClose} aria-labelledby="edit-brand-modal">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#1E1F23",
            borderRadius: 2,
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            p: 4,
          }}
        >
          <Typography
            id="edit-brand-modal"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Edit Brand
          </Typography>
          <TextField
            fullWidth
            label="Brand Name"
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            margin="normal"
          
          sx={darkInputSx}/>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "20px",
            }}
          >
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="upload-image"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="upload-image" style={{ cursor: "pointer" }}>
              <IconButton color="primary" component="span">
                <CloudUploadIcon />
              </IconButton>
              Upload Image
            </label>
            {selectedImage || image ? (
              <img
                src={selectedImage || image}
                alt="Brand Preview"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  marginTop: "10px",
                  marginBottom: "20px",
                }}
              />
            ) : null}
          </div>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              sx={{ bgcolor: "#FF9800", "&:hover": { bgcolor: "#F57C00" } }}
              onClick={handleUpdate}
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Update Brand"
              )}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar for success or error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditBrandModal;
