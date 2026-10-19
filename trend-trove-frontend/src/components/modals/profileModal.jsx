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
  Typography,
  Divider,
  Grid,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "@/utils/axiosInstance";

const ProfileModal = ({
  open,
  handleClose,
  user,
  profileImage,
  onProfileUpdate,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    image: null,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Sync state whenever modal opens or user changes
  useEffect(() => {
    if (user && open) {
      setFormData({
        firstName: user.firstname || "",
        lastName: user.lastname || "",
        userName: user.username || "",
        email: user.email || "",
        image: null,
      });
      setSelectedImage(null);
      setErrors({});
    }
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    const form = new FormData();
    form.append("firstname", formData.firstName.trim());
    form.append("lastname", formData.lastName.trim());
    form.append("username", formData.userName.trim());
    form.append("email", formData.email.trim());
    if (formData.image) {
      form.append("image", formData.image);
    }

    try {
      const response = await axiosInstance.put(
        `/users/editProfile/${user._id}`,
        form
      );

      if (response.data) {
        setSnackbarMessage(response.data.message || "Profile updated successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        if (onProfileUpdate) {
          onProfileUpdate({
            ...user,
            ...response.data.user,
          });
        }
        setTimeout(() => {
          handleClose();
        }, 600);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbarMessage(
        error.response?.data?.message || "Failed to update profile. Please try again."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            bgcolor: "#ffffff",
            boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2.5,
            borderBottom: "1px solid #f3f4f6",
            bgcolor: "#ffffff",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
              Edit Profile
            </Typography>
            <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.2 }}>
              Update your personal information and profile picture.
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#6b7280" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ p: 3.5, bgcolor: "#ffffff" }}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Avatar Section */}
            <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
              <Box position="relative">
                <Avatar
                  src={selectedImage || profileImage || user?.image || ""}
                  alt={formData.firstName || "Profile"}
                  sx={{
                    width: 96,
                    height: 96,
                    bgcolor: "#111827",
                    color: "#ffffff",
                    fontSize: "2rem",
                    fontWeight: 700,
                    border: "3px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  {formData.firstName ? formData.firstName[0]?.toUpperCase() : "U"}
                </Avatar>

                {/* Upload Button Overlay */}
                <IconButton
                  component="label"
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "#111827",
                    color: "#ffffff",
                    border: "2px solid #ffffff",
                    "&:hover": {
                      bgcolor: "#1f2937",
                    },
                    p: 0.8,
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <PhotoCamera sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>
                Click the camera icon to upload a new photo
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "#f3f4f6" }} />

            {/* Input Fields Grid */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                  fullWidth
                  size="medium"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      "&.Mui-focused fieldset": { borderColor: "#111827" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#111827" },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  fullWidth
                  size="medium"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      "&.Mui-focused fieldset": { borderColor: "#111827" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#111827" },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Username"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  error={Boolean(errors.userName)}
                  helperText={errors.userName}
                  fullWidth
                  size="medium"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      "&.Mui-focused fieldset": { borderColor: "#111827" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#111827" },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  fullWidth
                  size="medium"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      "&.Mui-focused fieldset": { borderColor: "#111827" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#111827" },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        {/* Actions */}
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: "1px solid #f3f4f6",
            bgcolor: "#fafafa",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={loading}
            sx={{
              color: "#111827",
              borderColor: "#d1d5db",
              "&:hover": { borderColor: "#111827", bgcolor: "#f3f4f6" },
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#111827",
              color: "#ffffff",
              "&:hover": { bgcolor: "#1f2937" },
              fontWeight: 600,
              px: 3.5,
              py: 1,
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#ffffff" }} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%", fontWeight: 500 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProfileModal;
