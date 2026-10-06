import React, { useEffect } from 'react';
import { useRouter } from 'next/router'; 
import AdminHeader from "../components/adminHeader";
import LoginForm from "../components/loginForm";
import AdminFooter from "../components/adminfooter";
import { Box } from '@mui/material';

const Login = () => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `linear-gradient(135deg, rgba(12, 14, 22, 0.78) 0%, rgba(5, 6, 12, 0.85) 100%), url('/images/admin_login_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <AdminHeader />
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          py: 6,
          px: 2 
        }}
      >
        <LoginForm />
      </Box>
      <AdminFooter />
    </Box>
  );
};

export default Login;
