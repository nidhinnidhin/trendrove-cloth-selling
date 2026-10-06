import React from "react";
import { useRouter } from "next/router";
import { useFilter } from "@/context/filterContext";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import Image from "next/image";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ProductsContainer = styled(Box)`
  width: 100%;
  max-width: 1400px;
  margin: 40px auto;
  padding: 0 20px;

  @media (min-width: 600px) {
    padding: 0 40px;
  }
`;

const ProductGrid = styled(Box)`
  display: grid;
  gap: 12px;
  margin-top: 30px;

  // Mobile (2 columns)
  grid-template-columns: repeat(2, 1fr);
  
  // Tablets (3 columns)
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  // Small laptops (4 columns)
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  // Desktops (6 columns)
  @media (min-width: 1280px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

const ProductCard = styled(Box)`
  cursor: pointer;
  text-align: center;
  
  &:hover {
    .product-image {
      transform: scale(1.05);
    }
  }
`;

const ImageWrapper = styled(Box)`
  position: relative;
  width: 100%;
  padding-bottom: 133%; // 4:3 aspect ratio
  margin-bottom: 8px;
  overflow: hidden;
  background-color: #f5f5f5;

  @media (min-width: 768px) {
    margin-bottom: 12px;
  }
`;

const ProductImage = styled(Image)`
  transition: transform 0.3s ease;
`;

const ProductTitle = styled(Typography)`
  font-weight: 500;
  color: #333;
  font-size: 12px;
  margin-bottom: 4px;
  font-family: 'Poppins', sans-serif;
  
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 32px;

  @media (min-width: 768px) {
    font-size: 14px;
    height: 40px;
  }
`;

const ProductPrice = styled(Typography)`
  color: #666;
  font-size: 12px;
  font-family: 'Poppins', sans-serif;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const styles = {
  container: {
    width: "100%",
    margin: "0 auto",
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  card: {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s, box-shadow 0.3s",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    },
  },
  numberBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    width: "32px",
    height: "32px",
    backgroundColor: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    zIndex: 1,
  },
  imageContainer: {
    height: 320,
    padding: "10px",
    backgroundColor: "#f7fafc",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    cursor: "pointer",
    borderRadius: "10px 10px 0 0",
  },
  contentArea: {
    flexGrow: 1,
    padding: "16px",
  },
  priceTag: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  price: {
    color: "#333",
    fontWeight: "bold",
    fontSize: "1.25rem",
  },
  metaContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },
  ratingChip: {
    backgroundColor: "#ff6f61",
    color: "white",
    fontSize: "0.75rem",
    margin: "5px 0",
    borderRadius: "4px",
    fontFamily: "'Poppins', sans-serif",
  },
  variantText: {
    fontFamily: "'Open Sans', sans-serif",
    color: "text.secondary",
  },
  actionButtons: {
    display: "flex",
    gap: "4px",
  },
};

const LoadMoreButton = styled(Button)`
  background-color:#FF9800;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  text-transform: none;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #FF9800;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .MuiButton-endIcon {
    margin-left: 8px;
    transition: transform 0.3s ease;
  }

  &:hover .MuiButton-endIcon {
    transform: translateX(4px);
  }
`;

const ButtonWrapper = styled(Box)`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 40px;
  padding-right: 20px;
`;

const Products = ({ products, loading }) => {
  const router = useRouter();
  const { filterState } = useFilter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const filterProducts = (products) => {
    if (!products) return [];
    return products.filter((product) => {
      const price = product.price;
      if (
        price < filterState.priceRange[0] ||
        price > filterState.priceRange[1]
      ) {
        return false;
      }
      if (
        filterState.categories.length > 0 &&
        !filterState.categories.includes(product.category)
      ) {
        return false;
      }
      if (
        filterState.selectedGenders.length > 0 &&
        !filterState.selectedGenders.includes(product.gender)
      ) {
        return false;
      }
      if (
        filterState.selectedRatings.length > 0 &&
        !filterState.selectedRatings.includes(Math.floor(product.rating))
      ) {
        return false;
      }
      if (filterState.selectedDiscounts.length > 0) {
        const discount =
          ((product.originalPrice - product.price) / product.originalPrice) *
          100;
        return filterState.selectedDiscounts.some(
          (d) => discount >= parseInt(d)
        );
      }
      return true;
    });
  };

  const sortProducts = (products) => {
    const sorted = [...products];
    switch (filterState.sortBy) {
      case "asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "popularity":
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  };


  const filteredAndSortedProducts = sortProducts(filterProducts(products));

  const handleProductDetail = (id) => {
    router.push(`/product/${id}`);
  };

  const handleLoadMore = () => {
    router.push('/productListing/explore');
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <ProductsContainer>
      <Typography
        variant={isMobile ? "h6" : "h5"}
        sx={{
          textAlign: "center",
          fontWeight: 600,
          color: "#333",
          marginBottom: isMobile ? 2 : 3,
          fontFamily: "'Poppins', sans-serif",
          fontSize: {
            xs: '1.25rem',
            sm: '1.5rem',
            md: '1.75rem'
          }
        }}
      >
        Latest Products
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px"
          }}
        >
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <>
          <ProductGrid>
            {filteredAndSortedProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                onClick={() => handleProductDetail(product.id)}
              >
                <ImageWrapper>
                  <ProductImage
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 480px) 100vw, 
                           (max-width: 768px) 50vw, 
                           (max-width: 1024px) 33vw, 
                           (max-width: 1280px) 25vw, 
                           16.666vw"
                    style={{
                      objectFit: 'cover',
                    }}
                    className="product-image"
                    priority={true}
                  />
                </ImageWrapper>
                <ProductTitle>
                  {product.title}
                </ProductTitle>
                <ProductPrice>
                  ₹{product.price.toLocaleString('en-IN')}
                </ProductPrice>
              </ProductCard>
            ))}
          </ProductGrid>

          <ButtonWrapper>
            <LoadMoreButton
              onClick={handleLoadMore}
              endIcon={<ArrowForwardIcon />}
              disableElevation
            >
              View All Products
            </LoadMoreButton>
          </ButtonWrapper>
        </>
      )}
    </ProductsContainer>
  );
};

export default Products;
