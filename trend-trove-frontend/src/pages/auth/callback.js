import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Box } from '@mui/material';

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const { token, error } = router.query;

    if (error) {
      console.error('Authentication error:', error);
      router.push('/authentication/loginSignup?error=' + error);
      return;
    }

    if (token) {
      localStorage.setItem('usertoken', token);
      router.push('/');
    }
  }, [router.query]);

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );
};

export default AuthCallback; 