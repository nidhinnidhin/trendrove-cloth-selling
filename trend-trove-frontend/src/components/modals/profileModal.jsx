import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
  IconButton,
  Snackbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import axiosInstance from "@/utils/axiosInstance";
import { styled } from '@mui/material/styles';

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    overflow: 'hidden',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#1a1a1a',
  color: 'white',
  padding: theme.spacing(2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: '#f8f8f8',
  padding: theme.spacing(3),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  backgroundColor: '#f8f8f8',
  padding: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: 8,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#FF9800',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#FF9800',
    },
  },
}));

const ProfileModal = ({
  open,
  handleClose,
  user,
  profileImage,
  onProfileUpdate,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstname || "",
        lastName: user.lastname || "",
        userName: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setFormData({ ...formData, image: file });
    }
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSave = async () => {
    setEditMode(false);
    setLoading(true);
    const form = new FormData();
    form.append("firstname", formData.firstName);
    form.append("lastname", formData.lastName);
    form.append("username", formData.userName);
    form.append("email", formData.email);
    if (formData.image) {
      form.append("image", formData.image);
    }

    try {
      const response = await axiosInstance.put(
        `users/editProfile/${user._id}`,
        form
      );
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");

      onProfileUpdate(response.data.user);
      setSnackbarOpen(true);
      handleClose();
    } catch (error) {
      setSnackbarMessage(
        response?.response?.data?.message || "Error updating profile"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        {editMode ? "Edit Profile" : "User Profile"}
      </StyledDialogTitle>
      
      <StyledDialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box position="relative">
            <Avatar
              src={selectedImage || profileImage || "/default-avatar.png"}
              alt="Profile"
              sx={{ 
                width: 100, 
                height: 100,
                border: '3px solid #FF9800',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            {editMode && (
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#FF9800',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#F57C00',
                  },
                }}
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <PhotoCamera />
              </IconButton>
            )}
          </Box>

          <StyledTextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
          />
          <StyledTextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
          />
          <StyledTextField
            label="User Name"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
          />
          <StyledTextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
          />
        </Box>
      </StyledDialogContent>

      <StyledDialogActions>
        {editMode ? (
          <Button
            onClick={handleSave}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#FF9800',
              color: 'white',
              '&:hover': {
                backgroundColor: '#F57C00',
              },
              '&:disabled': {
                backgroundColor: '#FFB74D',
              },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
          </Button>
        ) : (
          <Button
            onClick={() => setEditMode(true)}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#FF9800',
              color: 'white',
              '&:hover': {
                backgroundColor: '#F57C00',
              },
            }}
          >
            Edit
          </Button>
        )}
        <Button
          onClick={handleClose}
          variant="outlined"
          fullWidth
          sx={{
            borderColor: '#FF9800',
            color: '#FF9800',
            '&:hover': {
              borderColor: '#F57C00',
              backgroundColor: 'rgba(255, 152, 0, 0.08)',
            },
          }}
        >
          Close
        </Button>
      </StyledDialogActions>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </StyledDialog>
  );
};

export default ProfileModal;
