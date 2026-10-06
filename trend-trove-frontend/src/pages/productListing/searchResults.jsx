import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Pagination,
  Rating,
} from "@mui/material";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import Filter from "../components/filter";
import { useFilter } from "@/context/filterContext";
import { motion } from "framer-motion";
import axiosInstance from "@/utils/axiosInstance";

const SearchResults = () => {
  const router = useRouter();
  const { search, brand, category } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8; // Items per page
  const { filterState, updateFilters } = useFilter();

  useEffect(() => {
    if (search || brand || category || router.query.gender) {
      setLoading(true);
      let endpoint = "";

      // Add filter parameters to the endpoint
      const filterParams = new URLSearchParams({
        colors: filterState.selectedColors.join(","),
        sizes: filterState.selectedSizes.join(","),
        minPrice: filterState.priceRange[0],
        maxPrice: filterState.priceRange[1],
        page,
        limit,
      }).toString();

      if (brand) {
        endpoint = `/products/brand/${brand}?${filterParams}`;
      } else if (category) {
        endpoint = `/products/category/${category}?${filterParams}`;
      } else if (router.query.gender) {
        endpoint = `/products/gender/${router.query.gender}?${filterParams}`;
      } else {
        endpoint = `/products/product/search/related?query=${search}&${filterParams}`;
      }

      axiosInstance
        .get(endpoint)
        .then((response) => {
          let productsToTransform = [];
          let total = 0;

          if (category) {
            productsToTransform = response.data.products || [];
            total = response.data.totalProducts || 0;
            setTotalPages(Math.ceil(total / limit));
          } else if (brand) {
            productsToTransform = response.data.products || [];
          } else {
            productsToTransform = response.data.productsWithRelated || [];
          }

          const transformedProducts = productsToTransform.map((item) => {
            const product = category || brand ? item : item.product || item;
            const availableColors = [];
            const availableSizes = [];

            // Extract all colors and sizes
            product.variants.forEach((variant) => {
              availableColors.push({
                color: variant.color,
                colorImage: variant.colorImage,
              });
              variant.sizes.forEach((size) => {
                availableSizes.push(size.size);
              });
            });

            return {
              id: product._id,
              image: product.variants[0]?.mainImage,
              title: product.name,
              description: product.description,
              rating: product.ratings || 0,
              price: product.variants[0]?.sizes[0]?.price || 0,
              originalPrice: product.variants[0]?.sizes[0]?.price || 0,
              variantsCount: product.variants.length,
              category: product.category?.name,
              gender: product.gender,
              colorImages: availableColors,
              availableSizes: [...new Set(availableSizes)],
              discountPercentage: product.discountPercentage || 0,
              reviewCount: product.reviewCount || 0,
            };
          });

          setProducts(transformedProducts);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
          setLoading(false);
        });
    }
  }, [search, brand, category, router.query.gender, page, filterState]);

  const filterProducts = (products) => {
    return products.filter((product) => {
      // Price filter
      const price = product.price;
      if (
        price < filterState.priceRange[0] ||
        price > filterState.priceRange[1]
      ) {
        return false;
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

      // Other existing filters...
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleProductDetail = (id) => {
    router.push(`/product/${id}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleColorClick = (e, color) => {
    e.stopPropagation();
    const newColors = filterState.selectedColors.includes(color)
      ? filterState.selectedColors.filter((c) => c !== color)
      : [...filterState.selectedColors, color];
    updateFilters({ selectedColors: newColors });
  };

  const filteredProducts = sortProducts(filterProducts(products));

  return (
    <>
      <Header />
      <Box
        sx={{
          width: "100%",
          margin: "0 auto",
          padding: "20px",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex",
        }}
      >
        <Filter />
        <Box
          sx={{
            flex: 1, 
            maxWidth: "1200px", 
            margin: "0 auto",
            padding: "20px",
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
            Search Results
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
              <Grid container spacing={1}>
                {filteredProducts.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
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
                      >
                        <Box sx={{ position: "relative" }}>
                          <CardMedia
                            component="img"
                            image={product.image}
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
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
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
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 2,
                              }}
                            >
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              gap: "4px",
                              flexWrap: "wrap",
                            }}
                          >
                            {product.colorImages
                              .slice(0, 4)
                              .map((colorVariant) => (
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
                                  onClick={(e) =>
                                    handleColorClick(e, colorVariant.color)
                                  }
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
                        </CardContent>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
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
                    page={page}
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
              )}
            </>
          )}
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default SearchResults;
