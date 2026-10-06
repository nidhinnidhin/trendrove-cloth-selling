import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090/api";
        const response = await axios.get(`${API_URL}/banners`);
        // Filter only active banners
        const activeBanners = (response.data || []).filter(banner => banner?.isActive);
        setBanners(activeBanners);
      } catch (error) {
        console.error("Error fetching banners:", error.message);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleNavigation = (direction) => {
    if (banners.length === 0) return;

    if (direction === 'prev') {
      setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    } else {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "60vh", sm: "70vh", md: "80vh", lg: "90vh", xl: "95vh" },
        width: "100%",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        marginTop: { xs: "50px", md: "60px", lg: "70px" }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {banners.map((banner, index) => (
        <AnimatePresence key={banner._id} mode="wait">
          {currentSlide === index && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",                  },
                }}
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  layout="fill"
                  objectFit="cover"
                  priority
                  quality={100}
                />
              </Box>

              <Box
                sx={{
                  position: "relative",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  px: { xs: 3, sm: 6, md: 10, lg: 12, xl: 14 },
                  maxWidth: { xs: "100%", sm: "90%", md: "1400px", lg: "1600px", xl: "1800px" },
                  margin: "0 auto",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                >
                  <Box sx={{ maxWidth: { xs: "100%", md: "60%" } }}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      <Typography
                        variant="overline"
                        sx={{
                          color: "#FF6B6B",
                          fontSize: { xs: "0.9rem", md: "1.1rem" },
                          letterSpacing: "4px",
                          mb: 2,
                          display: "block",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                          fontWeight: 600
                        }}
                      >
                        SPECIAL OFFER
                      </Typography>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    >
                      <Typography
                        variant="h1"
                        sx={{
                          color: "#2D3748",
                          fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
                          fontWeight: 800,
                          lineHeight: 1.1,
                          mb: 2,
                          textTransform: "uppercase",
                          textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                          letterSpacing: "-1px"
                        }}
                      >
                        {banner.title}
                      </Typography>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.6 }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          color: "#FF6B6B",
                          fontWeight: 700,
                          mb: 3,
                          textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                        }}
                      >
                        UP TO {banner.discount}% OFF
                      </Typography>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#4A5568",
                          fontSize: { xs: "1.1rem", md: "1.3rem" },
                          mb: 4,
                          maxWidth: "600px",
                          lineHeight: 1.6,
                          fontWeight: 500
                        }}
                      >
                        {banner.description}
                      </Typography>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4, duration: 0.6 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      
                    </motion.div>
                    <Link href="/productListing/explore">
                        <Button
                          variant="contained"
                          sx={{
                            background: "linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)",
                            color: "white",
                            padding: "15px 40px",
                            fontSize: { xs: "1rem", md: "1.1rem" },
                            fontWeight: 600,
                            borderRadius: "30px",
                            textTransform: "uppercase",
                            boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 10px 4px rgba(255, 105, 135, .4)",
                              background: "linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)"
                            }
                          }}
                        >
                          Shop Now
                        </Button>
                      </Link>
                  </Box>
                </motion.div>
                
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      ))}

  
      {/* Navigation Arrows */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 2, md: 4 },
          pointerEvents: "none",
          zIndex: 2
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          style={{ pointerEvents: "auto" }}
        >
          <IconButton
            onClick={() => handleNavigation('prev')}
            sx={{
              backgroundColor: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(10px)",
              color: "#FF6B6B",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#FF6B6B",
                color: "white",
                transform: "scale(1.1)"
              },
            }}
          >
            <ChevronLeft />
          </IconButton>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.1 }}
          style={{ pointerEvents: "auto" }}
        >
          <IconButton
            onClick={() => handleNavigation('next')}
            sx={{
              backgroundColor: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(10px)",
              color: "#FF6B6B",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#FF6B6B",
                color: "white",
                transform: "scale(1.1)"
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Slider;
