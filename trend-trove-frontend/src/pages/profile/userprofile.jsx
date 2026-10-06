import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  Grid,
  Paper,
  CircularProgress,
  TableContainer,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  LocationOn as LocationOnIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockReset,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import Image from "next/image";
import ProfileModal from "@/components/modals/profileModal";
import ResetPasswordModal from "@/components/modals/resetPasswordModal";
import axiosInstance from "@/utils/axiosInstance";
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a theme instance with enhanced styling
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF9800',
      light: '#4a90e2',
      dark: '#1e5bb0',
      contrastText: '#fff'
    },
    secondary: {
      main: '#ff9f00',
      light: '#ffb333',
      dark: '#cc7f00',
      contrastText: '#fff'
    },
    background: {
      default: '#f1f3f6',
      paper: '#ffffff'
    },
    text: {
      primary: '#212121',
      secondary: '#878787'
    },
    divider: 'rgba(0, 0, 0, 0.12)'
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(255, 152, 0, 0.25)'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        },
        head: {
          fontWeight: 700,
          backgroundColor: 'rgba(255, 152, 0, 0.08)'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600
    },
    subtitle1: {
      fontWeight: 500
    }
  }
});

const UserProfilePage = () => {
  const [selectedSection, setSelectedSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [walletData, setWalletData] = useState({
    balance: 0,
    transactions: [],
    totalAmount: 0,
    returnedOrders: [],
    cancelledOrders: [],
    referralEarnings: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("usertoken");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const [
          userResponse,
          addressesResponse,
          ordersResponse,
          cartResponse,
          walletResponse,
        ] = await Promise.allSettled([
          axiosInstance.get("/users/profile"),
          axiosInstance.get("/address/get-address"),
          axiosInstance.get("/checkout/get-orders"),
          axiosInstance.get("/cart/get-cart"),
          axiosInstance.get("/wallet/details"),
        ]);

        if (userResponse.status === "fulfilled" && userResponse.value.data) {
        
          setUser(userResponse.value.data.user);
          console.log("user",userResponse.value.data.user);
        }
        

        if (
          addressesResponse.status === "fulfilled" &&
          addressesResponse.value?.data
        ) {
          setAddresses(addressesResponse.value.data.addresses || []);
        }

        if (
          ordersResponse.status === "fulfilled" &&
          ordersResponse.value?.data
        ) {
          setOrders(ordersResponse.value.data.orders || []);

          // Process orders for wallet data
          const orders = ordersResponse.value.data.orders || [];
          const returnedOrders = orders.filter(
            (order) =>
              order.items.some((item) => item.status === "Returned") ||
              order.orderStatus === "returned"
          );

          const cancelledOrders = orders.filter(
            (order) =>
              order.items.some((item) => item.status === "Cancelled") ||
              order.orderStatus === "Cancelled"
          );

          const totalOrderAmount = [
            ...returnedOrders,
            ...cancelledOrders,
          ].reduce((sum, order) => sum + (order.payment?.amount || 0), 0);
          setWalletData((prev) => ({
            ...prev,
            returnedOrders,
            cancelledOrders,
            totalAmount: totalOrderAmount,
          }));
        }

        if (cartResponse.status === "fulfilled" && cartResponse.value?.data) {
          setCart(cartResponse.value.data.cart || { items: [] });
        }

        // Handle wallet data
        if (
          walletResponse.status === "fulfilled" &&
          walletResponse.value?.data
        ) {
          const { balance, transactions } = walletResponse.value.data;
          const referralEarnings = transactions
            .filter((t) => t.description.toLowerCase().includes("referral"))
            .reduce((sum, t) => sum + t.amount, 0);

          setWalletData((prev) => ({
            ...prev,
            balance,
            transactions: transactions || [],
            referralEarnings,
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);
  console.log("orderssss", orders);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleEditProfile = () => {
    setIsProfileModalOpen(true);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setSnackbarMessage("Profile updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await axiosInstance.delete(`/address/delete-address/${addressId}`);
      setAddresses((prevAddresses) =>
        prevAddresses.filter((address) => address._id !== addressId)
      );
      setSnackbarMessage("Address deleted successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting address:", error);
      setSnackbarMessage("Error deleting address");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handlePasswordReset = (message) => {
    setSnackbarMessage(message);
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      );
    }

    switch (selectedSection) {
      case "profile":
        return (
          <Card
            sx={{
              bgcolor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderRadius: 0,
              p: 3,
              marginTop: "20px",
              boxShadow: '0 1px 1px 0 rgba(0,0,0,.16)'
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  borderBottom: '1px solid #f0f0f0',
                  pb: 2
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#212121' }}>
                  Personal Information
                </Typography>
                <Box>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setIsProfileModalOpen(true)}
                    sx={{ 
                      color: '#FF9800',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.04)'
                      }
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<LockReset />}
                    onClick={() => setIsResetPasswordModalOpen(true)}
                    sx={{ 
                      color: '#FF9800',
                      textTransform: 'none',
                      ml: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.04)'
                      }
                    }}
                  >
                    Change Password
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: '#fff' }}>
                    <Grid container spacing={3}>
                      {user && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                First Name
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#212121', fontWeight: 500 }}>
                                {user.firstname || "Not set"}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Last Name
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#212121', fontWeight: 500 }}>
                                {user.lastname || "Not set"}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Email Address
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#212121', fontWeight: 500 }}>
                                {user.email}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                User name
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#212121', fontWeight: 500 }}>
                                {user.username || "Not set"}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ mt: 3, p: 3, bgcolor: '#fff', borderRadius: 1, border: '1px solid #f0f0f0' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#212121', fontWeight: 500 }}>
                                  Referral Program
                                </Typography>
                                <Button
                                  startIcon={<ShareIcon />}
                                  sx={{ 
                                    color: '#FF9800',
                                    textTransform: 'none',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 152, 0, 0.04)'
                                    }
                                  }}
                                  onClick={() => {
                                    if (user.referralCode) {
                                      navigator.share({
                                        title: 'Join me on Trend Trove',
                                        text: `Use my referral code ${user.referralCode} to get started!`,
                                        url: window.location.origin
                                      }).catch(() => {
                                        navigator.clipboard.writeText(`Join me on Trend Trove! Use my referral code: ${user.referralCode}`);
                                        setSnackbarMessage('Referral link copied to clipboard!');
                                        setSnackbarSeverity('success');
                                        setSnackbarOpen(true);
                                      });
                                    }
                                  }}
                                >
                                  Share
                                </Button>
                              </Box>
                              <Box sx={{ p: 2, bgcolor: 'rgba(40, 116, 240, 0.04)', borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ color: '#212121', mb: 1 }}>
                                  Your Referral Code
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="h6" sx={{ 
                                    fontFamily: 'monospace', 
                                    letterSpacing: 1,
                                    color: '#FF9800',
                                    fontWeight: 600
                                  }}>
                                    {user.referralCode || 'No referral code available'}
                                  </Typography>
                                  {user.referralCode && (
                                    <IconButton
                                      onClick={() => {
                                        navigator.clipboard.writeText(user.referralCode);
                                        setSnackbarMessage('Referral code copied!');
                                        setSnackbarSeverity('success');
                                        setSnackbarOpen(true);
                                      }}
                                      sx={{ 
                                        color: '#FF9800',
                                        '&:hover': {
                                          backgroundColor: 'rgba(40, 116, 240, 0.08)'
                                        }
                                      }}
                                    >
                                      <ContentCopyIcon />
                                    </IconButton>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ color: '#878787' }}>
                                    Total Referrals
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: '#212121' }}>
                                    {walletData.transactions.filter(t => t.description.toLowerCase().includes('referral')).length}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ color: '#878787' }}>
                                    Earnings
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: '#212121' }}>
                                    ₹{walletData.referralEarnings}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case "addresses":
        return (
          <Box
            sx={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: 3,
              p: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#1a1a1a" }}
              >
                My Addresses
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {addresses.length === 0 ? (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      backgroundColor: "#f8f9fa",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6">
                      No addresses found. Add your first address.
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                addresses.map((address) => (
                  <Grid item xs={12} key={address._id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        transition: "0.3s",
                        "&:hover": {
                          borderColor: "#1a1a1a",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                          pb: 2,
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "#1a1a1a" }}
                          >
                            {address.fullName}
                          </Typography>
                          <Chip
                            label={address.addressType}
                            size="small"
                            sx={{
                              mt: 1,
                              backgroundColor: "#1a1a1a",
                              color: "white",
                            }}
                          />
                        </Box>
                        <Box>
                          <IconButton
                            onClick={() => handleEditAddress(address)}
                            sx={{
                              color: "#1a1a1a",
                              mr: 1,
                              "&:hover": { backgroundColor: "#f5f5f5" },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteAddress(address._id)}
                            sx={{
                              color: "#d32f2f",
                              "&:hover": {
                                backgroundColor: "#fff5f5",
                                color: "#b71c1c",
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Mobile Number
                          </Typography>
                          <Typography variant="body1">
                            {address.mobileNumber}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            PIN Code
                          </Typography>
                          <Typography variant="body1">
                            {address.pincode}
                          </Typography>
                        </Grid>

                        {/* Full Address */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Address
                          </Typography>
                          <Box
                            sx={{
                              backgroundColor: "#f8f9fa",
                              p: 2,
                              mt: 1,
                              borderRadius: 1,
                              border: "1px solid #eee",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ lineHeight: 1.6 }}
                            >
                              {address.address}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* City and State */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            City
                          </Typography>
                          <Typography variant="body1">
                            {address.city}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            State
                          </Typography>
                          <Typography variant="body1">
                            {address.state}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        );

      case "orders":
        return (
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#222" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Order ID
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Payment
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="h6">
                        No orders found. Start shopping to see your orders here.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow
                      key={order.orderId}
                      sx={{
                        "&:hover": { backgroundColor: "#f5f5f5" },
                        transition: "0.3s",
                      }}
                    >
                      <TableCell sx={{ color: "#222", fontWeight: 500 }}>
                        {order.orderId}
                      </TableCell>
                      <TableCell sx={{ color: "#444" }}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ color: "#000", fontWeight: 500 }}>
                        {order.payment.method}
                      </TableCell>
                      <TableCell sx={{ color: "#000", fontWeight: 600 }}>
                        ₹{order.totalAmount}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.orderStatus}
                          color={getStatusColor(order.orderStatus)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case "cart":
        return (
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}
          >
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow sx={{ backgroundColor: "#222" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Product
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Price
                  </TableCell>
                </TableRow>
              </TableHead>

              {/* Table Body */}
              <TableBody>
                {cart?.items?.length > 0 ? (
                  cart.items.map((item) => (
                    <TableRow
                      key={item.product._id}
                      sx={{
                        "&:hover": { backgroundColor: "#f5f5f5" },
                        transition: "0.3s",
                      }}
                    >
                      <TableCell sx={{ color: "#222", fontWeight: 500 }}>
                        {item.product.name}
                      </TableCell>
                      <TableCell sx={{ color: "#444" }}>
                        {item.quantity}
                      </TableCell>
                      <TableCell sx={{ color: "#000", fontWeight: 600 }}>
                        ₹{item.price * item.quantity}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{ color: "#888", py: 3 }}
                    >
                      No items in cart
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case "wallet":
        return (
          <Box sx={{ mt: 3 }}>
            <Card sx={{ mb: 3, p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Wallet Balance</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h4">₹{walletData.balance}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Referral Earnings</Typography>
                  <Typography variant="h6" color="primary.main">₹{walletData.referralEarnings}</Typography>
                </Box>
              </Box>
            </Card>

            <Card sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Transaction History</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {walletData.transactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            color={transaction.type === 'credit' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                            fontWeight="medium"
                          >
                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        );

        const allTransactions = [
          // Regular wallet transactions
          ...walletData.transactions.map((transaction) => ({
            date: transaction.date,
            description: transaction.description,
            type: transaction.type,
            amount: transaction.amount,
          })),

          // Returned orders
          ...(walletData.returnedOrders || [])
            .map((order) =>
              order.items
                .filter(
                  (item) =>
                    item.status === "Returned" ||
                    (item.returnRequested &&
                      item.returnStatus === "Return Approved")
                )
                .map((item) => ({
                  date: order.orderDate,
                  description: `Refund for returned item: ${item.productName}`,
                  type: "credit",
                  amount: item.finalPrice * item.quantity,
                  status: "Returned",
                }))
            )
            .flat(),
          // Cancelled orders with online payment
          ...(walletData.cancelledOrders || [])
            .map((order) =>
              order.items
                .filter((item) => item.status === "Cancelled")
                .map((item) => ({
                  date: order.orderDate,
                  description: `Refund for cancelled order: ${item.productName}`,
                  type: "credit",
                  amount: item.price * item.quantity,
                  status: "Cancelled",
                }))
            )
            .flat(),
        ];
        console.log(allTransactions);
        // Calculate total wallet balance by summing all amounts in the transactions
        const totalWalletBalance = allTransactions.reduce(
          (sum, transaction) =>
            transaction.type === "credit"
              ? sum + transaction.amount
              : sum - transaction.amount,
          0
        );

        // Update wallet data with the calculated total balance
        const updatedWalletData = {
          ...walletData,
          totalWalletBalance,
        };
        return (
          <Card sx={{ bgcolor: "#1a1a1a", color: "white", borderRadius: 2 }}>
            <CardContent>
              {/* Wallet Balance */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  p: 3,
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: "#fff" }}>
                    Wallet Balance
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ color: "#4CAF50" }}
                  >
                    ₹{updatedWalletData.totalWalletBalance || 0}
                  </Typography>
                </Box>
                <AccountBalanceWalletIcon
                  sx={{ fontSize: 40, color: "#4CAF50" }}
                />
              </Box>

              {/* Pending Refunds Alert */}
              {updatedWalletData.pendingRefunds > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "rgba(255, 152, 0, 0.15)",
                    borderRadius: 1,
                    border: "1px solid rgba(255, 152, 0, 0.3)",
                  }}
                >
                  <Typography variant="body1" sx={{ color: "#FFA726" }}>
                    Pending Refunds: ₹{updatedWalletData.pendingRefunds}
                  </Typography>
                </Box>
              )}

              {/* Transaction History */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ color: "#90CAF9" }}>
                  Transaction History
                </Typography>
                <TableContainer
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 2,
                    "& .MuiTableCell-root": {
                      color: "#fff",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#90CAF9" }}
                        >
                          Date
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#90CAF9" }}
                        >
                          Description
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#90CAF9" }}
                        >
                          Type
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#90CAF9" }}
                          align="right"
                        >
                          Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Combine all transactions including refunds and returns */}
                      {[
                        // Regular wallet transactions
                        ...updatedWalletData.transactions.map(
                          (transaction) => ({
                            date: transaction.date,
                            description: transaction.description,
                            type: transaction.type,
                            amount: transaction.amount,
                          })
                        ),
                        // Returned orders
                        ...(updatedWalletData.returnedOrders || [])
                          .map((order) =>
                            order.items
                              .filter(
                                (item) =>
                                  item.status === "Returned" ||
                                  (item.returnRequested &&
                                    item.returnStatus === "Return Approved")
                              )
                              .map((item) => ({
                                date: order.orderDate,
                                description: `Refund for returned item: ${item.productName}`,
                                type: "credit",
                                amount: item.price * item.quantity,
                                status: "Returned",
                              }))
                          )
                          .flat(),
                        // Cancelled orders with online payment
                        ...(updatedWalletData.cancelledOrders || [])
                          .map((order) =>
                            order.items
                              .filter((item) => item.status === "Cancelled")
                              .map((item) => ({
                                date: order.orderDate,
                                description: `Refund for cancelled order: ${item.productName}`,
                                type: "credit",
                                amount: item.price * item.quantity,
                                status: "Cancelled",
                              }))
                          )
                          .flat(),
                      ]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((transaction, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.05)",
                              },
                            }}
                          >
                            <TableCell sx={{ color: "#E0E0E0" }}>
                              {new Date(transaction.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell sx={{ color: "#E0E0E0" }}>
                              {transaction.description}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.type}
                                color={
                                  transaction.type === "credit"
                                    ? "success"
                                    : "error"
                                }
                                size="small"
                                sx={{
                                  color: "#fff",
                                  fontWeight: "bold",
                                }}
                              />
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                color:
                                  transaction.type === "credit"
                                    ? "#4CAF50"
                                    : "#F44336",
                                fontWeight: "bold",
                              }}
                            >
                              {console.log(transaction)}₹{transaction.amount}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* No Transactions Message */}
              {!updatedWalletData.transactions?.length &&
                !updatedWalletData.returnedOrders?.length &&
                !updatedWalletData.cancelledOrders?.length && (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "#90CAF9",
                    }}
                  >
                    <Typography variant="body1">
                      No transactions found
                    </Typography>
                  </Box>
                )}
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="xl"
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
          p: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Header />
        <Box
          display="flex"
          mt={4}
          gap={3}
          flexDirection={{ xs: "column", md: "row" }}
        >
          {/* Sidebar */}
          <Paper
            elevation={0}
            sx={{
              width: { xs: "100%", md: 280 },
              backgroundColor: "#1a1a1a",
              borderRadius: 2,
              p: 2,
              marginTop:"50px"
            }}
          >
            <List>
              <ListItem
                button
                onClick={() => setSelectedSection("profile")}
                sx={{
                  cursor: "pointer",
                  color: "#ffffff",
                  bgcolor: selectedSection === "profile" ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: selectedSection === "profile" ? 'primary.main' : 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" sx={{ color: "#ffffff" }} />
              </ListItem>
              <ListItem
                button
                onClick={() => setSelectedSection("addresses")}
                sx={{
                  cursor: "pointer",
                  bgcolor: selectedSection === "addresses" ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: selectedSection === "addresses" ? 'primary.main' : 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText primary="Addresses" sx={{ color: "#ffffff" }} />
              </ListItem>
              <ListItem
                button
                onClick={() => setSelectedSection("orders")}
                sx={{
                  cursor: "pointer",
                  bgcolor: selectedSection === "orders" ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: selectedSection === "orders" ? 'primary.main' : 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary="Orders" sx={{ color: "#ffffff" }} />
              </ListItem>
              <ListItem
                button
                onClick={() => setSelectedSection("cart")}
                sx={{
                  cursor: "pointer",
                  bgcolor: selectedSection === "cart" ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: selectedSection === "cart" ? 'primary.main' : 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <ShoppingCartIcon />
                </ListItemIcon>
                <ListItemText primary="Cart" sx={{ color: "#ffffff" }} />
              </ListItem>
              <ListItem
                button
                onClick={() => setSelectedSection("wallet")}
                sx={{
                  cursor: "pointer",
                  bgcolor: selectedSection === "wallet" ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: selectedSection === "wallet" ? 'primary.main' : 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <AccountBalanceWalletIcon />
                </ListItemIcon>
                <ListItemText primary="Wallet" sx={{ color: "#ffffff" }} />
              </ListItem>
            </List>
          </Paper>

          {/* Main Content */}
          <Box flexGrow={1}>
            {loading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="50vh"
              >
                <CircularProgress />
              </Box>
            ) : (
              renderContent()
            )}
          </Box>
        </Box>
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{
            backgroundColor: "black",
            color: "white",
          }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <ResetPasswordModal
          open={isResetPasswordModalOpen}
          handleClose={() => setIsResetPasswordModalOpen(false)}
          onPasswordReset={handlePasswordReset}
        />
        <ProfileModal
          open={isProfileModalOpen}
          handleClose={() => setIsProfileModalOpen(false)}
          user={user || {}}
          profileImage={user?.image}
          onProfileUpdate={handleProfileUpdate}
          theme={{ dark: true }} 
        />
        <Footer />
      </Container>
    </ThemeProvider>
  );
};

export default UserProfilePage;
