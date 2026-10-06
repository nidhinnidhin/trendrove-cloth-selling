import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
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


const AddBanner = ({ open, handleClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    image: null,
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      formDataToSend.append('image', formData.image);

      // const response = await axios.post('https://www.trendrove.shop/api/banners/add', formDataToSend, {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/banners/add`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess(response.data.banner);
      handleClose();
      setFormData({ title: '', description: '', discount: '', image: null });
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding banner');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: {
          backgroundColor: "#1E1F23",
          color: 'white',
          minWidth: '500px',
        },
      }}
    >
      <DialogTitle sx={{ color: '#FF9800' }}>Add New Banner</DialogTitle>
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
          <input
            accept="image/*"
            type="file"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="banner-image-upload"
          />
          <label htmlFor="banner-image-upload">
            <Button
              variant="contained"
              component="span"
              sx={{
                backgroundColor: '#FF9800',
                color: 'white',
                '&:hover': { backgroundColor: '#F57C00' },
              }}
            >
              Upload Image
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
          onClick={handleClose}
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
          Add Banner
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBanner;
