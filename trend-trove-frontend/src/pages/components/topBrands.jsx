import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import Image from "next/image";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import axios from "axios";

const CarouselContainer = styled(Box)`
  width: 100%;
  max-width: 1400px;
  margin: 20px auto;
  padding: 20px;
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  @media (min-width: 600px) {
    margin: 40px auto;
    padding: 40px;
  }
`;

const ProductsWrapper = styled(Box)`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 10px 0;
  
  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 600px) {
    gap: 20px;
  }
`;

const BrandCard = styled(Box)`
  flex: 0 0 calc(100% - 10px);
  position: relative;
  cursor: pointer;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;

  @media (min-width: 600px) {
    flex: 0 0 calc(50% - 10px);
    height: 400px;
  }

  @media (min-width: 960px) {
    flex: 0 0 calc(33.333% - 13.333px);
    height: 450px;
  }

  @media (min-width: 1200px) {
    flex: 0 0 calc(16.666% - 16px);
    height: 500px;
  }
  
  &:hover {
    transform: translateY(-5px);
    .overlay {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }
`;

const ImageWrapper = styled(Box)`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Overlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.7));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  transition: all 0.3s ease;
`;

const ShopNowButton = styled(Typography)`
  color: white;
  background: transparent;
  border: 2px solid white;
  padding: 8px 16px;
  font-size: 14px;
  text-transform: uppercase;
  margin-top: 10px;
  display: inline-block;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  width: fit-content;

  &:hover {
    background: white;
    color: black;
  }
`;

const NavigationButton = styled(IconButton)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.9) !important;
  color: #333;
  width: 40px;
  height: 40px;
  z-index: 2;
  
  &:hover {
    background-color: white !important;
  }

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }
`;

const TopBrands = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [brands, setBrands] = useState([]);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090/api";
        const response = await axios.get(`${API_URL}/brands`);
        setBrands(response.data || []);
      } catch (error) {
        console.error("Error fetching brands:", error.message);
      }
    };

    fetchBrands();
  }, []);

  const getVisibleItems = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    if (isDesktop) return 3;
    return 6;
  };

  const handleNext = () => {
    const visibleItems = getVisibleItems();
    setCurrentIndex((prev) => 
      (prev + 1) % (brands.length - visibleItems + 1)
    );
  };

  const handlePrev = () => {
    const visibleItems = getVisibleItems();
    setCurrentIndex((prev) => 
      (prev - 1 + (brands.length - visibleItems + 1)) % (brands.length - visibleItems + 1)
    );
  };

  const handleBrandClick = (brandId) => {
    router.push(`/productListing/searchResults?brand=${brandId}`);
  };

  return (
    <CarouselContainer>
      <Typography 
        variant="h5" 
        sx={{ 
          textAlign: "center", 
          marginBottom: { xs: 3, sm: 5 },
          fontWeight: 600,
          color: "#333",
          fontFamily: "'Poppins', sans-serif",
          fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }
        }}
      >
        Top Brands
      </Typography>
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <ProductsWrapper>
          {brands.map((brand) => (
            <BrandCard key={brand._id} onClick={() => handleBrandClick(brand._id)}>
              <ImageWrapper>
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, (max-width: 1200px) 33.333vw, 16.666vw"
                  style={{
                    objectFit: 'cover',
                  }}
                  priority
                />
                <Overlay className="overlay">
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      fontWeight: 500,
                      fontSize: { xs: "20px", sm: "22px", md: "24px" },
                      marginBottom: 1
                    }}
                  >
                    {brand.name}
                  </Typography>
                  <ShopNowButton
                    sx={{
                      fontSize: { xs: "12px", sm: "13px", md: "14px" },
                      padding: { xs: "6px 12px", sm: "8px 16px" }
                    }}
                  >
                    Shop Now
                  </ShopNowButton>
                </Overlay>
              </ImageWrapper>
            </BrandCard>
          ))}
        </ProductsWrapper>
      </Box>
    </CarouselContainer>
  );
};

export default TopBrands;
