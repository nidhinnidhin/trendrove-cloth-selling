import React from "react";
import { Box, Typography, Container, Link } from "@mui/material";

const AdminFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "rgba(10, 10, 15, 0.75)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        
        py: 2.5,
        position: "relative",
        bottom: 0,
        width: "100%",
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              mb: { xs: 1, sm: 0 },
              fontWeight: 400,
              letterSpacing: "0.5px",
            }}
          >
            © {new Date().getFullYear()} TREND TROVE. All Rights Reserved.
          </Typography>
          <Box>
            <Link 
              href="#" 
              color="inherit" 
              sx={{ 
                mx: 1.5,
                textDecoration: "none",
                "&:hover": { color: "#999" },
                transition: "color 0.3s ease",
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="#" 
              color="inherit" 
              sx={{ 
                mx: 1.5,
                textDecoration: "none",
                "&:hover": { color: "#999" },
                transition: "color 0.3s ease",
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminFooter;
