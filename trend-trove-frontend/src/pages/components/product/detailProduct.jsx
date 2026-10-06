import { FaCartPlus } from "react-icons/fa";
import React from "react";
import {
  Grid,
  Button,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Breadcrumbs,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  Chip,
  IconButton,
  Rating,
  Modal,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import StarIcon from "@mui/icons-material/Star";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import { useDispatch, useSelector } from "react-redux";
import { setCartLength } from "@/redux/features/cartSlice";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import SecurityIcon from "@mui/icons-material/Security";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import axiosInstance from "@/utils/axiosInstance";
import ProductReviews from "../productReviews/review";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { setWishlistLength } from "@/redux/features/wishlistSlice";
import CloseIcon from "@mui/icons-material/Close";
import StraightenIcon from "@mui/icons-material/Straighten";
import InfoIcon from "@mui/icons-material/Info";

const theme = {
  primary: '#2c3e50',
  secondary: '#f8f9fa',
  accent: '#3498db',
  border: '#e0e0e0',
  text: {
    primary: '#2c3e50',
    secondary: '#34495e',
    light: '#7f8c8d'
  }
};

const DetailProduct = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [variants, setVariants] = useState([]);
  const [variantIndex, setVariantIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [openSizeGuide, setOpenSizeGuide] = useState(false);
  const [openColorGuide, setOpenColorGuide] = useState(false);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const scaleIn = {
    initial: { scale: 0.95 },
    animate: { scale: 1 },
    transition: { duration: 0.3 },
  };

  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("usertoken") !== null) {
      setIsLoggedIn(localStorage.getItem("usertoken"));
    }
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await axiosInstance.get(`/products/${id}/details`);
          const productData = response.data.product;
          console.log(productData);

          setVariants(productData.variants);

          const initialVariant = productData.variants[0];
          setVariantIndex(0);
          setMainImage(initialVariant.mainImage);
          setSelectedColor(initialVariant.color);

          const initialSize = initialVariant.sizes[0]?.size || "";
          setSelectedSize(initialSize);

          setProduct({
            id: productData._id,
            image: initialVariant.mainImage,
            title: productData.name,
            description: productData.description,
            price: initialVariant.sizes[0]?.price || 0,
            discountPrice: initialVariant.sizes[0]?.discountPrice || 0,
            category: productData.category.name,
            sizes: initialVariant.sizes,
            colors: initialVariant.color,
            material: productData.material,
            pattern: productData.pattern,
            brand: productData.brand.name,
            inStock: initialVariant.sizes[0]?.inStock
              ? "Available"
              : "Not Available",
            stockCount: initialVariant.sizes[0]?.stockCount,
            subImages: initialVariant.subImages,
            gender: productData.gender,
            isDeleted: productData.isDeleted,
          });

          // Fetch reviews to get average rating
          const reviewsResponse = await axiosInstance.get(
            `/user/review/get/${productData._id}`
          );
          const reviews = reviewsResponse.data.reviews;
          
          // Calculate average rating
          if (reviews.length > 0) {
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            setAverageRating((sum / reviews.length).toFixed(1));
            setReviewCount(reviews.length);
          }

          const relatedResponse = await axiosInstance.get(
            `/products/related/${productData.category._id}/${id}`
          );
          setRelatedProducts(relatedResponse.data.relatedProducts);
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      };

      fetchProduct();
    }
  }, [id]);

  const handleSizeGuideOpen = () => {
    setSizeGuideOpen(true);
  };

  const handleSizeGuideClose = () => {
    setSizeGuideOpen(false);
  };

  const itemsPerView = {
    xs: 1,
    sm: 2,
    md: 3,
  };

  const totalProductCount = relatedProducts.reduce(
    (count, product) => count + product.variants.length,
    0
  );
  const maxVisibleItems = 3;
  const totalSlides = Math.max(
    1,
    Math.ceil(totalProductCount / maxVisibleItems)
  );

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Get current visible products
  const getCurrentProducts = () => {
    let flattenedProducts = [];
    relatedProducts.forEach((product) => {
      product.variants.forEach((variant) => {
        flattenedProducts.push({
          productId: product._id,
          variant: variant,
        });
      });
    });

    const startIndex = currentIndex * maxVisibleItems;
    return flattenedProducts.slice(startIndex, startIndex + maxVisibleItems);
  };

  const handleQuantityChange = (action) => {
    if (action === "increment" && quantity < 4 && quantity < product.stockCount)
      setQuantity(quantity + 1);
    if (action === "decrement" && quantity > 1) setQuantity(quantity - 1);
  };

  const handleColorChange = (index) => {
    setVariantIndex(index);
    setMainImage(variants[index].mainImage);
    setSelectedColor(variants[index].color);
    const initialSize = variants[index].sizes[0]?.size || "";
    setSelectedSize(initialSize);

    setProduct({
      ...product,
      image: variants[index].mainImage,
      colors: variants[index].color,
      sizes: variants[index].sizes,
      price: variants[index].sizes[0]?.price || 0,
      discountPrice: variants[index].sizes[0]?.discountPrice || 0,
      inStock: variants[index].sizes[0]?.inStock
        ? "Available"
        : "Not Available",
      stockCount: variants[index].sizes[0]?.stockCount,
      subImages: variants[index].subImages,
    });
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);

    const selectedSizeDetails = variants[variantIndex].sizes.find(
      (item) => item.size === size
    );

    if (selectedSizeDetails) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        price: selectedSizeDetails.price,
        discountPrice: selectedSizeDetails.discountPrice,
        description: selectedSizeDetails.description || prevProduct.description,
        inStock: selectedSizeDetails.inStock ? "Available" : "Not Available",
        stockCount: selectedSizeDetails.stockCount,
      }));
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      router.push("/authentication/loginSignup");
      return;
    }

    if (!selectedSize || !selectedColor) {
      alert("Please select a size and color before adding to the cart.");
      return;
    }

    if (quantity > 4) {
      alert("Maximum quantity limit is 4.");
      return;
    }

    const productData = {
      productId: product.id,
      variantId: variants[variantIndex]._id,
      sizeVariantId: variants[variantIndex].sizes.find(
        (size) => size.size === selectedSize
      )?._id,
      quantity,
    };

    try {
      const response = await axiosInstance.post(
        "/cart/add-to-cart",
        productData
      );
      if (response.status === 201) {
        setSnackbarMessage("Product added to cart successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        const cartResponse = await axiosInstance.get("/cart/get-cart");

        dispatch(setCartLength(cartResponse.data.cart.items.length));
      }
    } catch (error) {
      console.error("Error adding product to cart", error);
      setSnackbarMessage("Failed to add to cart. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isLoggedIn) {
      router.push("/authentication/loginSignup");
      return;
    }

    if (!selectedSize || !selectedColor) {
      alert("Please select a size and color before adding to the wishlist.");
      return;
    }

    const wishlistData = {
      productId: product.id,
      variantId: variants[variantIndex]._id,
      sizeVariantId: variants[variantIndex].sizes.find(
        (size) => size.size === selectedSize
      )?._id,
    };

    try {
      const response = await axiosInstance.post(
        "/user/wishlist/add",
        wishlistData
      );

      if (response.status === 201) {
        // Get updated wishlist count
        const wishlistResponse = await axiosInstance.get("/user/wishlist/get");
        dispatch(setWishlistLength(wishlistResponse.data.Wishlist.length));

        setSnackbarMessage("Product added to wishlist successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error adding product to wishlist", error);
      setSnackbarMessage("Failed to add to wishlist. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleBuyNow = () => {
    // Implement buy now functionality
    console.log("Buy Now clicked");
  };

  const handleImageHover = (e) => {
    if (!product?.image) return;

    const image = e.currentTarget;
    const { left, top, width, height } = image.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setMousePosition({ x: e.clientX, y: e.clientY });
    setZoomPosition({ x, y });
    setShowZoom(true);
  };

  const handleImageLeave = () => {
    setShowZoom(false);
  };

  const handleProductDetail = (id) => {
    router.push(`/product/${id}`);
  };

  const sliderRef = React.useRef(null);

  // Add styled component for the Coming Soon overlay
  const ComingSoonOverlay = styled(Box)({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  });

  // Size guide data - normally this would come from an API
  const sizeGuideData = {
    gender: product?.gender || "Unisex",
    categories: [
      {
        name: "Small (S)",
        chest: "36-38",
        waist: "30-32",
        hips: "36-38"
      },
      {
        name: "Medium (M)",
        chest: "38-40",
        waist: "32-34",
        hips: "38-40"
      },
      {
        name: "Large (L)",
        chest: "40-42",
        waist: "34-36",
        hips: "40-42"
      },
      {
        name: "Extra Large (XL)",
        chest: "42-44",
        waist: "36-38",
        hips: "42-44"
      },
      {
        name: "XXL",
        chest: "44-46",
        waist: "38-40",
        hips: "44-46"
      }
    ]
  };

  // Size Guide Dialog Component
  const SizeGuideDialog = () => (
    <Dialog
      open={openSizeGuide}
      onClose={() => setOpenSizeGuide(false)}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          minWidth: { xs: '95%', sm: '600px' }
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.border}`,
        bgcolor: theme.secondary,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StraightenIcon sx={{ color: theme.primary }} />
          <Typography variant="h6" sx={{ color: theme.text.primary }}>
            Size Guide
          </Typography>
        </Box>
        <IconButton 
          onClick={() => setOpenSizeGuide(false)}
          sx={{ color: theme.text.primary }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: theme.text.primary,
                  bgcolor: theme.secondary
                }}>
                  Size
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: theme.text.primary,
                  bgcolor: theme.secondary
                }}>
                  Chest (inches)
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: theme.text.primary,
                  bgcolor: theme.secondary
                }}>
                  Length (inches)
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: theme.text.primary,
                  bgcolor: theme.secondary
                }}>
                  Shoulder (inches)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { size: 'S', chest: '36-38', length: '27', shoulder: '17' },
                { size: 'M', chest: '38-40', length: '28', shoulder: '18' },
                { size: 'L', chest: '40-42', length: '29', shoulder: '19' },
                { size: 'XL', chest: '42-44', length: '30', shoulder: '20' }
              ].map((row) => (
                <TableRow 
                  key={row.size}
                  sx={{
                    '&:hover': { bgcolor: theme.secondary }
                  }}
                >
                  <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>
                    {row.size}
                  </TableCell>
                  <TableCell sx={{ color: theme.text.secondary }}>{row.chest}</TableCell>
                  <TableCell sx={{ color: theme.text.secondary }}>{row.length}</TableCell>
                  <TableCell sx={{ color: theme.text.secondary }}>{row.shoulder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 3, p: 2, bgcolor: theme.secondary, borderRadius: '8px' }}>
          <Typography variant="subtitle2" sx={{ color: theme.text.primary, mb: 1 }}>
            How to Measure
          </Typography>
          <Typography variant="body2" sx={{ color: theme.text.secondary }}>
            • Chest: Measure around the fullest part of your chest
            • Length: Measure from shoulder point to desired length
            • Shoulder: Measure across the back from shoulder point to shoulder point
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Grid
        container
        spacing={3}
        sx={{
          width: "90%",
          margin: "2rem auto",
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        }}
      >
        <Grid item xs={12}>
          <motion.div {...fadeIn}>
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{
                padding: "1rem 0",
                "& a": {
                  color: "#666",
                  textDecoration: "none",
                  "&:hover": { color: "#000" },
                },
              }}
            >
              <Link href="/">Home</Link>
              <Typography color="textPrimary">
                {product?.title?.slice(0, 50)}
              </Typography>
            </Breadcrumbs>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6} sx={{ position: "relative" }}>
          <motion.div {...scaleIn}>
            <Box
              className="image-container"
              sx={{
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#f8f9fa",
                height: "700px",
              }}
            >
              <Box
                onMouseMove={handleImageHover}
                onMouseLeave={handleImageLeave}
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  cursor: "crosshair",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "600px",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={mainImage || "/placeholder.jpg"}
                    alt={product?.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      filter: product?.isDeleted ? "grayscale(20%)" : "none",
                    }}
                  />
                  {product?.isDeleted && (
                    <ComingSoonOverlay>
                      <Chip
                        label="COMING SOON"
                        sx={{
                          backgroundColor: "#ff6f61",
                          color: "white",
                          fontSize: "1.2rem",
                          padding: "24px 16px",
                          fontWeight: "bold",
                          "& .MuiChip-label": {
                            padding: "0 16px",
                          },
                        }}
                      />
                    </ComingSoonOverlay>
                  )}
                </Box>

                <Chip
                  label={
                    product?.stockCount > 0
                      ? `In Stock ${product.stockCount} units available`
                      : "Out of Stock"
                  }
                  color={product?.stockCount > 0 ? "success" : "error"}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 2,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    ...(product?.stockCount > 0
                      ? {
                          backgroundColor: "#4CAF50",
                          color: "white",
                        }
                      : {
                          backgroundColor: "#f44336",
                          color: "white",
                        }),
                  }}
                />
              </Box>
            </Box>

            {/* Zoom Window */}
            {showZoom && (
              <Box
                sx={{
                  position: "fixed",
                  top: "50%",
                  left: "60%",
                  transform: "translate(-50%, -50%)",
                  width: "600px",
                  height: "600px",
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                <img
                  src={mainImage}
                  alt="Zoomed Product"
                  style={{
                    position: "absolute",
                    width: "200%",
                    height: "200%",
                    objectFit: "contain",
                    transform: `translate(-${zoomPosition.x}%, -${zoomPosition.y}%)`,
                  }}
                />
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                gap: "10px",
                marginTop: "1rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {product?.subImages?.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setMainImage(image);
                    }}
                    sx={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "4px",
                      overflow: "hidden",
                      border:
                        currentImageIndex === index
                          ? "2px solid #000"
                          : "1px solid #ddd",
                      cursor: "pointer",
                      opacity: currentImageIndex === index ? 1 : 0.6,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        opacity: 1,
                        borderColor: "#000",
                      },
                    }}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </motion.div>
              ))}
            </Box>
            {product?.stockCount === 0 && (
              <Box
                sx={{
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "#fff4f4",
                  borderRadius: "8px",
                  border: "1px solid #ffebee",
                }}
              >
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ fontSize: "1.2em" }}>•</span>
                  This product is currently out of stock. Please check back
                  later.
                </Typography>
              </Box>
            )}
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div {...fadeIn}>
            <Box
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#2c3e50",
                }}
              >
                  {product?.title}
                </Typography>
                
              {/* Product Rating - New Addition */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <Rating 
                  value={Number(averageRating)} 
                  precision={0.5} 
                  readOnly 
                  size="small"
                />
                <Typography variant="body2" sx={{ color: "#757575" }}>
                  {averageRating} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </Typography>
                </Box>

              {/* Coming Soon Banner */}
              {product?.isDeleted && (
                <Box
                  sx={{
                    padding: "1.5rem",
                    backgroundColor: "#fff4f4",
                    borderRadius: "8px",
                    border: "2px solid #ffebee",
                    marginBottom: "2rem",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#ff6f61",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Coming Soon
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    This product is currently unavailable for purchase. We're
                    working on bringing it back soon!
                  </Typography>
              </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "#e74c3c",
                    fontWeight: 600,
                  }}
                >
                  {product?.discountPrice}
                </Typography>
                {product?.price && (
                  <Typography
                    variant="h6"
                    sx={{
                      textDecoration: "line-through",
                      color: "#95a5a6",
                    }}
                  >
                    {product?.price}
                  </Typography>
                )}
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: "#34495e",
                  lineHeight: 1.8,
                  marginBottom: "2rem",
                }}
              >
                {product?.description}
              </Typography>

              <Grid container spacing={2} sx={{ marginBottom: "2rem" }}>
                {[
                  ["Brand", product?.brand],
                  ["Category", product?.category],
                  ["Material", product?.material],
                  ["Pattern", product?.pattern],
                  ["Gender", product?.gender],
                ].map(([label, value]) => (
                  <Grid item xs={6} key={label}>
                    <Box
                      sx={{
                        backgroundColor: "#fff",
                        padding: "1rem",
                        borderRadius: "8px",
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#7f8c8d", marginBottom: "0.5rem" }}
                      >
                        {label}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "#2c3e50", fontWeight: 500 }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Improved Size Selection with Guide */}
              <Box sx={{ mb: 4 }}>
              <Box sx={{
                display: 'flex',
                  justifyContent: 'space-between',
                alignItems: 'center',
                  mb: 2
              }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.text.primary,
                  fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <StraightenIcon sx={{ color: theme.primary }} />
                    Select Size
                </Typography>
                  <Button
                    onClick={() => setOpenSizeGuide(true)}
                    startIcon={<InfoIcon />}
                    sx={{
                      color: theme.primary,
                      '&:hover': { bgcolor: `${theme.primary}10` }
                    }}
                  >
                    Size Guide
                  </Button>
              </Box>

                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1.5 
                }}>
                  {variants[variantIndex]?.sizes.map((size) => (
                    <Button
                      key={size._id}
                      onClick={() => size.inStock && handleSizeChange(size.size)}
                      disabled={!size.inStock}
                      sx={{
                        minWidth: '70px',
                        height: '50px',
                        border: selectedSize === size.size 
                          ? `2px solid ${theme.primary}` 
                          : `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        bgcolor: size.inStock ? 'white' : theme.secondary,
                        color: size.inStock ? theme.text.primary : theme.text.light,
                        transition: 'all 0.2s ease',
                        '&:hover': size.inStock && {
                          border: `2px solid ${theme.primary}`,
                          bgcolor: `${theme.primary}10`
                        },
                        '&.Mui-disabled': {
                          bgcolor: theme.secondary,
                          color: theme.text.light
                        }
                      }}
                    >
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: selectedSize === size.size ? 600 : 400,
                            mb: 0.5
                          }}
                        >
                          {size.size}
                  </Typography>
                        {size.inStock && size.stockCount <= 5 && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#e74c3c',
                              display: 'block',
                              fontSize: '0.7rem'
                            }}
                          >
                            Only {size.stockCount} left
                          </Typography>
                        )}
                      </Box>
                    </Button>
                  ))}
                </Box>
              </Box>

              <Box sx={{ marginBottom: "2rem" }}>
                <Typography
                  variant="subtitle1"
                  sx={{ marginBottom: "1rem", color: "#34495e" }}
                >
                  Colors
                </Typography>
                <Box sx={{ display: "flex", gap: "1rem" }}>
                  {variants.map((variant, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Box
                        onClick={() => handleColorChange(index)}
                        sx={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          border:
                            selectedColor === variant.color
                              ? "2px solid #000"
                              : "1px solid #ddd",
                          cursor: "pointer",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={variant.colorImage}
                          alt={variant.color}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Box>

              {product?.stockCount !== 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "2rem",
                    backgroundColor: "#fff",
                    padding: "1rem",
                    borderRadius: "8px",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: "#34495e" }}>
                    Quantity:
                  </Typography>
                  <Button
                    onClick={() => handleQuantityChange("decrement")}
                    variant="outlined"
                    sx={{
                      minWidth: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "1px solid #bdc3c7",
                    }}
                  >
                    -
                  </Button>
                  <Typography sx={{ width: "40px", textAlign: "center" }}>
                    {quantity}
                  </Typography>
                  <Button
                    onClick={() => handleQuantityChange("increment")}
                    variant="outlined"
                    sx={{
                      minWidth: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "1px solid #bdc3c7",
                    }}
                  >
                    +
                  </Button>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "2rem",
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ flex: 1 }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddToCart}
                    disabled={
                      !isLoggedIn ||
                      product?.isDeleted ||
                      product?.inStock === "Not Available"
                    }
                    sx={{
                      backgroundColor: product?.isDeleted
                        ? "#E0D5C1"
                        : "#2c3e50", // Soft peach tone
                      color: "#fff", // Deep gray text for readability
                      padding: "1rem",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      borderRadius: "8px",
                      border: "1px solid #E8B79E", // Subtle taupe border
                      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: product?.isDeleted
                          ? "#E0D5C1"
                          : "#F7C2AD", // Gentle coral glow
                        transform: "scale(1.05)",
                      },
                      "&:disabled": {
                        backgroundColor: "#E0D5C1",
                        color: "#A6A6A6",
                        boxShadow: "none",
                        cursor: "not-allowed",
                      },
                    }}
                  >
                    <ShoppingCartIcon sx={{ marginRight: "0.5rem" }} />
                    {product?.isDeleted || product?.inStock === "Not Available"
                      ? "Coming Soon"
                      : isLoggedIn
                      ? "Add to Cart"
                      : "Login to Add"}
                  </Button>
                </motion.div>

                {/* <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ flex: 1 }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleButtonClick("Buy Now")}
                    disabled={
                      !isLoggedIn ||
                      product?.isDeleted ||
                      product?.inStock === "Not Available"
                    }
                    sx={{
                      backgroundColor: product?.isDeleted
                        ? "#E0D5C1"
                        : "  #ff9800;", // Soft sand tone
                      color: "white", // Classy deep gray text
                      padding: "1rem",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      borderRadius: "8px",
                      border: "1px solid #C9B79C", // Subtle taupe border
                      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: product?.isDeleted
                          ? "#E0D5C1"
                          : "#E4D5B7", // Gentle cream glow
                        transform: "scale(1.05)",
                      },
                      "&:disabled": {
                        backgroundColor: "#E0D5C1",
                        color: "#A6A6A6",
                        boxShadow: "none",
                        cursor: "not-allowed",
                      },
                    }}
                  >
                    <LocalMallIcon sx={{ marginRight: "0.5rem" }} />
                    {product?.isDeleted || product?.inStock === "Not Available"
                      ? "Coming Soon"
                      : isLoggedIn
                      ? "Buy Now"
                      : "Login to Buy"}
                  </Button>
                </motion.div> */}
              </Box>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full"
              >
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<FavoriteBorderIcon />}
                  onClick={handleAddToWishlist}
                  disabled={!isLoggedIn}
                  sx={{
                    backgroundColor: "#6c757d", 
                    color: "white", 
                    fontSize: "1rem",
                    marginTop: "10px",
                    py: 1.5,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    borderRadius: "8px",
                    border: "1px solid #D3C3A5", // Subtle golden beige border
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#EAD7BB", // Warm beige glow
                      transform: "scale(1.05)",
                    },
                    "&:disabled": {
                      backgroundColor: "#F0EDE5",
                      color: "#A6A6A6",
                      boxShadow: "none",
                      cursor: "not-allowed",
                    },
                  }}
                >
                  Add to Wishlist
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div {...fadeIn}>
            <Typography
              variant="h5"
              sx={{
                marginBottom: "2rem",
                marginTop: "3rem",
              fontWeight: 600,
                color: "#2c3e50",
              }}
            >
              {relatedProducts.length !== 0
                ? "You may like"
                : "No Related Products"}
            </Typography>

            {relatedProducts.length > 0 && (
            <Box sx={{ position: "relative", width: "100%", px: 4 }}>
              <IconButton
                sx={{
                  position: "absolute",
                  left: -40,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,1)",
                  },
                  zIndex: 2,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
                onClick={() => sliderRef.current.slickPrev()}
              >
                <ArrowBackIosNewIcon />
              </IconButton>

                {/* Slider */}
              <Slider ref={sliderRef} {...settings}>
                {relatedProducts.map((product) =>
                  product.variants.map((variant) => (
                    <Box key={variant._id} sx={{ padding: "0 10px" }}>
                      <motion.div
                        whileHover={{ y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            overflow: "hidden",
                            cursor: "pointer",
                          }}
                          onClick={() => handleProductDetail(product._id)}
                        >
                          <CardMedia
                            component="img"
                            image={variant.mainImage}
                            alt={variant.name}
                            sx={{
                              height: 400,
                              padding: "10px 0px",
                              objectFit: "contain",
                              transition: "transform 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                          />
                        </Box>
                      </motion.div>
                    </Box>
                  ))
                )}
              </Slider>

                {/* Right Navigation Button */}
              <IconButton
                sx={{
                  position: "absolute",
                  right: -40,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,1)",
                  },
                  zIndex: 2,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
                onClick={() => sliderRef.current.slickNext()}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
            )}
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          {product && variants[variantIndex] && (
            <ProductReviews
              productId={id}
              selectedVariantId={variants[variantIndex]?._id}
              selectedSizeVariantId={
                variants[variantIndex]?.sizes.find(
                  (size) => size.size === selectedSize
                )?._id
              }
            />
          )}
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <SizeGuideDialog />
    </motion.div>
  );
};

export default DetailProduct;