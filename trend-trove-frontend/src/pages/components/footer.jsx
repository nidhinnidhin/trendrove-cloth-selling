import React from "react";
import {
  Box,
  Typography,
  Link,
  Grid,
  Container,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
} from "@mui/icons-material";

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "#fff", pt: 8, pb: 4 }}>
      <Divider sx={{marginBottom:"100px"}}/>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Customer Information */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Customer Information
            </Typography>
            <Link href="/shipping" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Shipping
            </Link>
            <Link href="/payment" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Payment Information
            </Link>
            <Link href="/returns" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Returns
            </Link>
            <Link href="/contact" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Contact Us | Customer Care
            </Link>
            <Link href="/size-charts" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Sizing Charts
            </Link>
          </Grid>

          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3} >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Company Info
            </Typography>
            <Link href="/about" color="inherit" sx={{ display: 'block', mb: 1 }}>
              About
            </Link>
            <Link href="/blog" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Blog
            </Link>
            <Link href="/careers" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Careers
            </Link>
            <Link href="/faqs" color="inherit" sx={{ display: 'block', mb: 1 }}>
              FAQs
            </Link>
            <Link href="/fabric-innovation" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Fabric Innovation
            </Link>
          </Grid>

          {/* Useful Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Useful Links
            </Typography>
            <Link href="/wholesale" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Wholesale Request
            </Link>
            <Link href="/medical-program" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Medical Professional Program
            </Link>
            <Link href="/catalogs" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Catalogs
            </Link>
            <Link href="/accessibility" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Accessibility Settings
            </Link>
          </Grid>

          {/* Newsletter Subscription */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Subscribe to Trend Trove emails
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Your email address"
                variant="outlined"
                size="small"
                sx={{
                  backgroundColor: '#fff',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                  },
                }}
              />
            </Box>
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#000',
                color: '#fff',
                '&:hover': {
                  bgcolor: '#333',
                },
                textTransform: 'none',
                mb: 2,
              }}
            >
              Subscribe
            </Button>
            <FormControlLabel
              control={
                <Checkbox size="small" />
              }
              label={
                <Typography variant="body2">
                  I agree with the{' '}
                  <Link href="/terms" color="inherit" sx={{ textDecoration: 'underline' }}>
                    terms and conditions
                  </Link>
                </Typography>
              }
            />
          </Grid>
        </Grid>

        {/* Social Media Links */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 4 }}>
          <Link href="#" color="inherit">
            <Facebook />
          </Link>
          <Link href="#" color="inherit">
            <Twitter />
          </Link>
          <Link href="#" color="inherit">
            <Instagram />
          </Link>
          <Link href="#" color="inherit">
            <LinkedIn />
          </Link>
          <Link href="#" color="inherit">
            <YouTube />
          </Link>
        </Box>

        {/* Bottom Links */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
          <Link href="/privacy" color="inherit" sx={{ fontSize: '0.875rem' }}>
            Privacy Policy
          </Link>
          <Link href="/terms" color="inherit" sx={{ fontSize: '0.875rem' }}>
            Terms & Conditions
          </Link>
          <Link href="/gift-card" color="inherit" sx={{ fontSize: '0.875rem' }}>
            Gift Card Policy
          </Link>
        </Box>

        {/* Copyright */}
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ color: '#666', fontSize: '0.875rem' }}
        >
          © 2018-2025 Trend Trove
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
