import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  IconButton,
  Badge,
  Card,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Container,
  Box,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  LocalShipping as LocalShippingIcon,
  DeleteForever,
  DeleteForeverRounded,
} from "@mui/icons-material";
import Header from "../header";
import Footer from "../footer";
import axios from "axios";
import { Delete as DeleteIcon } from "@mui/icons-material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddAddressModal from "@/components/modals/addAddressModal";
import EditIcon from "@mui/icons-material/Edit";
import { styled } from "@mui/material/styles";
import EditAddressModal from "@/components/modals/editAddressModal";
import { Delete } from "lucide-react";
import { Router, useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setCartLength } from "@/redux/features/cartSlice";
import axiosInstance from "@/utils/axiosInstance";
import AddIcon from "@mui/icons-material/Add";
import {
  getDeliveryCharge,
  getUserLocation,
  deliveryCharges,
} from "@/utils/deliveryCharges";
import LocationConsentBanner from "@/utils/locationConcentBanner";

const EditButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.grey[800],
  "&:hover": {
    backgroundColor: theme.palette.grey[200],
  },
  border: `1px solid ${theme.palette.grey[300]}`,
  textTransform: "none",
  padding: "8px 16px",
  "&:focus": {
    boxShadow: `0 0 0 2px ${theme.palette.grey[200]}`,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: "bold",
  padding: "8px 20px",
  borderRadius: "8px",
  transition: "background-color 0.3s, color 0.3s",
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.grey[300],
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
}));

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [quantityError, setQuantityError] = useState("");
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
  const [selectedEditAddress, setSelectedEditAddress] = useState(null);
  const [selectedAddressToDelete, setSelectedAddressToDelete] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const router = useRouter();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [cartError, setCartError] = useState("");
  const [deliveryChargeInfo, setDeliveryChargeInfo] = useState({
    charge: null,
    message: "",
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationConsent, setShowLocationConsent] = useState(false);
  const [locationPreference, setLocationPreference] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("usertoken");

    const fetchAddresses = async () => {
      try {
        const response = await axiosInstance.get("/address/get-address");
        setAddresses(response.data.addresses || []);
      } catch (error) {
        if (error.response?.status === 404) {
          setAddresses([]);
        } else {
          console.error("Error fetching addresses:", error);
        }
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    const checkAndSetLocation = async () => {
      const savedLocationPref = localStorage.getItem("locationPreference");
      const savedLocation = localStorage.getItem("userLocation");

      // If we have saved location, use it
      if (savedLocationPref === "allow" && savedLocation) {
        try {
          const parsedLocation = JSON.parse(savedLocation);
          setUserLocation(parsedLocation);
          if (cart) {
            updateDeliveryCharge(parsedLocation.city, parsedLocation.state);
          }
        } catch (error) {
          console.log("Error parsing saved location:", error);
          // If there's an error with saved location, try to get new location
          await detectUserLocation();
        }
      } else {
        // If no saved location preference, automatically try to get location
        await detectUserLocation();
      }
    };

    checkAndSetLocation();
  }, [cart]); // Dependencies array includes cart

  useEffect(() => {
    if (cart?.items) {
      if (userLocation?.city) {
        updateDeliveryCharge(userLocation.city, userLocation.state);
      } else if (selectedAddress) {
        updateDeliveryCharge(selectedAddress.city, selectedAddress.state);
      } else {
        setDeliveryChargeInfo({
          charge: deliveryCharges.DEFAULT,
          message: `Standard delivery charge: ₹${deliveryCharges.DEFAULT}`,
        });
      }
    }
  }, [cart, userLocation, selectedAddress]);

  const handleLocationConsent = async (consent) => {
    if (consent === "allow") {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        // Process the location data
        const location = await getUserLocation();
        if (location?.city) {
          setUserLocation(location);
          updateDeliveryCharge(location.city, location.state);
          setSnackbarMessage(`Location detected: ${location.city}`);
          setSnackbarSeverity("success");
        }
      } catch (error) {
        // Handle the error gracefully without throwing
        console.log("Location error:", error);
        setSnackbarMessage(
          "Location access denied. You can select your delivery address manually."
        );
        setSnackbarSeverity("info");
      } finally {
        setSnackbarOpen(true);
        setShowLocationConsent(false);
      }
    } else if (consent === "deny") {
      // Handle denial gracefully
      setSnackbarMessage("You can select your delivery address manually.");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
      setShowLocationConsent(false);
    }
  };

  const detectUserLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError("");

    try {
      if (!navigator.geolocation) {
        setSnackbarMessage("Geolocation is not supported by your browser");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });

      const location = await getUserLocation();
      if (location?.city) {
        setUserLocation(location);
        if (cart) {
          updateDeliveryCharge(location.city, location.state);
        }
        setSnackbarMessage(
          `Delivering to ${location.city}${
            location.state ? `, ${location.state}` : ""
          }`
        );
        setSnackbarSeverity("success");
        
        // Save location preference and data
        localStorage.setItem("locationPreference", "allow");
        localStorage.setItem("userLocation", JSON.stringify(location));
      }
    } catch (error) {
      console.log("Location detection error:", error);
      setSnackbarMessage(
        "Location access denied. Please select your delivery address manually."
      );
      setSnackbarSeverity("info");
      localStorage.removeItem("userLocation");
      localStorage.setItem("locationPreference", "deny");
    } finally {
      setIsLoadingLocation(false);
      setSnackbarOpen(true);
    }
  };

  const handleGetLocation = () => {
    detectUserLocation();
  };

  const updateDeliveryCharge = (city, state) => {
    if (!city || !cart) return;

    const location = state ? `${city}, ${state}` : city;

    // Only calculate totals if cart and cart.items exist
    const totals = cart?.items
      ? calculateTotals(cart.items)
      : { finalTotal: 0 };
    const { charge, message } = getDeliveryCharge(location, totals.finalTotal);

    setDeliveryChargeInfo({ charge, message });

    if (charge === null) {
      setLocationError(
        "We couldn't determine delivery charges for your location. Please select a delivery address."
      );
    } else {
      setLocationError("");
    }
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await axiosInstance.get("/cart/get-cart");
        setCart(response.data.cart);
      } catch (error) {
        if (error.response?.status === 404) {
          setCart(null);
        } else {
          setCartError("Error fetching cart data");
          console.error("Error fetching cart data:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  // useEffect(() => {
  //   if (addresses && addresses.length > 0 && !selectedAddress) {
  //     setSelectedAddress(addresses[0]);
  //     updateDeliveryCharge(addresses[0].city);
  //   }
  //   handleGetLocation();
  // }, [addresses]);

  const handleOpenModal = (item) => {
    setItemToDelete(item);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setItemToDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (!itemToDelete) return;

    const token = localStorage.getItem("usertoken");
    const { product, variant, sizeVariant } = itemToDelete;

    try {
      const response = await axiosInstance.delete("/cart/delete-product", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          productId: product._id,
          variantId: variant._id,
          sizeVariantId: sizeVariant._id,
        },
      });

      const cartResponse = await axiosInstance.get("/cart/get-cart");

      dispatch(setCartLength(cartResponse.data.cart.items.length));

      setCart((prevCart) => {
        const updatedItems = prevCart.items.filter(
          (item) =>
            item.product._id !== product._id ||
            item.variant._id !== variant._id ||
            item.sizeVariant._id !== sizeVariant._id
        );

        return {
          ...prevCart,
          items: updatedItems,
          totalPrice: response.data.cart.totalPrice,
          discountAmount: response.data.cart.discountAmount,
        };
      });

      handleCloseModal();
    } catch (error) {
      console.error("Error removing product from cart:", error);
    }
  };

  const handleQuantityChange = async (item, newQuantity) => {
    console.log("StockCounttttttttttttt", item.sizeVariant.stockCount);

    setQuantityError("");

    if (newQuantity > 4 || newQuantity > item.sizeVariant.stockCount) {
      setQuantityError(
        `Maximum quantity allowed is ${item.sizeVariant.stockCount} items per product only ${item.sizeVariant.stockCount} available`
      );
      return;
    }

    if (newQuantity < 1) {
      setQuantityError("Minimum quantity allowed is 1 item");
      return;
    }
    const { product, variant, sizeVariant } = item;

    const updatedItems = cart.items.map((cartItem) =>
      cartItem.product._id === product._id &&
      cartItem.variant._id === variant._id &&
      cartItem.sizeVariant._id === sizeVariant._id
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );

    setCart({
      ...cart,
      items: updatedItems,
    });

    try {
      await axiosInstance.put("/cart/update-quantity", {
        productId: product._id,
        variantId: variant._id,
        sizeVariantId: sizeVariant._id,
        quantity: newQuantity,
      });

      const cartResponse = await axiosInstance.get("/cart/get-cart");

      dispatch(setCartLength(cartResponse.data.cart.items.length));
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const dismissLocationConsent = () => {
    setShowLocationConsent(false);
  };

  // const handleAddressSelect = (address) => {
  //   setSelectedAddress(address);
  // updateDeliveryCharge(address.city);
  // };

  const handleOpenAddAddressModal = () => {
    setIsAddAddressModalOpen(true);
  };

  const handleCloseAddAddressModal = () => {
    setIsAddAddressModalOpen(false);
  };

  const handleAddressAdded = (newAddress) => {
    setAddresses((prevAddresses) => [...prevAddresses, newAddress]);
  };

  const handleEditAddress = (address) => {
    return (e) => {
      e.stopPropagation();
      setSelectedEditAddress(address);
      setIsEditAddressModalOpen(true);
    };
  };

  const handleAddressUpdate = (updatedAddress) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((address) =>
        address._id === updatedAddress._id ? updatedAddress : address
      )
    );
  };

  const handleDeleteAddressClick = (e, addressId) => {
    e.stopPropagation();
    setSelectedAddressToDelete(addressId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedAddressToDelete(null);
  };

  const navigateToHome = () => {
    router.push("/");
  };

  const handleDeleteAddress = async () => {
    try {
      await axiosInstance.delete(
        `/address/delete-address/${selectedAddressToDelete}`
      );

      setAddresses((prevAddresses) =>
        prevAddresses.filter(
          (address) => address._id !== selectedAddressToDelete
        )
      );

      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  // const handleGetLocation = async () => {
  //   setIsLoadingLocation(true);
  //   setLocationError('');

  //   try {
  //     const location = await getUserLocation();
  //     if (location?.city) {
  //       setUserLocation(location);
  //       updateDeliveryCharge(location.city);
  //       setSnackbarMessage(`Location detected: ${location.city}`);
  //       setSnackbarOpen(true);
  //     }
  //   } catch (error) {
  //     setLocationError('Please enable location services or select a delivery address');
  //     console.error('Location error:', error);
  //   } finally {
  //     setIsLoadingLocation(false);
  //   }
  // };

  // const updateDeliveryCharge = (city) => {
  //   if (!city || !cart?.items) return;

  //   const totals = calculateTotals(cart.items);
  //   const { charge, message } = getDeliveryCharge(city, totals.finalTotal);
  //   setDeliveryChargeInfo({ charge, message });
  // };

  // const calculateTotals = (items) => {
  //   if (!items || !Array.isArray(items)) {
  //     return { totalPrice: 0, discountAmount: 0, finalTotal: 0 };
  //   }

  //   const itemTotals = items.reduce(
  //     (acc, item) => {
  //       const discountedTotal = item.sizeVariant.discountPrice * item.quantity;
  //       const regularTotal = item.sizeVariant.price * item.quantity;
  //       const itemDiscount = regularTotal - discountedTotal;

  //       return {
  //         totalPrice: acc.totalPrice + regularTotal,
  //         discountAmount: acc.discountAmount + itemDiscount,
  //         finalTotal: acc.finalTotal + discountedTotal,
  //       };
  //     },
  //     { totalPrice: 0, discountAmount: 0, finalTotal: 0 }
  //   );

  //   return {
  //     ...itemTotals,
  //     deliveryCharge: deliveryChargeInfo.charge || 0,
  //     grandTotal: itemTotals.finalTotal + (deliveryChargeInfo.charge || 0)
  //   };
  // };

  const calculateTotals = (items) => {
    if (!items || !Array.isArray(items)) {
      return { totalPrice: 0, discountAmount: 0, finalTotal: 0 };
    }

    const itemTotals = items.reduce(
      (acc, item) => {
        const discountedTotal = item.sizeVariant.discountPrice * item.quantity;
        const regularTotal = item.sizeVariant.price * item.quantity;
        const itemDiscount = regularTotal - discountedTotal;

        return {
          totalPrice: acc.totalPrice + regularTotal,
          discountAmount: acc.discountAmount + itemDiscount,
          finalTotal: acc.finalTotal + discountedTotal,
        };
      },
      { totalPrice: 0, discountAmount: 0, finalTotal: 0 }
    );

    return {
      ...itemTotals,
      deliveryCharge: deliveryChargeInfo.charge || 0,
      grandTotal: itemTotals.finalTotal + (deliveryChargeInfo.charge || 0),
    };
  };

  // Handle address selection - updated to update delivery charges
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    updateDeliveryCharge(address.city, address.state);

    // If user selects an address manually, prioritize it over detected location
    localStorage.setItem("preferredAddressId", address._id);
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setSnackbarMessage("Please select a delivery address");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    let isOutOfStock = false;
    let outOfStockMessage = "";

    cart.items.forEach((item) => {
      if (item.sizeVariant.stockCount < item.quantity) {
        isOutOfStock = true;
        outOfStockMessage = `Sorry, ${item.product.name} (${item.sizeVariant.size}, ${item.variant.color}) is out of stock. Only ${item.sizeVariant.stockCount} items available.`;
      }
    });

    if (isOutOfStock) {
      setSnackbarMessage(outOfStockMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const totals = calculateTotals(cart.items);
    const shippingCost = totals.finalTotal > 5000 ? 0 : 40;

    const checkoutData = {
      cartId: cart._id,
      cartItems: cart.items,
      totalPrice: totals.finalTotal,
      finalTotal: totals.finalTotal + shippingCost,
      deliveryCharge: deliveryChargeInfo.charge,
      discountAmount: totals.discountAmount,
      selectedAddress: selectedAddress,
    };

    router.push({
      pathname: "/checkout/checkout",
      query: { data: JSON.stringify(checkoutData) },
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, marginTop: "100px" }}>
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* {showLocationConsent && (
            <LocationConsentBanner
              onAccept={() => handleLocationConsent('allow')}
              onDecline={() => handleLocationConsent('deny')}
              onClose={() => setShowLocationConsent(false)}
            />
          )} */}

          {!cart || cart.items.length === 0 ? (
            <>
              <Typography variant="h5" gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Looks like you haven't added anything to your cart yet
              </Typography>
              <Button
                startIcon={<ChevronLeftIcon />}
                sx={{
                  backgroundColor: "#333",
                  color: "#fff",
                  margin: "10px 0px",
                  "&:hover": {
                    backgroundColor: "#555",
                  },
                  textTransform: "none",
                  padding: "6px 20px",
                }}
                onClick={navigateToHome}
              >
                Continue Shopping
              </Button>
            </>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12} md={9}>
                <StyledCard>
                  <CardContent>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>
                            Quantity
                            <Typography
                              variant="caption"
                              display="block"
                              color="textSecondary"
                            >
                              Max 4 items per product
                            </Typography>
                          </TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cart.items.map((item, index) => {
                          console.log(item);

                          return (
                            <StyledTableRow
                              key={index}
                              sx={{
                                position: "relative",
                                opacity: item.product.isDeleted ? 0.6 : 1,
                              }}
                            >
                              <TableCell>
                                <Grid
                                  container
                                  spacing={2}
                                  alignItems="center"
                                  sx={{ position: "relative" }}
                                >
                                  <Grid item sx={{ position: "relative" }}>
                                    <img
                                      src={item.variant.mainImage}
                                      alt={item.product.name}
                                      style={{
                                        width: 60,
                                        height: 60,
                                        objectFit: "contain",
                                        filter: item.product.isDeleted
                                          ? "grayscale(100%)"
                                          : "none", 
                                      }}
                                    />
                                    {item.product.isDeleted && (
                                      <Box
                                        sx={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                          backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "white",
                                            fontWeight: "bold",
                                            backgroundColor:
                                              "rgba(255, 0, 0, 0.8)", // Light red background
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            textTransform: "uppercase",
                                            fontSize: "12px",
                                          }}
                                        >
                                          Unavailable
                                        </Typography>
                                      </Box>
                                    )}
                                  </Grid>
                                  <Grid item>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        height: "20px",
                                        width: "170px",
                                        overflowY: "hidden",
                                      }}
                                    >
                                      {item.product.name}...
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                    >
                                      Size: {item.sizeVariant.size}, Color:{" "}
                                      {item.variant.color}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                      sx={{ fontWeight: "bold" }}
                                    >
                                      {item.product.isDeleted
                                        ? "Can't purchase"
                                        : "Can purchase"}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </TableCell>
                              <TableCell>
                                <FormControl
                                  variant="outlined"
                                  sx={{ width: "100px" }}
                                  size="small"
                                >
                                  <StyledSelect
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleQuantityChange(item, e.target.value)
                                    }
                                    error={item.quantity > 4}
                                    disabled={item.product.isDeleted} // Disable quantity selection for unavailable products
                                  >
                                    {[1, 2, 3, 4].map((num) => (
                                      <MenuItem key={num} value={num}>
                                        {num}
                                      </MenuItem>
                                    ))}
                                  </StyledSelect>
                                </FormControl>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1">{`₹${
                                  item.sizeVariant.discountPrice * item.quantity
                                }`}</Typography>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {`₹${item.sizeVariant.discountPrice} each`}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Button
                                  color="error"
                                  onClick={() => handleOpenModal(item)}
                                >
                                  <IconButton
                                    color="error"
                                    onClick={() => handleOpenModal(item)}
                                    aria-label="delete"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                  Remove
                                </Button>
                              </TableCell>
                            </StyledTableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardActions
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <StyledButton
                      startIcon={<ChevronLeftIcon />}
                      onClick={navigateToHome}
                      sx={{
                        backgroundColor: "#333",
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "#555",
                        },
                      }}
                    >
                      Continue Shopping
                    </StyledButton>

                    <StyledButton
                      endIcon={<ChevronRightIcon />}
                      color="primary"
                      variant="outlined"
                      sx={{
                        color: "#333",
                        borderColor: "#333",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                          borderColor: "#333",
                        },
                      }}
                      onClick={handleCheckout}
                    >
                      Checkout Cart
                    </StyledButton>
                  </CardActions>
                </StyledCard>

                <Box mt={3}>
                  <Paper elevation={1}>
                    <Box p={2}>
                      <Typography
                        variant="body1"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <LocalShippingIcon
                          color="success"
                          sx={{ marginRight: "10px" }}
                        />{" "}
                        Free Delivery within 1-2 weeks on purchases above ₹1000!
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Delivery Information
                  </Typography>

                  {/* <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGetLocation}
                    disabled={isLoadingLocation}
                    startIcon={<LocationOnIcon />}
                    sx={{ mb: 2 }}
                  >
                    {isLoadingLocation ? 'Detecting Location...' : 'Use My Location'}
                  </Button> */}

                  {!userLocation && (
                    <Box sx={{ mb: 2 }}>
                      {isLoadingLocation ? (
                        <Typography variant="body2" color="textSecondary">
                          Detecting your location...
                        </Typography>
                      ) : locationError ? (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          {locationError}
                        </Alert>
                      ) : null}
                    </Box>
                  )}

                  {userLocation && (
                    <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                      <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Detected location: {userLocation.city}
                        {userLocation.state ? `, ${userLocation.state}` : ""}
                      </Typography>
                    </Box>
                  )}

                  {selectedAddress && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Delivering to: {selectedAddress.city}
                      {selectedAddress.state
                        ? `, ${selectedAddress.state}`
                        : ""}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor:
                        deliveryChargeInfo.charge === 0 ? "#e8f5e9" : "#f5f5f5",
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Delivery Charge:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        color:
                          deliveryChargeInfo.charge === 0
                            ? "#2e7d32"
                            : "inherit",
                      }}
                    >
                      {deliveryChargeInfo.charge === null
                        ? "Calculating..."
                        : deliveryChargeInfo.charge === 0
                        ? "FREE"
                        : `₹${deliveryChargeInfo.charge}`}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {deliveryChargeInfo.message}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6">
                      ₹{calculateTotals(cart?.items).grandTotal}
                    </Typography>
                  </Box>
                  {/* </Box> */}

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleCheckout}
                    sx={{
                      bgcolor: "#333",
                      "&:hover": { bgcolor: "#555" },
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}
          {addresses.length > 0 ? (
            <>
              <Typography variant="h6" sx={{ mb: 3, color: "#333" }}>
                Select Delivery Address
              </Typography>
              <Grid container spacing={2}>
                {addresses.map((address) => (
                  <Grid item xs={12} sm={6} md={4} key={address._id}>
                    <Card
                      onClick={() => handleAddressSelect(address)}
                      sx={{
                        cursor: "pointer",
                        height: "100%",
                        position: "relative",
                        transition: "all 0.3s ease",
                        border:
                          selectedAddress && selectedAddress._id === address._id
                            ? "2px solid #FF6F61"
                            : "1px solid #e0e0e0",
                        "&:hover": {
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          borderColor: "#FF6F61",
                        },
                      }}
                    >
                      <CardContent>
                        {selectedAddress &&
                          selectedAddress._id === address._id && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                bgcolor: "#FF6F61",
                                color: "white",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                              }}
                            >
                              Selected
                            </Box>
                          )}

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, color: "#333" }}
                          >
                            {address.fullName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              bgcolor: "#f5f5f5",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              color: "#666",
                            }}
                          >
                            {address.addressType}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{ color: "#666", mb: 1 }}
                        >
                          {address.address}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#666", mb: 1 }}
                        >
                          {address.locality}, {address.city}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#666", mb: 1 }}
                        >
                          {address.state} - {address.pincode}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#666", mb: 2 }}
                        >
                          Mobile: {address.mobileNumber}
                          {address.alternatePhone &&
                            `, Alt: ${address.alternatePhone}`}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 2,
                          }}
                        >
                          <Button
                            startIcon={<EditIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address)(e);
                            }}
                            sx={{
                              color: "#666",
                              "&:hover": { color: "#FF6F61" },
                            }}
                          >
                            Edit
                          </Button>
                          <IconButton
                            onClick={(e) =>
                              handleDeleteAddressClick(e, address._id)
                            }
                            sx={{
                              color: "#666",
                              "&:hover": { color: "#d32f2f" },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                {/* Add New Address Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    onClick={handleOpenAddAddressModal}
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px dashed #e0e0e0",
                      bgcolor: "#fafafa",
                      "&:hover": {
                        borderColor: "#FF6F61",
                        bgcolor: "#fff",
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <AddIcon sx={{ fontSize: 40, color: "#FF6F61", mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ color: "#666" }}>
                        Add New Address
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" sx={{ color: "#666", mb: 2 }}>
                No Addresses Found
              </Typography>
              <Button
                variant="contained"
                onClick={handleOpenAddAddressModal}
                sx={{
                  bgcolor: "#FF6F61",
                  "&:hover": { bgcolor: "#ff5c4d" },
                }}
              >
                Add New Address
              </Button>
            </Box>
          )}
          <Divider />
          <Box my={4}>
            <Typography variant="h6" gutterBottom>
              Payment and Refund Policy
            </Typography>
            <Typography variant="body1" paragraph>
              At TREND TROVE, we strive to provide a smooth and secure shopping
              experience for all our customers. Please read the following
              payment and refund policy carefully before making a purchase on
              our site.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>Payment Policy</strong>
            </Typography>

            <Typography variant="body1" paragraph>
              1. <strong>Accepted Payment Methods:</strong> We accept payments
              via major credit and debit cards, including Visa, MasterCard,
              American Express, and Discover. PayPal, Apple Pay, and Google Pay
              are also available for your convenience. For local customers, we
              may accept COD (Cash on Delivery) as a payment option, depending
              on your location.
            </Typography>

            <Typography variant="body1" paragraph>
              2. <strong>Payment Security:</strong> All transactions are
              processed securely through an encrypted payment gateway. Your
              payment information is never stored on our servers. We utilize SSL
              encryption technology to ensure the confidentiality and security
              of your payment details.
            </Typography>

            <Typography variant="body1" paragraph>
              3. <strong>Order Confirmation:</strong> Once your payment is
              processed, you will receive an order confirmation email with your
              purchase details and order number. If the payment fails for any
              reason, your order will not be processed. Please check with your
              payment provider or try an alternative payment method.
            </Typography>

            <Typography variant="body1" paragraph>
              4. <strong>Currency:</strong> All prices displayed on our website
              are in [Your Currency]. If you are shopping from outside [Your
              Country], please note that currency conversion may apply based on
              your payment provider's exchange rates.
            </Typography>

            <Typography variant="body1" paragraph>
              5. <strong>Fraud Prevention:</strong> To protect both our
              customers and ourselves from fraudulent transactions, we reserve
              the right to request additional information or verification for
              large or suspicious orders. Failure to provide requested details
              may result in order cancellation.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>Refund and Return Policy</strong>
            </Typography>

            <Typography variant="body1" paragraph>
              1. <strong>Returns:</strong> We accept returns on unworn,
              unwashed, and unused items within 30 days from the date of
              purchase. Items must be returned in their original condition,
              including all tags and packaging. Items that are damaged or
              altered cannot be accepted for returns. To initiate a return,
              please contact our customer support team at [Customer Support
              Email] to receive return instructions and authorization. Return
              shipping costs are the responsibility of the customer unless the
              return is due to a mistake on our part (such as a defective
              product or incorrect item).
            </Typography>

            <Typography variant="body1" paragraph>
              2. <strong>Refunds:</strong> Once we receive your returned item(s)
              and verify the condition, your refund will be processed. Refunds
              will be credited back to the original payment method used for the
              purchase. Please allow up to 7-10 business days for your refund to
              be reflected in your account, depending on your payment provider.
              If your order was paid via COD, we will issue a refund to the
              account details you provide during the return process.
            </Typography>

            <Typography variant="body1" paragraph>
              3. <strong>Exchanges:</strong> We currently do not offer direct
              exchanges. However, you may return your item for a refund and
              place a new order for the desired item. Please follow our return
              process and then place a new order for the correct size or style.
            </Typography>

            <Typography variant="body1" paragraph>
              4. <strong>Defective or Incorrect Items:</strong> If you receive a
              defective or incorrect item, please contact our customer support
              team immediately. We will provide you with a prepaid return label
              for the return and issue a full refund or replacement, as per your
              preference.
            </Typography>
          </Box>

          <Box py={3} borderTop={1} borderColor="divider">
            <Footer />
          </Box>

          <Dialog
            open={openDeleteModal}
            onClose={handleCloseDeleteModal}
            sx={{
              backdropFilter: "blur(5px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <Grid
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                textAlign: "center",
              }}
            >
              <DialogTitle sx={{ color: "#ffcc00", fontWeight: "bold" }}>
                Confirm Deletion
              </DialogTitle>
              <DialogContent>
                <Typography variant="body1" sx={{ color: "gray" }}>
                  Are you sure you want to delete this address?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleCloseDeleteModal}
                  sx={{
                    color: "black",
                    border: "1px solid #777",
                    borderRadius: "20px",
                    backgroundColor: "rgba(134, 209, 241, 0.2)",
                    backdropFilter: "blur(3px)",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAddress}
                  sx={{
                    color: "black",
                    border: "1px solid #ff4d4d",
                    borderRadius: "20px",
                    backgroundColor: "rgba(255, 0, 0, 0.2)",
                    backdropFilter: "blur(3px)",
                    textTransform: "none",
                    marginLeft: "10px",
                    "&:hover": {
                      backgroundColor: "rgba(255, 0, 0, 0.3)",
                    },
                  }}
                >
                  Delete
                </Button>
              </DialogActions>
            </Grid>
          </Dialog>

          <Dialog
            open={openModal}
            onClose={handleCloseModal}
            sx={{
              backdropFilter: "blur(5px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <Grid
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                textAlign: "center",
              }}
            >
              <DialogTitle sx={{ color: "#ffcc00", fontWeight: "bold" }}>
                Confirm Deletion
              </DialogTitle>
              <DialogContent>
                <Typography sx={{ color: "gray" }}>
                  Are you sure you want to remove this product from your cart?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleCloseModal}
                  sx={{
                    color: "black",
                    border: "1px solid #777",
                    borderRadius: "20px",
                    backgroundColor: "rgba(134, 209, 241, 0.2)",
                    backdropFilter: "blur(3px)",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteProduct}
                  sx={{
                    color: "black",
                    border: "1px solid #ff4d4d",
                    borderRadius: "20px",
                    backgroundColor: "rgba(255, 0, 0, 0.2)",
                    backdropFilter: "blur(3px)",
                    textTransform: "none",
                    marginLeft: "10px",
                    "&:hover": {
                      backgroundColor: "rgba(255, 0, 0, 0.3)",
                    },
                  }}
                >
                  Delete
                </Button>
              </DialogActions>
            </Grid>
          </Dialog>

          <AddAddressModal
            open={isAddAddressModalOpen}
            onClose={handleCloseAddAddressModal}
            onAddressAdded={handleAddressAdded}
          />

          <EditAddressModal
            open={isEditAddressModalOpen}
            onClose={() => {
              setIsEditAddressModalOpen(false);
              setSelectedEditAddress(null);
            }}
            address={selectedEditAddress}
            onAddressUpdated={handleAddressUpdate}
          />
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbarSeverity}
              variant="filled"
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </>
      )}
    </Container>
  );
}

export default Cart;