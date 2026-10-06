// pages/404.js
import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/router";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function Custom404() {
  const router = useRouter();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      textAlign="center"
      bgcolor="#000"
      color="#fff"
      p={4}
    >
      <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold' }}>
        404
      </Typography>
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1592561199818-6b69d3d1d6e2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YXN0cm9uYXV0fGVufDB8fDB8fHww"
        alt="Astronaut"
        sx={{ width: '200px', mb: 2 }}
      />
      <Typography variant="h4" gutterBottom>
        Oops! You ran out of oxygen.
      </Typography>
      <Typography variant="body1" mb={3}>
        The page you're looking for is now beyond our reach. Let's get you..
      </Typography>
      <Button variant="contained" color="primary" onClick={() => router.push("/")}>
        Back Home
      </Button>
    </Box>
  );
}