import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Box,
  Divider,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  LocationOn,
  LocalShipping,
  Payment,
  CreditCard,
  MonetizationOn,
  AccountBalanceWallet,
} from "@mui/icons-material";
import Header from "../components/header";
import Footer from "../components/footer";
import DeliveryLoader from "@/loaders/deliveryLoader";
import axiosInstance from "@/utils/axiosInstance";

const CheckoutPage = () => {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [previewDiscount, setPreviewDiscount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  useEffect(() => {
    if (router.query.data) {
      const data = JSON.parse(router.query.data);
      setCheckoutData(data);
    }
  }, [router.query.data]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axiosInstance.get(`/coupon/get`, {
          params: {
            totalPrice: checkoutData?.totalPrice || 0,
          },
        });

        setCoupons(response.data.coupons);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    };

    if (checkoutData) {
      fetchCoupons();
    }
  }, [checkoutData]);

  const calculatePreviewDiscount = (couponCode, totalPrice) => {
    const selectedCouponDetails = coupons.find(
      (coupon) => coupon.couponCode === couponCode
    );

    if (!selectedCouponDetails) return 0;

    let discount = 0;
    if (selectedCouponDetails.discountType === "percentage") {
      discount = (totalPrice * selectedCouponDetails.discountValue) / 100;
    } else {
      discount = selectedCouponDetails.discountValue;
    }

    return discount;
  };

  const handleCouponChange = async (event) => {
    const couponCode = event.target.value;
    setSelectedCoupon(couponCode);
  
    if (couponCode) {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("User ID not found");
        }
        
        const response = await axiosInstance.post(`/coupon/apply`, {
          couponCode,
          totalPrice: checkoutData.totalPrice,
          userId: userId, // Make sure this is the correct user ID
        });
  
        setPreviewDiscount(response.data.discountAmount);
        setSnackbarMessage(
          `Coupon applied! You'll save ₹${response.data.discountAmount} at checkout`
        );
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error applying coupon:", error);
        setSnackbarMessage(error.response?.data?.message || "Failed to apply coupon");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setSelectedCoupon("");
        setPreviewDiscount(0);
      }
    } else {
      setPreviewDiscount(0);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const clearCart = async () => {
    try {
      const response = await axiosInstance.delete(`/cart/clear-cart`);

      console.log("Cart cleared successfully:", response.data);
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await axiosInstance.get("/wallet/details");
      console.log("Wallet balance", response);

      return response.data.balance + response.data.referralEarnings;
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      setSnackbarMessage("Failed to fetch wallet balance");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return 0;
    }
  };

  const handleOnlinePayment = async () => {
    try {
      setLoading(true);

      // First create checkout and get its ID
      const checkoutPayload = {
        cartId: checkoutData.cartId,
        addressId: selectedAddress._id,
        shippingMethod: "Standard",
        paymentMethod: "online",
        transactionId: "pending",
        paymentStatus: "pending",
        finalTotal: previewTotal,
        couponCode: selectedCoupon,
        discountAmount: previewDiscount,
        items: cartItems.map((item) => ({
          ...item,
          finalPrice: item.sizeVariant.discountPrice * item.quantity,
        })),
      };

      // Create checkout first
      const checkoutResponse = await axiosInstance.post(
        "/checkout/create-checkout",
        checkoutPayload
      );

      if (!checkoutResponse.data.order?._id) {
        throw new Error("Failed to create checkout");
      }

      const checkoutId = checkoutResponse.data.order._id;

      // Load Razorpay script
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      // Create payment order with checkoutId
      const response = await axiosInstance.post(`/payment/create-order`, {
        amount: Math.round(previewTotal * 100),
        currency: "INR",
        checkoutId: checkoutId, // Pass the checkoutId here
      });

      const orderData = response.data;

      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SlhJwHElHKOoQI",
        amount: orderData.amount || Math.round(previewTotal * 100),
        currency: orderData.currency || "INR",
        name: "TREND TROVE",
        description: "Purchase Payment",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axiosInstance.post(`/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              checkoutId: checkoutId, // Pass the checkoutId here
            });

            if (verifyResponse.data.status === "success") {
              await clearCart();
              setSnackbarMessage(
                "Payment successful! Redirecting to orders..."
              );
              setSnackbarOpen(true);
              router.push("/orders/orders");
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            setSnackbarMessage("Payment verification failed");
            setSnackbarOpen(true);
          }
        },
        modal: {
          ondismiss: async function () {
            try {
              await axiosInstance.post(`/payment/cancel`, {
                orderId: orderData.id,
                checkoutId: checkoutId,
                status: "retry_pending",
              });
              setSnackbarMessage(
                "Payment pending. You can retry payment from your orders page."
              );
              setSnackbarOpen(true);
              router.push("/orders/orders");
            } catch (error) {
              console.error("Failed to handle payment cancellation:", error);
            }
            setLoading(false);
          },
        },
        prefill: {
          name: selectedAddress?.fullName || "",
          contact: selectedAddress?.mobileNumber || "",
        },
        theme: {
          color: "#333",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Checkout error:", error.response?.data || error.message);

      if (error.response?.data?.blockedProducts) {
        const blockedItems = error.response.data.blockedProducts.join(", ");
        setSnackbarMessage(
          `Cannot complete purchase. These items are currently unavailable: ${blockedItems}. Please remove them from your cart.`
        );
      } else {
        setSnackbarMessage(
          error.response?.data?.message ||
            "Failed to place order. Please try again."
        );
      }
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      if (error.response?.data?.blockedProducts) {
        setTimeout(() => {
          router.push("/cart/cartpage");
        }, 4000);
      }
    } finally {
      setLoading(false);
      setShowLoader(false);
    }
  };

  const handleCashOnDelivery = async () => {
    try {
      setLoading(true);
      const checkoutPayload = {
        cartId: checkoutData.cartId,
        addressId: selectedAddress._id,
        shippingMethod: "Standard",
        paymentMethod: "cod",
        transactionId: "COD_" + Date.now(),
        paymentStatus: "pending",
        couponCode: selectedCoupon,
        finalTotal: previewTotal,
        items: cartItems.map((item) => ({
          ...item,
          finalPrice: item.sizeVariant.discountPrice * item.quantity,
        })),
      };

      const token = localStorage.getItem("usertoken");
      try {
        const response = await axiosInstance.post(
          "/checkout/create-checkout",
          checkoutPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await clearCart();

        setSnackbarMessage("Order placed successfully!");
        setSnackbarOpen(true);
        router.push("/orders/orders");
      } catch (error) {
        console.error("Checkout failed:", error);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      setSnackbarMessage("Failed to place order: " + error.message);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = async () => {
    try {
      if (!selectedAddress) {
        setSnackbarMessage("Please select a delivery address");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      setLoading(true);
      setShowLoader(true);

      const checkoutPayload = {
        cartId: checkoutData.cartId,
        addressId: selectedAddress._id,
        shippingMethod: "Standard",
        paymentMethod: paymentMethod,
        transactionId:
          paymentMethod === "cod" || "debit" ? "COD_" + Date.now() : null,
        paymentStatus: "pending",
        couponCode: selectedCoupon,
        finalTotal: previewTotal,
        discountAmount: previewDiscount,
      };

      if (paymentMethod === "online") {
        handleOnlinePayment();
        return;
      }

      if (paymentMethod === "wallet") {
        const walletBalance = await fetchWalletBalance();
        if (walletBalance < previewTotal) {
          setSnackbarMessage("Insufficient wallet balance");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setLoading(false);
          setShowLoader(false);
          return;
        }

        // Deduct amount from wallet
        const deductResponse = await axiosInstance.post("/wallet/transaction", {
          amount: previewTotal,
          type: "debit",
          description: "Payment for order",
        });

        if (!deductResponse.data.success) {
          throw new Error("Failed to deduct amount from wallet");
        }
      }

      const response = await axiosInstance.post(
        "/checkout/create-checkout",
        checkoutPayload
      );

      if (response.data.success) {
        await clearCart();
        setSnackbarMessage("Order placed successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setTimeout(() => {
          router.push("/orders/orders");
        }, 2000);
      }
    } catch (error) {
      console.error("Checkout error:", error.response?.data || error.message);

      if (error.response?.data?.blockedProducts) {
        const blockedItems = error.response.data.blockedProducts.join(", ");
        setSnackbarMessage(
          `Cannot complete purchase. These items are currently unavailable: ${blockedItems}. Please remove them from your cart.`
        );
      } else {
        setSnackbarMessage(
          error.response?.data?.message ||
            "Failed to place order. Please try again."
        );
      }

      setSnackbarSeverity("error");
      setSnackbarOpen(true);

      if (error.response?.data?.blockedProducts) {
        setTimeout(() => {
          router.push("/cart/cartpage");
        }, 4000);
      }
    } finally {
      setLoading(false);
      setShowLoader(false);
    }
  };

  const handlePlaceOrder = async (checkoutPayload) => {
    if (!checkoutData) return;

    setShowLoader(true);
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const token = localStorage.getItem("usertoken");
    const { cartItems, selectedAddress } = checkoutData;

    if (!checkoutData.cartId) {
      console.error("cartId is missing in checkoutData");
      setLoading(false);
      return;
    }

    let finalTotal = checkoutData.totalPrice;
    if (selectedCoupon) {
      try {
        const couponResponse = await fetch(
          // `${process.env.NEXT_PUBLIC_API_URL}/coupon/apply`,
          `${process.env.NEXT_PUBLIC_API_URL}/coupon/apply`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              couponCode: selectedCoupon,
              totalPrice: checkoutData.totalPrice,
              userId: localStorage.getItem("userId"),
            }),
          }
        );

        if (!couponResponse.ok) {
          throw new Error("Failed to apply coupon");
        }

        const couponData = await couponResponse.json();
        finalTotal = couponData.finalTotal;
      } catch (error) {
        console.error("Error applying coupon:", error);
        setSnackbarMessage("Failed to apply coupon at checkout");
        setSnackbarOpen(true);
        setShowLoader(false);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(
        // `${process.env.NEXT_PUBLIC_API_URL}/checkout/create-checkout`,
        `${process.env.NEXT_PUBLIC_API_URL}/checkout/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(checkoutPayload),
        }
      );
      const data = await response.json();

      if (response.ok) {
        try {
          await clearCart();
          router.push("/orders/orders");
        } catch (clearCartError) {
          setError(
            "Order placed but failed to clear cart. Please refresh the page."
          );
        }
      } else {
        setError(data.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    } finally {
      setShowLoader(false);
      setLoading(false);
    }
  };

  if (!checkoutData) {
    return <Typography>Loading...</Typography>;
  }

  const { cartItems, totalPrice, selectedAddress, deliveryCharge } =
    checkoutData;
  // const deliveryCharge = totalPrice < 1000 ? 40 : 0;
  const previewTotal = totalPrice - previewDiscount + deliveryCharge;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Header />
      <Typography variant="h4" gutterBottom sx={{ color: "#333", mb: 4 }}>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Left Section - Address */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{ p: 2, height: "100%", bgcolor: "#fafafa" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: "#333" }} />
              <Typography variant="h6">Delivery Address</Typography>
            </Box>
            <Card variant="outlined" sx={{ bgcolor: "white" }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {selectedAddress.fullName}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Type: {selectedAddress.addressType}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  {selectedAddress.address}
                </Typography>
                <Typography variant="body2">
                  {selectedAddress.city}, {selectedAddress.state}
                </Typography>
                <Typography variant="body2">
                  PIN: {selectedAddress.pincode}
                </Typography>
                <Typography variant="body2">
                  Phone: {selectedAddress.mobileNumber}
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* Middle Section - Order Summary */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            sx={{ p: 2, height: "100%", bgcolor: "#fafafa" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <LocalShipping sx={{ mr: 1, color: "#333" }} />
              <Typography variant="h6">Order Summary</Typography>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <img
                        src={item.variant.mainImage}
                        alt={item.product.name}
                        style={{ width: 50, height: 100, objectFit: "cover" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Size: {item.sizeVariant.size}, Color:{" "}
                        {item.variant.color}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Qty: {item.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      ₹{item.sizeVariant.discountPrice * item.quantity}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1">Subtotal</Typography>
                  </TableCell>
                  <TableCell align="right">₹{totalPrice}</TableCell>
                </TableRow>
                {previewDiscount > 0 && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="subtitle1" color="success.main">
                        Coupon Discount (will be applied at checkout)
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "success.main" }}>
                      -₹{previewDiscount}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1">Delivery</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {deliveryCharge === 0
                      ? "Free delivery"
                      : `₹${deliveryCharge}`}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      ₹{previewTotal}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Right Section - Payment */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={3}
            sx={{ p: 2, height: "100%", bgcolor: "#fafafa" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Payment sx={{ mr: 1, color: "#333" }} />
              <Typography variant="h6">Payment Method</Typography>
            </Box>

            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {previewTotal < 1000 && (
                <FormControlLabel
                  value="cod"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <MonetizationOn sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle1">
                          Cash on Delivery
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Pay when you receive
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ mb: 2 }}
                />
              )}

              <FormControlLabel
                value="online"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CreditCard sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle1">Pay Online</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Credit/Debit Card, UPI, Net Banking
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                value="wallet"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccountBalanceWallet sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle1">
                        Pay with Wallet
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Use your digital wallet balance
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ mb: 2 }}
              />
            </RadioGroup>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="coupon-select-label">Select Coupon</InputLabel>
              <Select
                labelId="coupon-select-label"
                id="coupon-select"
                value={selectedCoupon}
                label="Select Coupon"
                onChange={handleCouponChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {coupons.map((coupon) => (
                  <MenuItem key={coupon._id} value={coupon.couponCode}>
                    {coupon.couponCode} - {coupon.discountValue}
                    {coupon.discountType === "percentage" ? "%" : "₹"} off
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: "#333",
                "&:hover": {
                  bgcolor: "#555",
                },
                py: 1.5,
              }}
              onClick={handlePaymentClick}
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay ₹${previewTotal}`}
            </Button>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 2, textAlign: "center" }}
            >
              By placing your order, you agree to our terms and conditions
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            "& .MuiAlert-message": {
              fontSize: "1rem",
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <DeliveryLoader open={showLoader} />
      <Footer />
    </Container>
  );
};

export default CheckoutPage;
