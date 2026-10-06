import React, { useEffect, useState, useCallback, memo } from "react";
import { useRouter } from "next/router";
import { useFilter } from "@/context/filterContext";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Pagination,
  CircularProgress,
  Chip,
  TextField,
  IconButton,
  Tooltip,
  Rating,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import styled from "@emotion/styled";
import axios from "axios";
import CategoryCarousel from "../components/categoryCarousal";
import axiosInstance from "@/utils/axiosInstance";
import { Visibility as EyeIcon } from "@mui/icons-material";

const OfferBadge = styled(Chip)`
  position: absolute;
  top: 12px;
  left: -6px;
  background-color: #212121; /* Standard black */
  color: white;
  font-weight: 600;
  font-size: 13px;
  padding: 0 10px;
  height: 24px;
  z-index: 1;
  font-family: "Poppins", sans-serif;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);

  &::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: -6px;
    width: 6px;
    height: 6px;
    background-color: #1a1a1a;
    clip-path: polygon(0 0, 100% 0, 100% 100%);
  }

  &::after {
    content: "";
    position: absolute;
    right: -6px;
    top: 0;
    width: 6px;
    height: 24px;
    background-color: #212121;
    clip-path: polygon(0 0, 100% 50%, 0 100%);
  }

  &:hover {
    background-color: #333333; /* Slightly lighter black on hover */
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
    transition: all 0.2s ease;
  }
`;

const StyledWrapper = styled.div`
  width: 100%; // Full width for the search bar
  margin: 15px 0px;
  .input {
    width: 100%; // Full width for the input
    height: 45px;
    padding-left: 2.5rem;
    border: 1px solid #ccc; // Standard border
    border-radius: 5px;
    background-color: #fff;
    outline: none;
    color: black;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    font-family: "Montserrat", sans-serif;
  }
  .input::placeholder {
    color: #aaa; // Placeholder color
  }
  .input:hover {
    border: 2px solid #ff6f61; // Change border color on hover
  }
  .input:focus {
    border-color: #ff6f61; // Change border color on focus
    box-shadow: 0 0 0 2px rgba(255, 111, 97, 0.5); // Shadow on focus
  }
`;

const StyledEyeIcon = styled(IconButton)`
  position: absolute;
  bottom: -40px; // Start below the image
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 111, 97, 0.9);
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 111, 97, 1);
  }
`;

const ProductCard = memo(
  ({
    product,
    index,
    hoveredProductId,
    handleMouseEnter,
    handleMouseLeave,
    handleProductDetail,
    cardVariants,
  }) => {
    const { filterState, updateFilters } = useFilter();

    const handleColorClick = (e, color) => {
      e.stopPropagation(); // Prevent triggering product detail click
      const newColors = filterState.selectedColors.includes(color)
        ? filterState.selectedColors.filter((c) => c !== color)
        : [...filterState.selectedColors, color];
      updateFilters({ selectedColors: newColors });
    };

    return (
      <Grid item xs={12} sm={6} md={4} lg={3} sx={{ width: "100%" }}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.3s, box-shadow 0.3s",
              borderRadius: "2px",
              overflow: "hidden",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
              },
            }}
            onMouseEnter={() => handleMouseEnter(product.id)}
            onMouseLeave={handleMouseLeave}
          >
            <Box sx={{ position: "relative" }}>
              <CardMedia
                component="img"
                image={
                  hoveredProductId === product.id && product.subImage
                    ? product.subImage
                    : product.image
                }
                alt={product.title}
                sx={{
                  height: 380,
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
                onClick={() => handleProductDetail(product.id)}
              />
              {product.discountPercentage > 0 && (
                <Chip
                  label={`${product.discountPercentage}% OFF`}
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                  }}
                />
              )}
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#2d3436",
                    mb: 1,
                    height: "48px",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {product.title}
                </Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#2d3436",
                      fontSize: "1.1rem",
                    }}
                  >
                    ₹{product.price.toLocaleString()}
                  </Typography>
                  {product.originalPrice > product.price && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#636e72",
                        textDecoration: "line-through",
                        fontSize: "0.9rem",
                      }}
                    >
                      ₹{product.originalPrice.toLocaleString()}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Rating
                    value={product.averageRating}
                    precision={0.5}
                    size="small"
                    readOnly
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({product.reviewCount})
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {product.colorImages.slice(0, 4).map((colorVariant) => (
                    <Box
                      key={colorVariant.color}
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        border: "1px solid #ddd",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.1)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <img
                        src={colorVariant.colorImage}
                        alt={colorVariant.color}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        title={colorVariant.color}
                      />
                    </Box>
                  ))}
                  {product.colorImages.length > 4 && (
                    <Typography
                      variant="caption"
                      sx={{
                        ml: 0.5,
                        color: "#636e72",
                        alignSelf: "center",
                      }}
                    >
                      +{product.colorImages.length - 4}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Box>
        </motion.div>
      </Grid>
    );
  }
);

