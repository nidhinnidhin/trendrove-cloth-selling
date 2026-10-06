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

const CarouselContainer = styled(Box)`
  width: 100%;
  max-width: 1400px;
  margin: 20px auto;
  padding: 20px;
  position: relative;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const CarouselViewport = styled(Box)`
  position: relative;
  overflow-x: auto;
  padding: 0 20px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    padding: 0 40px;
  }
`;

const ProductsWrapper = styled(Box)`
  display: flex;
  gap: 16px;
  width: fit-content;
  padding: 10px 0;

  @media (min-width: 768px) {
    gap: 24px;
  }
`;

const ProductCard = styled(Card)`
  min-width: 200px;
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

  @media (min-width: 768px) {
    min-width: 260px;
  }
`;

const ProductImage = styled(CardMedia)`
  height: 360px;
  width: 100%;
  background-color: #f8f8f8;
  transition: transform 0.3s ease;
  object-fit: contain;
`;

const PaginationDot = styled(Box)`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#333' : '#ddd'};
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
`;

const NewArrival = () => {
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
        const response = await fetch(`${API_URL}/products/get?page=1&limit=12`);
        const data = await response.json();
        const transformedProducts = (data?.products || []).map((product) => {
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
    setCurrentIndex(prev => 
      prev + itemsPerView >= products.length ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex(prev => 
      prev === 0 ? products.length - itemsPerView : prev - 1
    );
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        {/* You can add a loading spinner here if you want */}
      </Box>
    );
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
            background: "linear-gradient(90deg, #ff6b6b, #ffd93d)",
            transform: "translateX(-50%)"
          }
        }}
      >
        New Arrivals
      </Typography>

      <CarouselViewport>
        <ProductsWrapper
          sx={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
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
                  gap: "8px"
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 600,
                    color: "#2d3436",
                    fontSize: "15px",
                    lineHeight: 1.4,
                    fontFamily: "'Poppins', sans-serif",
                    mb: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    height: "42px"
                  }}
                >
                  {product.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "#ff6b6b",
                    fontWeight: 700,
                    fontSize: "16px",
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
      </CarouselViewport>

  
    </CarouselContainer>
  );
};

export default NewArrival;