import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  LocationOn as LocationOnIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Logout as LogoutIcon,
  VerifiedUser as VerifiedUserIcon,
  CalendarToday as CalendarTodayIcon,
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";
import Header from "../components/header";
import Footer from "../components/footer";
import ProfileModal from "@/components/modals/profileModal";
import ResetPasswordModal from "@/components/modals/resetPasswordModal";
import AddAddressModal from "@/components/modals/addAddressModal";
import EditAddressModal from "@/components/modals/editAddressModal";
import axiosInstance from "@/utils/axiosInstance";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Minimalist, Classy Luxury Black & White Theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#111827",
      light: "#374151",
      dark: "#000000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#4b5563",
      light: "#6b7280",
      dark: "#1f2937",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#111827",
      secondary: "#6b7280",
    },
    divider: "#e5e7eb",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 500 },
    body1: { fontSize: "0.95rem" },
    body2: { fontSize: "0.875rem" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#f9fafb",
          color: "#374151",
          fontWeight: 700,
          borderBottom: "1px solid #e5e7eb",
        },
        root: {
          borderBottom: "1px solid #f3f4f6",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 600,
        },
      },
    },
  },
});

const UserProfilePage = () => {
  const router = useRouter();
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

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
  const [selectedAddressToEdit, setSelectedAddressToEdit] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedAddressToDelete, setSelectedAddressToDelete] = useState(null);

  const [walletData, setWalletData] = useState({
    balance: 0,
    transactions: [],
    totalAmount: 0,
    returnedOrders: [],
    cancelledOrders: [],
    referralEarnings: 0,
  });

  const fetchUserData = async () => {
    const token = localStorage.getItem("usertoken");
    if (!token) {
      setError("Please log in to view your profile");
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
      }

      if (addressesResponse.status === "fulfilled" && addressesResponse.value?.data) {
        setAddresses(addressesResponse.value.data.addresses || []);
      }

      if (ordersResponse.status === "fulfilled" && ordersResponse.value?.data) {
        const fetchedOrders = ordersResponse.value.data.orders || [];
        setOrders(fetchedOrders);

        const returnedOrders = fetchedOrders.filter(
          (order) =>
            order.items?.some((item) => item.status === "Returned") ||
            order.orderStatus === "returned"
        );

        const cancelledOrders = fetchedOrders.filter(
          (order) =>
            order.items?.some((item) => item.status === "Cancelled") ||
            order.orderStatus === "Cancelled"
        );

        const totalOrderAmount = [...returnedOrders, ...cancelledOrders].reduce(
          (sum, order) => sum + (order.payment?.amount || 0),
          0
        );

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

      if (walletResponse.status === "fulfilled" && walletResponse.value?.data) {
        const { balance, transactions, referralEarnings } = walletResponse.value.data;
        setWalletData((prev) => ({
          ...prev,
          balance: Number(balance || 0),
          transactions: transactions || [],
          referralEarnings: Number(referralEarnings || 0),
        }));
      }
    } catch (err) {
      console.error("Error fetching user profile data:", err);
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setSnackbarMessage("Profile details updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handlePasswordReset = (message) => {
    setSnackbarMessage(message || "Password updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleAddressAdded = (newAddress) => {
    setAddresses((prev) => [...prev, newAddress]);
    setSnackbarMessage("New delivery address added successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleEditAddress = (address) => {
    setSelectedAddressToEdit(address);
    setIsEditAddressModalOpen(true);
  };

  const handleAddressUpdated = (updatedAddress) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr._id === updatedAddress._id ? updatedAddress : addr))
    );
    setSnackbarMessage("Address updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleDeleteAddressClick = (addressId) => {
    setSelectedAddressToDelete(addressId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedAddressToDelete(null);
  };

  const confirmDeleteAddress = async () => {
    if (!selectedAddressToDelete) return;
    try {
      await axiosInstance.delete(`/address/delete-address/${selectedAddressToDelete}`);
      setAddresses((prev) => prev.filter((address) => address._id !== selectedAddressToDelete));
      setSnackbarMessage("Address removed successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error deleting address:", err);
      setSnackbarMessage("Failed to delete address. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usertoken");
    localStorage.removeItem("userId");
    router.push("/");
  };

  const getOrderStatusChip = (status) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "delivered":
        return <Chip label="Delivered" size="small" sx={{ bgcolor: "#ecfdf5", color: "#065f46" }} />;
      case "cancelled":
        return <Chip label="Cancelled" size="small" sx={{ bgcolor: "#fef2f2", color: "#991b1b" }} />;
      case "processing":
        return <Chip label="Processing" size="small" sx={{ bgcolor: "#eff6ff", color: "#1e40af" }} />;
      case "shiped":
      case "shipped":
        return <Chip label="Shipped" size="small" sx={{ bgcolor: "#f0fdf4", color: "#166534" }} />;
      case "returned":
        return <Chip label="Returned" size="small" sx={{ bgcolor: "#f5f3ff", color: "#5b21b6" }} />;
      default:
        return <Chip label="Pending" size="small" sx={{ bgcolor: "#fffbeb", color: "#92400e" }} />;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress sx={{ color: "#111827" }} />
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Alert severity="error">{error}</Alert>
        </Box>
      );
    }

    switch (selectedSection) {
      case "profile":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Personal Information Card */}
            <Card sx={{ p: 1 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pb: 2.5,
                    borderBottom: "1px solid #f3f4f6",
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ color: "#111827", fontWeight: 700 }}>
                      Personal Information
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
                      Manage your personal profile details and contact information.
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setIsProfileModalOpen(true)}
                      sx={{
                        color: "#111827",
                        borderColor: "#d1d5db",
                        "&:hover": { borderColor: "#111827", bgcolor: "#f9fafb" },
                      }}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LockResetIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setIsResetPasswordModalOpen(true)}
                      sx={{
                        color: "#111827",
                        borderColor: "#d1d5db",
                        "&:hover": { borderColor: "#111827", bgcolor: "#f9fafb" },
                      }}
                    >
                      Change Password
                    </Button>
                  </Box>
                </Box>

                {/* Details Grid */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: "#f9fafb", borderRadius: 1.5, border: "1px solid #f3f4f6" }}>
                      <Typography variant="caption" sx={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        First Name
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#111827", fontWeight: 600, mt: 0.5 }}>
                        {user?.firstname || "—"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: "#f9fafb", borderRadius: 1.5, border: "1px solid #f3f4f6" }}>
                      <Typography variant="caption" sx={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Last Name
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#111827", fontWeight: 600, mt: 0.5 }}>
                        {user?.lastname || "—"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: "#f9fafb", borderRadius: 1.5, border: "1px solid #f3f4f6" }}>
                      <Typography variant="caption" sx={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Username
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#111827", fontWeight: 600, mt: 0.5 }}>
                        @{user?.username || "—"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: "#f9fafb", borderRadius: 1.5, border: "1px solid #f3f4f6" }}>
                      <Typography variant="caption" sx={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#111827", fontWeight: 600, mt: 0.5 }}>
                        {user?.email || "—"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: "#f9fafb", borderRadius: 1.5, border: "1px solid #f3f4f6" }}>
                      <Typography variant="caption" sx={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Member Since
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#111827", fontWeight: 600, mt: 0.5 }}>
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Trend Trove Member"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: "#f9fafb", borderRadius: 1.5, border: "1px solid #f3f4f6" }}>
                      <Typography variant="caption" sx={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Referred By
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#111827", fontWeight: 600, mt: 0.5 }}>
                        {user?.referredBy?.username ? `@${user.referredBy.username}` : "Direct Member"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Referral Rewards Card */}
            <Card sx={{ p: 1 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pb: 2,
                    borderBottom: "1px solid #f3f4f6",
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ color: "#111827", fontWeight: 700 }}>
                      Refer & Earn Program
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
                      Invite friends to Trend Trove and receive wallet balance rewards on their first purchase.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ShareIcon sx={{ fontSize: 16 }} />}
                    onClick={() => {
                      if (user?.referralCode) {
                        if (navigator.share) {
                          navigator
                            .share({
                              title: "Join me on Trend Trove",
                              text: `Use my referral code ${user.referralCode} to get started!`,
                              url: window.location.origin,
                            })
                            .catch(() => {});
                        } else {
                          navigator.clipboard.writeText(
                            `Join me on Trend Trove! Use my referral code: ${user.referralCode} at ${window.location.origin}`
                          );
                          setSnackbarMessage("Referral link copied to clipboard!");
                          setSnackbarSeverity("success");
                          setSnackbarOpen(true);
                        }
                      }
                    }}
                    sx={{
                      bgcolor: "#111827",
                      "&:hover": { bgcolor: "#1f2937" },
                      fontWeight: 600,
                    }}
                  >
                    Share Code
                  </Button>
                </Box>

                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        p: 2.5,
                        border: "1px dashed #d1d5db",
                        borderRadius: 2,
                        bgcolor: "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: "#6b7280", textTransform: "uppercase" }}>
                          Your Unique Referral Code
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            letterSpacing: 2,
                            color: "#111827",
                            mt: 0.5,
                          }}
                        >
                          {user?.referralCode || "TRENDUSER"}
                        </Typography>
                      </Box>
                      <Tooltip title="Copy code to clipboard">
                        <IconButton
                          onClick={() => {
                            if (user?.referralCode) {
                              navigator.clipboard.writeText(user.referralCode);
                              setSnackbarMessage("Referral code copied to clipboard!");
                              setSnackbarSeverity("success");
                              setSnackbarOpen(true);
                            }
                          }}
                          sx={{
                            bgcolor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            "&:hover": { bgcolor: "#f3f4f6" },
                          }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 18, color: "#111827" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", gap: 3 }}>
                      <Box
                        sx={{
                          flex: 1,
                          p: 2,
                          bgcolor: "#f9fafb",
                          borderRadius: 2,
                          border: "1px solid #f3f4f6",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          Successful Referrals
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mt: 0.5 }}>
                          {walletData.transactions.filter((t) =>
                            t.description?.toLowerCase().includes("referral")
                          ).length}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          p: 2,
                          bgcolor: "#f9fafb",
                          borderRadius: 2,
                          border: "1px solid #f3f4f6",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          Total Earned
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#16a34a", mt: 0.5 }}>
                          ₹{Number(walletData.referralEarnings || user?.referralEarnings || 0).toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case "addresses":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ color: "#111827", fontWeight: 700 }}>
                  Saved Delivery Addresses ({addresses.length})
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
                  Manage and update delivery locations for faster checkout.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddAddressModalOpen(true)}
                sx={{
                  bgcolor: "#111827",
                  "&:hover": { bgcolor: "#1f2937" },
                  fontWeight: 600,
                }}
              >
                Add New Address
              </Button>
            </Box>

            {addresses.length === 0 ? (
              <Card sx={{ p: 6, textAlign: "center", bgcolor: "#fafafa" }}>
                <LocationOnIcon sx={{ fontSize: 48, color: "#9ca3af", mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
                  No saved addresses yet
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5, mb: 3 }}>
                  Add your home or workplace address for seamless delivery.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setIsAddAddressModalOpen(true)}
                  sx={{ color: "#111827", borderColor: "#111827" }}
                >
                  Add Your First Address
                </Button>
              </Card>
            ) : (
              <Grid container spacing={2.5}>
                {addresses.map((address) => (
                  <Grid item xs={12} md={6} key={address._id}>
                    <Card
                      sx={{
                        p: 2.5,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "100%",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          borderColor: "#111827",
                        },
                      }}
                    >
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#111827" }}>
                              {address.fullName}
                            </Typography>
                            <Chip
                              label={address.addressType || "Home"}
                              size="small"
                              sx={{
                                bgcolor: "#f3f4f6",
                                color: "#374151",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                              }}
                            />
                          </Box>

                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <Tooltip title="Edit Address">
                              <IconButton size="small" onClick={() => handleEditAddress(address)}>
                                <EditIcon sx={{ fontSize: 18, color: "#4b5563" }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Address">
                              <IconButton size="small" onClick={() => handleDeleteAddressClick(address._id)}>
                                <DeleteIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        <Typography variant="body2" sx={{ color: "#4b5563", lineHeight: 1.6, mb: 1.5 }}>
                          {address.address}
                          {address.locality ? `, ${address.locality}` : ""}
                          <br />
                          {address.city}, {address.state} - <strong>{address.pincode}</strong>
                          {address.landmark ? <><br /><span style={{ color: "#6b7280" }}>Landmark: {address.landmark}</span></> : null}
                        </Typography>
                      </Box>

                      <Box sx={{ pt: 1.5, borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          Phone: <strong>{address.mobileNumber}</strong>
                        </Typography>
                        {address.alternatePhone && (
                          <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                            &bull; Alt: {address.alternatePhone}
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                ))}

                {/* Add New Address Card (Matching Cart Page Style) */}
                <Grid item xs={12} md={6}>
                  <Card
                    onClick={() => setIsAddAddressModalOpen(true)}
                    sx={{
                      height: "100%",
                      minHeight: 180,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px dashed #d1d5db",
                      bgcolor: "#fafafa",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#111827",
                        bgcolor: "#ffffff",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1.5,
                      }}
                    >
                      <AddIcon sx={{ fontSize: 26, color: "#111827" }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ color: "#111827", fontWeight: 700 }}>
                      Add New Address
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6b7280", mt: 0.5 }}>
                      Click to add a new delivery location
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        );

      case "orders":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ color: "#111827", fontWeight: 700 }}>
                  Order History ({orders.length})
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
                  View, track, and manage your past and recent purchases.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/orders/orders")}
                sx={{
                  color: "#111827",
                  borderColor: "#d1d5db",
                  "&:hover": { borderColor: "#111827", bgcolor: "#f9fafb" },
                }}
              >
                Go to Detailed Orders Page
              </Button>
            </Box>

            {orders.length === 0 ? (
              <Card sx={{ p: 6, textAlign: "center", bgcolor: "#fafafa" }}>
                <ReceiptIcon sx={{ fontSize: 48, color: "#9ca3af", mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
                  No orders placed yet
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5, mb: 3 }}>
                  Discover our latest collections and find styles you love.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push("/productListing/listing")}
                  sx={{ bgcolor: "#111827", "&:hover": { bgcolor: "#1f2937" } }}
                >
                  Start Shopping
                </Button>
              </Card>
            ) : (
              <Card>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell>Payment Method</TableCell>
                        <TableCell>Total Amount</TableCell>
                        <TableCell>Order Status</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order.orderId}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => router.push("/orders/orders")}
                        >
                          <TableCell sx={{ fontWeight: 600, color: "#111827" }}>
                            #{String(order.orderId).slice(-8).toUpperCase()}
                          </TableCell>
                          <TableCell sx={{ color: "#4b5563" }}>
                            {new Date(order.orderDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell sx={{ color: "#4b5563" }}>
                            {order.items?.length || 1} item(s)
                          </TableCell>
                          <TableCell sx={{ textTransform: "capitalize", color: "#4b5563" }}>
                            {order.payment?.method === "wallet"
                              ? "Wallet"
                              : order.payment?.method === "cod"
                              ? "COD"
                              : "Online"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                            ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>{getOrderStatusChip(order.orderStatus)}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="text"
                              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                              sx={{ color: "#111827", fontWeight: 600 }}
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </Box>
        );

      case "cart":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ color: "#111827", fontWeight: 700 }}>
                  Active Cart Items ({cart?.items?.length || 0})
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
                  Review products ready for purchase in your current shopping bag.
                </Typography>
              </Box>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/cart/cartpage")}
                sx={{ bgcolor: "#111827", "&:hover": { bgcolor: "#1f2937" } }}
              >
                Go to Checkout Cart
              </Button>
            </Box>

            {(!cart?.items || cart.items.length === 0) ? (
              <Card sx={{ p: 6, textAlign: "center", bgcolor: "#fafafa" }}>
                <ShoppingCartIcon sx={{ fontSize: 48, color: "#9ca3af", mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
                  Your cart is currently empty
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5, mb: 3 }}>
                  Add products to your cart to see them listed here.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/productListing/listing")}
                  sx={{ color: "#111827", borderColor: "#111827" }}
                >
                  Explore Products
                </Button>
              </Card>
            ) : (
              <Card>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product Name</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell>Unit Price</TableCell>
                        <TableCell align="right">Item Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.items.map((item, idx) => (
                        <TableRow key={item.product?._id || idx}>
                          <TableCell sx={{ fontWeight: 600, color: "#111827" }}>
                            {item.product?.name || "Product"}
                          </TableCell>
                          <TableCell align="center" sx={{ color: "#4b5563", fontWeight: 600 }}>
                            {item.quantity}
                          </TableCell>
                          <TableCell sx={{ color: "#4b5563" }}>
                            ₹{Number(item.price || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: "#111827" }}>
                            ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </Box>
        );

      case "wallet": {
        const txns = walletData.transactions || [];
        const totalCredits = txns.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
        const totalDebits = txns.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Minimalist Luxury Balance Card */}
            <Card sx={{ bgcolor: "#111827", color: "#ffffff", p: 1, borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
                      Available Digital Wallet Balance
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#ffffff", my: 1, letterSpacing: "-0.03em" }}>
                      ₹{(walletData.balance || 0).toLocaleString("en-IN")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                      Usable directly at checkout as instant payment.
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "rgba(255,255,255,0.06)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "#ffffff" }} />
                  </Box>
                </Box>

                {/* Wallet Metrics Divider */}
                <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", my: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                      Total Refund Credits
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#4ade80", mt: 0.5 }}>
                      +₹{totalCredits.toLocaleString("en-IN")}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                      Total Debited (Purchases)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#f87171", mt: 0.5 }}>
                      -₹{totalDebits.toLocaleString("en-IN")}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                      Referral Earnings
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#facc15", mt: 0.5 }}>
                      ₹{Number(walletData.referralEarnings || 0).toLocaleString("en-IN")}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                      Total Transactions
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#ffffff", mt: 0.5 }}>
                      {txns.length}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* How Wallet Works - Classy Information Box */}
            <Card sx={{ bgcolor: "#fafafa" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 20, color: "#111827" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827" }}>
                    Wallet Rules & Automated Refunds
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#4b5563", lineHeight: 1.7 }}>
                  &bull; <strong>Order Cancellations:</strong> Orders paid via Wallet or Online Payment are refunded immediately to your wallet upon cancellation.<br />
                  &bull; <strong>Product Returns:</strong> Refunds from approved item returns are credited immediately once inspected by our team.<br />
                  &bull; <strong>Purchasing:</strong> Simply select <em>Pay with Wallet</em> at checkout to pay using your available balance.<br />
                  &bull; <strong>Policy:</strong> Wallet balance cannot be withdrawn to bank accounts and can only be used on Trend Trove purchases.
                </Typography>
              </CardContent>
            </Card>

            {/* Transaction History Card */}
            <Card>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: "1px solid #f3f4f6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#111827" }}>
                  Wallet Transaction History
                </Typography>
                <Chip
                  label={`${txns.length} entries`}
                  size="small"
                  sx={{ bgcolor: "#f3f4f6", color: "#374151", fontWeight: 600 }}
                />
              </Box>

              {txns.length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "#d1d5db", mb: 1 }} />
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    No wallet transactions recorded yet.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* issue */}
                      {txns.map((txn, idx) => {
                        const isCredit = txn.type === "credit";
                        const date = new Date(txn.date);

                        return (
                          <TableRow key={idx} hover>
                            <TableCell sx={{ color: "#374151" }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {date.toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                                {date.toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ color: "#111827", fontWeight: 500 }}>
                              {txn.description}
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={isCredit ? "Credit" : "Debit"}
                                size="small"
                                sx={{
                                  bgcolor: isCredit ? "#ecfdf5" : "#fef2f2",
                                  color: isCredit ? "#065f46" : "#991b1b",
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>

                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              <Typography
                                component="span"
                                sx={{
                                  fontWeight: 700,
                                  color: isCredit ? "#16a34a" : "#dc2626",
                                }}
                              >
                                {isCredit ? "+" : "-"}₹{Number(txn.amount || 0).toLocaleString("en-IN")}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Box>
        );
      }

      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", mt: 5, bgcolor: "#ffffff", display: "flex", flexDirection: "column" }}>
        <Header />

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, flexGrow: 1 }}>
          {/* Top Hero Banner - Minimalist Luxury */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              mb: 4,
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              bgcolor: "#ffffff",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
              }}
            >
              {/* User Avatar & Name */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                <Avatar
                  src={user?.image || ""}
                  alt={user?.firstname || "User"}
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: "#111827",
                    color: "#ffffff",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    border: "2px solid #e5e7eb",
                  }}
                >
                  {user?.firstname ? user.firstname[0]?.toUpperCase() : "U"}
                </Avatar>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h5" sx={{ color: "#111827", fontWeight: 700 }}>
                      {user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.username : "Loading Account..."}
                    </Typography>
                    <Tooltip title="Verified Customer Account">
                      <VerifiedUserIcon sx={{ fontSize: 20, color: "#16a34a" }} />
                    </Tooltip>
                  </Box>
                  <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.2 }}>
                    {user?.email || "customer@trendtrove.com"} &bull;{" "}
                    <span style={{ color: "#111827", fontWeight: 600 }}>@{user?.username || "user"}</span>
                  </Typography>
                </Box>
              </Box>

              {/* Quick Metrics & Actions */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                  <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                    Wallet Balance
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
                    ₹{(walletData.balance || 0).toLocaleString("en-IN")}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                  <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                    Total Orders
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
                    {orders.length}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setIsProfileModalOpen(true)}
                    sx={{
                      bgcolor: "#111827",
                      "&:hover": { bgcolor: "#1f2937" },
                      fontWeight: 600,
                      px: 2,
                    }}
                  >
                    Edit Profile
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Main Two-Column Layout */}
          <Grid container spacing={3.5}>
            {/* Left Minimalist Sidebar */}
            <Grid item xs={12} md={3.2}>
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "#ffffff",
                }}
              >
                <List sx={{ p: 1.5 }}>
                  {[
                    { id: "profile", label: "Personal Profile", icon: <PersonIcon /> },
                    { id: "addresses", label: `Saved Addresses (${addresses.length})`, icon: <LocationOnIcon /> },
                    { id: "orders", label: `My Orders (${orders.length})`, icon: <ReceiptIcon /> },
                    { id: "cart", label: `Shopping Cart (${cart?.items?.length || 0})`, icon: <ShoppingCartIcon /> },
                    { id: "wallet", label: `Wallet & Refunds (₹${walletData.balance})`, icon: <AccountBalanceWalletIcon /> },
                  ].map((item) => {
                    const isSelected = selectedSection === item.id;
                    return (
                      <ListItem
                        key={item.id}
                        button
                        onClick={() => setSelectedSection(item.id)}
                        sx={{
                          cursor: "pointer",
                          borderRadius: 1.5,
                          mb: 0.5,
                          color: isSelected ? "#ffffff" : "#374151",
                          bgcolor: isSelected ? "#111827" : "transparent",
                          "&:hover": {
                            bgcolor: isSelected ? "#111827" : "#f9fafb",
                            color: isSelected ? "#ffffff" : "#111827",
                          },
                          transition: "all 0.15s ease",
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isSelected ? "#ffffff" : "#6b7280",
                            minWidth: 38,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: "0.9rem",
                          }}
                        />
                      </ListItem>
                    );
                  })}

                  <Divider sx={{ my: 1.5, borderColor: "#f3f4f6" }} />

                  {/* Sign Out Option */}
                  <ListItem
                    button
                    onClick={handleLogout}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 1.5,
                      color: "#dc2626",
                      "&:hover": { bgcolor: "#fef2f2" },
                    }}
                  >
                    <ListItemIcon sx={{ color: "#dc2626", minWidth: 38 }}>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Sign Out"
                      primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Right Detailed Content */}
            <Grid item xs={12} md={8.8}>
              {renderContent()}
            </Grid>
          </Grid>
        </Container>

        {/* Global Modals */}
        <ProfileModal
          open={isProfileModalOpen}
          handleClose={() => setIsProfileModalOpen(false)}
          user={user || {}}
          profileImage={user?.image}
          onProfileUpdate={handleProfileUpdate}
        />

        <ResetPasswordModal
          open={isResetPasswordModalOpen}
          handleClose={() => setIsResetPasswordModalOpen(false)}
          onPasswordReset={handlePasswordReset}
        />

        <AddAddressModal
          open={isAddAddressModalOpen}
          onClose={() => setIsAddAddressModalOpen(false)}
          onAddressAdded={handleAddressAdded}
        />

        {selectedAddressToEdit && (
          <EditAddressModal
            open={isEditAddressModalOpen}
            onClose={() => {
              setIsEditAddressModalOpen(false);
              setSelectedAddressToEdit(null);
            }}
            address={selectedAddressToEdit}
            onAddressUpdated={handleAddressUpdated}
          />
        )}

        {/* Delete Address Confirmation Modal */}
        <Dialog
          open={openDeleteModal}
          onClose={handleCloseDeleteModal}
          PaperProps={{
            sx: { borderRadius: 2, p: 1, minWidth: 320 },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: "#111827" }}>
            Delete Address
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "#4b5563" }}>
              Are you sure you want to remove this delivery address? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDeleteModal} sx={{ color: "#6b7280", fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteAddress}
              variant="contained"
              color="error"
              sx={{ fontWeight: 600, px: 2.5 }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%", fontWeight: 500 }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default UserProfilePage;