ProductCard.displayName = "ProductCard";

const ListProducts = memo(
  ({ products, totalPages, currentPage, onPageChange, loading }) => {
    const router = useRouter();
    const { filterState, updateFilters } = useFilter();
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredProductId, setHoveredProductId] = useState(null);

    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await axiosInstance.get("/categories");
          setCategories(response.data.categories.map((cat) => cat.name));
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };
      fetchCategories();
    }, []);

    // Memoize handlers
    const handleCategoryClick = useCallback(
      (category) => {
        updateFilters({ categories: [category] });
      },
      [updateFilters]
    );

    const handleSearchChange = useCallback((event) => {
      setSearchQuery(event.target.value);
    }, []);

    const handleMouseEnter = useCallback((productId) => {
      setHoveredProductId(productId);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setHoveredProductId(null);
    }, []);

    const handleProductDetail = useCallback(
      (id) => {
        router.push(`/product/${id}`);
      },
      [router]
    );

    const handlePageChange = useCallback(
      (event, value) => {
        onPageChange(value);
      },
      [onPageChange]
    );

    const filterProducts = useCallback(
      (products) => {
        if (!products || !Array.isArray(products)) {
          return [];
        }
        return products.filter((product) => {
          if (
            searchQuery &&
            !product.title.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            return false;
          }

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
              ((product.originalPrice - product.price) /
                product.originalPrice) *
              100;
            return filterState.selectedDiscounts.some(
              (d) => discount >= parseInt(d)
            );
          }

          // Color filter
          if (filterState.selectedColors.length > 0) {
            const productColors = product.colorImages.map((c) => c.color);
            if (
              !filterState.selectedColors.some((color) =>
                productColors.includes(color)
              )
            ) {
              return false;
            }
          }

          // Size filter
          if (filterState.selectedSizes.length > 0) {
            if (
              !filterState.selectedSizes.some((size) =>
                product.availableSizes.includes(size)
              )
            ) {
              return false;
            }
          }

          return true;
        });
      },
      [filterState, searchQuery]
    );

    const sortProducts = useCallback(
      (products) => {
        if (!products || !Array.isArray(products)) {
          return [];
        }
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
      },
      [filterState.sortBy]
    );

    const calculateDiscount = (originalPrice, currentPrice) => {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    };

    // Memoize the filtered and sorted products
    const filteredAndSortedProducts = React.useMemo(
      () => sortProducts(filterProducts(products)),
      [products, sortProducts, filterProducts]
    );

    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    };

    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: { xs: "10px", sm: "20px" },
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#333",
            marginBottom: "30px",
            fontFamily: "'Poppins', sans-serif",
            marginTop: "20px",
          }}
        >
          All Products
        </Typography>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress sx={{ color: "#ff6f61" }} />
          </Box>
        ) : (
          <>
            {/* <CategoryCarousel
            categories={categories}
            onCategoryClick={handleCategoryClick}
          /> */}

            <StyledWrapper>
              <input
                id="query"
                className="input"
                type="search"
                placeholder="Search products..."
                name="searchbar"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </StyledWrapper>

            <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
              {filteredAndSortedProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  hoveredProductId={hoveredProductId}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                  handleProductDetail={handleProductDetail}
                  cardVariants={cardVariants}
                />
              ))}
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: "40px",
                marginBottom: "20px",
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#333",
                    "&.Mui-selected": {
                      backgroundColor: "#ff6f61",
                      color: "white",
                    },
                    "&:hover": {
                      backgroundColor: "#ff6f61",
                      color: "white",
                    },
                  },
                }}
              />
            </Box>
          </>
        )}
      </Box>
    );
  }
);

ListProducts.displayName = "ListProducts";

export default ListProducts;
