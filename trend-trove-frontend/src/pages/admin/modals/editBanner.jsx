import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';

import axiosInstance from '@/utils/adminAxiosInstance';
import axios from 'axios';

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


const EditBanner = ({ open, onClose, banner, handleBannerUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    isActive: true,
    image: null,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        description: banner.description || '',
        discount: banner.discount || '',
        isActive: banner.isActive,
        image: null,
      });
    }
  }, [banner]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('discount', formData.discount);
      formDataToSend.append('isActive', formData.isActive);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.put(
        // `${process.env.NEXT_PUBLIC_API_URL}/banners/update/${banner._id}`,
        `${process.env.NEXT_PUBLIC_API_URL}/banners/update/${banner._id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      handleBannerUpdated(response.data.banner);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating banner');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: "#1E1F23",
          color: 'white',
          minWidth: '500px',
        },
      }}
    >
      <DialogTitle sx={{ color: '#FF9800' }}>Edit Banner</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'white' },
              },
              '& .MuiInputLabel-root': { color: 'white' },
            }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            multiline
            rows={4}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'white' },
              },
              '& .MuiInputLabel-root': { color: 'white' },
            }}
          />
          <TextField
            fullWidth
            label="Discount (%)"
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleInputChange}
            required
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'white' },
              },
              '& .MuiInputLabel-root': { color: 'white' },
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleToggleChange}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#FF9800',
                  },
                }}
              />
            }
            label="Active"
            sx={{ mb: 2, color: 'white' }}
          />
          <input
            accept="image/*"
            type="file"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="banner-image-edit"
          />
          <label htmlFor="banner-image-edit">
            <Button
              variant="contained"
              component="span"
              sx={{
                backgroundColor: '#FF9800',
                color: 'white',
                '&:hover': { backgroundColor: '#F57C00' },
              }}
            >
              Change Image
            </Button>
          </label>
          {formData.image && (
            <Typography sx={{ mt: 1, color: 'white' }}>
              Selected file: {formData.image.name}
            </Typography>
          )}
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ color: '#FF9800' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: '#FF9800',
            color: 'white',
            '&:hover': { backgroundColor: '#F57C00' },
          }}
        >
          Update Banner
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditBanner;
