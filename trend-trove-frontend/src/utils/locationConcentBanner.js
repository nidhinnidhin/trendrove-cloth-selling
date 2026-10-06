import { Box, Button, IconButton, Paper, Typography, Snackbar, Alert } from "@mui/material";
import React, { useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";

// Existing imports remain the same

// New component for location consent banner
const LocationConsentBanner = ({ onAccept, onDecline, onClose }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const handleDecline = () => {
    setSnackbarMessage("Location access denied. You can still select your delivery address manually.");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
    
    // Store preference in localStorage
    localStorage.setItem('locationPreference', 'deny');
    
    if (onDecline) {
      onDecline();
    }
  };

  const handleAccept = async () => {
    try {
      if (!navigator.geolocation) {
        setSnackbarMessage("Geolocation is not supported by your browser");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success callback
          if (onAccept) {
            onAccept(position);
          }
        },
        (error) => {
          // Error callback
          let errorMessage = "Unable to get your location. ";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
          }
          
          setSnackbarMessage(errorMessage);
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
          
          // Store preference in localStorage
          localStorage.setItem('locationPreference', 'deny');
          
          if (onDecline) {
            onDecline();
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } catch (error) {
      setSnackbarMessage("Error accessing location services");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      
      if (onDecline) {
        onDecline();
      }
    }
  };

  const handleClose = () => {
    setSnackbarMessage("You can enable location services later from your cart");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
    
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: '#f8f9fa',
          borderLeft: '4px solid #4caf50'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon sx={{ mr: 1, color: '#4caf50' }} />
          <Typography variant="body2">
            Allow location access to get accurate delivery charges and faster checkout
          </Typography>
        </Box>
        <Box>
          <Button 
            size="small" 
            variant="contained" 
            sx={{ mr: 1, bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
            onClick={handleAccept}
          >
            Allow
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleDecline}
            sx={{ mr: 1 }}
          >
            No thanks
          </Button>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LocationConsentBanner;