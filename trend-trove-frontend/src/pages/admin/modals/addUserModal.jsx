import React from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
} from "@mui/material";

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



const AddUserModal = ({ open, handleClose }) => {
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "orange",
    borderRadius: 2,
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
    padding: 4,
    width: "400px",
    outline: "none",
  };

  const inputStyle = {
    marginBottom: 2,
    "& .MuiInputBase-input": {
      backgroundColor: "#1E1F23",
    },
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            color: "white",
            marginBottom: 3,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Add New User
        </Typography>

        <TextField
          label="First Name"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        
          sx={darkInputSx}/>
        <TextField
          label="Last Name"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        
          sx={darkInputSx}/>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        
          sx={darkInputSx}/>
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        
          sx={darkInputSx}/>
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        
          sx={darkInputSx}/>
        <TextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        
          sx={darkInputSx}/>
        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "#1E1F23",
            color: "orange",
            "&:hover": { backgroundColor: "#1E1F23" },
            fontWeight: "bold",
            marginTop: 2,
          }}
          onClick={handleClose}
        >
          Add User
        </Button>
      </Box>
    </Modal>
  );
};

export default AddUserModal;
