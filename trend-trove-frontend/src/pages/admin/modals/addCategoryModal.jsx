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
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
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
  boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
  p: 4,
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
};

const AddCategoryModal = ({ open, handleClose, onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });

  const handleSubmit = async () => {
    if (categoryName.trim() === "") {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/categories/add",
        { name: categoryName }
      );
      setSnackbar({
        open: true,
        message: "Category added successfully!",
        type: "success",
      });
      setCategoryName("");
      handleClose();

      if (onCategoryAdded) {
        onCategoryAdded(response.data.category); 
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to add category. Please try again.";
      setSnackbar({ open: true, message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
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
            Add New Category
          </Typography>
          <TextField
            fullWidth
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            error={error}
            helperText={error ? "Category name is required" : ""}
            required
            disabled={loading}
          
          sx={darkInputSx}/>
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              bgcolor: "#FF9800",
              "&:hover": { bgcolor: "#F57C00" },
              position: "relative",
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress
                  size={24}
                  sx={{ color: "white", position: "absolute" }}
                />
                Adding...
              </>
            ) : (
              "Add Category"
            )}
          </Button>
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.type}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddCategoryModal;
