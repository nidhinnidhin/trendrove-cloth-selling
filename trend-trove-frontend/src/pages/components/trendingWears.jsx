import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import styled from "@emotion/styled";
import { useRouter } from "next/router";

// Styled Components
const CarouselContainer = styled(Box)`
  width: 100%;
  max-width: 1400px;
  margin: 20px auto;
  padding: 20px;
  position: relative;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const CarouselViewport = styled(Box)`
  position: relative;
  overflow: hidden;
  padding: 0 40px;
  
  @media (max-width: 768px) {
    padding: 0 16px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const ProductsWrapper = styled(Box)`
  display: flex;
  gap: 24px;
  transition: transform 0.5s ease;

  @media (max-width: 768px) {
    transform: none !important;
    width: fit-content;
  }
`;

const ProductCard = styled(Card)`
  min-width: 260px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    min-width: 200px;
  }
`;

const ProductImage = styled(CardMedia)`
  height: 360px;
  width: 100%;
  background-color: #f8f8f8;
  transition: transform 0.3s ease;
  object-fit: contain;
`;

const NavigationButton = styled(IconButton)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #fff;
  border: 1px solid #e0e0e0;
  width: 40px;
  height: 40px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }

  &:hover {
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  & .MuiSvgIcon-root {
    font-size: 24px;
    color: #666;
  }
`;

const PaginationDot = styled(Box)`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) => (props.active ? "#333" : "#ddd")};
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
`;

const TrendingWears = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const itemsPerView = 4;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090/api";
        const response = await fetch(`${API_URL}/products/get?page=1&limit=8`);
        const data = await response.json();

        // Filter products for trending wears category
        const trendingProducts = (data?.products || []).filter(
          (product) => product.category?.name === "Trending Wears"
        );

        const transformedProducts = trendingProducts.map((product) => {
          const variant = product.variants[0];
          const firstSize = variant.sizes[0];
          return {
            id: product._id,
            name: product.name,
            price: `₹${firstSize.discountPrice || firstSize.price}`,
            image: variant.mainImage,
          };
        });
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.ceil(products.length / itemsPerView) - 1;
      return prev < maxIndex ? prev + 1 : 0;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.ceil(products.length / itemsPerView) - 1;
      return prev > 0 ? prev - 1 : maxIndex;
    });
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        {/* You can add a loading spinner here if you want */}
      </Box>
    );
  }

  // Don't render if no products
  if (products.length === 0) {
    return null;
  }

  return (
    <CarouselContainer>
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          marginBottom: 5,
          fontWeight: 700,
          color: "#2d3436",
          fontFamily: "'Poppins', sans-serif",
          fontSize: { xs: "1.5rem", md: "2rem" },
          position: "relative",
          display: "inline-block",
          margin: "0 auto 40px",
          padding: "0 20px",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: "-10px",
            left: "50%",
            width: "60px",
            height: "3px",
            background: "linear-gradient(90deg, #6c5ce7, #a8e6cf)",
            transform: "translateX(-50%)"
          }
        }}
      >
        Trending Wears
      </Typography>

      <CarouselViewport>
        <NavigationButton onClick={handlePrev} sx={{ left: 0 }}>
          <ChevronLeft />
        </NavigationButton>

        <ProductsWrapper
          sx={{
            transform: `translateX(-${currentIndex * 100}%)`,
            display: "flex",
            flexWrap: "nowrap",
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              onClick={() => handleProductClick(product.id)}
            >
              <Box sx={{ overflow: "hidden", position: "relative" }}>
                <ProductImage
                  component="img"
                  image={product.image}
                  alt={product.name}
                />
              </Box>
              <CardContent
                sx={{
                  textAlign: "center",
                  padding: "16px 12px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: "#333",
                    fontSize: "14px",
                    lineHeight: 1.4,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {product.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    fontSize: "14px",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {product.price}
                </Typography>
              </CardContent>
            </ProductCard>
          ))}
        </ProductsWrapper>

        <NavigationButton onClick={handleNext} sx={{ right: 0 }}>
          <ChevronRight />
        </NavigationButton>
      </CarouselViewport>
    </CarouselContainer>
  );
};

export default TrendingWears;
