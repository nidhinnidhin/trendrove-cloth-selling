import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Typography,
  TablePagination,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  Grid,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Drawer,
  IconButton,
  Divider,
  Stack,
  Badge,
  InputAdornment,
  Card,
  CardContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import axiosInstance from "@/utils/adminAxiosInstance";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isReturnApprovalModalOpen, setIsReturnApprovalModalOpen] = useState(false);
  const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    returnStatus: {
      returnRequested: false,
      returnAccepted: false,
      returnRejected: false,
    },
    orderStatus: {
      cancelled: false,
      delivered: false,
      processing: false,
      shipped: false,
      pending: false,
    },
    orderAmount: {
      highToLow: false,
      lowToHigh: false,
    },
    dateRange: {
      startDate: null,
      endDate: null,
    },
  });

  // Fetch all orders on initial mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get("/checkout/get-all-order-product");
        if (response.data.success) {
          setOrders(response.data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch orders",
          severity: "error",
        });
      }
    };

    fetchOrders();
  }, []);

  // Filter and sort orders with reactive useMemo
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search query filter (Order ID, Customer Name, Email, Phone)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((order) => {
        const orderId = String(order.orderId || "").toLowerCase();
        const customerName = String(order.customer?.name || "").toLowerCase();
        const customerEmail = String(order.customer?.email || "").toLowerCase();
        const phone = String(order.shippingAddress?.mobileNumber || "").toLowerCase();
        return (
          orderId.includes(q) ||
          customerName.includes(q) ||
          customerEmail.includes(q) ||
          phone.includes(q)
        );
      });
    }

    // Return status filters (OR logic between checked return filters)
    const hasReturnFilter =
      filterOptions.returnStatus.returnRequested ||
      filterOptions.returnStatus.returnAccepted ||
      filterOptions.returnStatus.returnRejected;

    if (hasReturnFilter) {
      result = result.filter((order) =>
        order.items?.some((item) => {
          if (
            filterOptions.returnStatus.returnRequested &&
            item.returnRequested &&
            item.returnStatus === "Return Pending"
          ) {
            return true;
          }
          if (
            filterOptions.returnStatus.returnAccepted &&
            (item.returnStatus === "Return Approved" || item.status === "Returned")
          ) {
            return true;
          }
          if (
            filterOptions.returnStatus.returnRejected &&
            item.returnStatus === "Return Rejected"
          ) {
            return true;
          }
          return false;
        })
      );
    }

    // Order status filters (OR logic between checked order status filters)
    const hasOrderStatusFilter =
      filterOptions.orderStatus.cancelled ||
      filterOptions.orderStatus.delivered ||
      filterOptions.orderStatus.processing ||
      filterOptions.orderStatus.shipped ||
      filterOptions.orderStatus.pending;

    if (hasOrderStatusFilter) {
      result = result.filter((order) => {
        if (
          filterOptions.orderStatus.cancelled &&
          (order.orderStatus === "Cancelled" ||
            order.items?.some((i) => i.status === "Cancelled"))
        ) {
          return true;
        }
        if (
          filterOptions.orderStatus.delivered &&
          (order.orderStatus === "Delivered" ||
            order.items?.some((i) => i.status === "Delivered"))
        ) {
          return true;
        }
        if (
          filterOptions.orderStatus.processing &&
          (order.orderStatus === "Processing" ||
            order.items?.some((i) => i.status === "Processing"))
        ) {
          return true;
        }
        if (
          filterOptions.orderStatus.shipped &&
          (order.orderStatus === "Shiped" ||
            order.items?.some((i) => i.status === "Shiped"))
        ) {
          return true;
        }
        if (
          filterOptions.orderStatus.pending &&
          (order.orderStatus === "pending" ||
            order.items?.some((i) => i.status === "pending"))
        ) {
          return true;
        }
        return false;
      });
    }

    // Date range filter
    const startMs = filterOptions.dateRange.startDate
      ? dayjs(filterOptions.dateRange.startDate).startOf("day").valueOf()
      : null;
    const endMs = filterOptions.dateRange.endDate
      ? dayjs(filterOptions.dateRange.endDate).endOf("day").valueOf()
      : null;

    if (startMs || endMs) {
      result = result.filter((order) => {
        const orderTime = new Date(order.createdAt).getTime();
        if (startMs && orderTime < startMs) return false;
        if (endMs && orderTime > endMs) return false;
        return true;
      });
    }

    // Order amount sorting
    if (filterOptions.orderAmount.highToLow) {
      result.sort((a, b) => Number(b.totalAmount || 0) - Number(a.totalAmount || 0));
    } else if (filterOptions.orderAmount.lowToHigh) {
      result.sort((a, b) => Number(a.totalAmount || 0) - Number(b.totalAmount || 0));
    } else {
      // Default: Most recent orders first
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [orders, filterOptions, searchQuery]);

  // Count active filters for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.values(filterOptions.returnStatus).forEach((v) => v && count++);
    Object.values(filterOptions.orderStatus).forEach((v) => v && count++);
    Object.values(filterOptions.orderAmount).forEach((v) => v && count++);
    if (filterOptions.dateRange.startDate) count++;
    if (filterOptions.dateRange.endDate) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filterOptions, searchQuery]);

  // Real-time status change handler
  const handleStatusChange = async (orderId, itemId, updatedStatus) => {
    const targetOrder = orders.find((o) => o.orderId === orderId);
    const targetItem = targetOrder?.items?.find((i) => i.itemId === itemId);
    if (
      targetItem?.status === "Delivered" ||
      targetOrder?.orderStatus === "Delivered"
    ) {
      setSnackbar({
        open: true,
        message: "Delivered orders cannot be modified.",
        severity: "warning",
      });
      setIsEditModalOpen(false);
      return;
    }

    try {
      const response = await axiosInstance.patch(
        `/checkout/update-order-status/${orderId}/${itemId}`,
        { newStatus: updatedStatus }
      );

      if (response.data.success) {
        const newOverallStatus =
          response.data.order?.orderStatus ||
          (updatedStatus === "Cancelled" ? "Cancelled" : updatedStatus === "Delivered" ? "Delivered" : "Processing");

        // Update main orders state immediately (triggers useMemo automatically)
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.itemId === itemId ? { ...item, status: updatedStatus } : item
                  ),
                  orderStatus: newOverallStatus,
                }
              : order
          )
        );

        // Keep selectedOrder in sync if modal is open
        setSelectedOrder((prev) =>
          prev && prev.orderId === orderId
            ? {
                ...prev,
                items: prev.items.map((item) =>
                  item.itemId === itemId ? { ...item, status: updatedStatus } : item
                ),
                orderStatus: newOverallStatus,
              }
            : prev
        );

        setSnackbar({
          open: true,
          message: `Item status updated to "${updatedStatus}" successfully!`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error updating item status",
        severity: "error",
      });
    }
    setIsEditModalOpen(false);
  };

  const handleOrderDetailClick = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailModalOpen(true);
  };

  const handleEditClick = (order, item) => {
    if (item.status === "Cancelled" || order.orderStatus === "Cancelled") {
      setSnackbar({
        open: true,
        message: "This order was cancelled by the user and cannot be edited.",
        severity: "warning",
      });
      return;
    }

    if (item.status === "Delivered" || order.orderStatus === "Delivered") {
      setSnackbar({
        open: true,
        message: "This order has already been delivered and its status cannot be changed.",
        severity: "warning",
      });
      return;
    }

    setSelectedOrder(order);
    setSelectedItem(item);
    setNewStatus(item.status);
    setIsEditModalOpen(true);
  };

  const handleReturnApproval = async (orderId, itemId, approved) => {
    try {
      const response = await axiosInstance.patch(
        `/checkout/approve-return/${orderId}/${itemId}`,
        { approved }
      );

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.itemId === itemId
                      ? {
                          ...item,
                          status: approved ? "Returned" : item.status,
                          returnStatus: approved ? "Return Approved" : "Return Rejected",
                        }
                      : item
                  ),
                }
              : order
          )
        );

        setSelectedOrder((prev) =>
          prev && prev.orderId === orderId
            ? {
                ...prev,
                items: prev.items.map((item) =>
                  item.itemId === itemId
                    ? {
                        ...item,
                        status: approved ? "Returned" : item.status,
                        returnStatus: approved ? "Return Approved" : "Return Rejected",
                      }
                    : item
                ),
              }
            : prev
        );

        setSnackbar({
          open: true,
          message: `Return ${approved ? "approved and refund credited to user wallet" : "rejected"} successfully`,
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error processing return request",
        severity: "error",
      });
    }
    setIsReturnApprovalModalOpen(false);
  };

  const handleReturnRejection = async () => {
    try {
      const response = await axiosInstance.patch(
        `/checkout/approve-return/${selectedOrder?.orderId}/${selectedItem?.itemId}`,
        {
          approved: false,
          rejectionReason: rejectReason,
        }
      );

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === selectedOrder?.orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.itemId === selectedItem?.itemId
                      ? {
                          ...item,
                          returnStatus: "Return Rejected",
                          returnRequested: false,
                        }
                      : item
                  ),
                }
              : order
          )
        );

        setSelectedOrder((prev) =>
          prev && prev.orderId === selectedOrder?.orderId
            ? {
                ...prev,
                items: prev.items.map((item) =>
                  item.itemId === selectedItem?.itemId
                    ? {
                        ...item,
                        returnStatus: "Return Rejected",
                        returnRequested: false,
                      }
                    : item
                ),
              }
            : prev
        );

        setSnackbar({
          open: true,
          message: "Return rejected successfully",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error processing return rejection",
        severity: "error",
      });
    }
    setIsRejectReasonModalOpen(false);
    setIsReturnApprovalModalOpen(false);
    setRejectReason("");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (category, key) => {
    setFilterOptions((prev) => {
      const updated = { ...prev };
      if (category === "orderAmount") {
        updated.orderAmount = {
          highToLow: key === "highToLow" ? !prev.orderAmount.highToLow : false,
          lowToHigh: key === "lowToHigh" ? !prev.orderAmount.lowToHigh : false,
        };
      } else {
        updated[category] = {
          ...prev[category],
          [key]: !prev[category][key],
        };
      }
      return updated;
    });
    setPage(0);
  };

  const resetFilters = () => {
    setFilterOptions({
      returnStatus: {
        returnRequested: false,
        returnAccepted: false,
        returnRejected: false,
      },
      orderStatus: {
        cancelled: false,
        delivered: false,
        processing: false,
        shipped: false,
        pending: false,
      },
      orderAmount: {
        highToLow: false,
        lowToHigh: false,
      },
      dateRange: {
        startDate: null,
        endDate: null,
      },
    });
    setSearchQuery("");
    setPage(0);
  };

  // Helper for status badge rendering
  const getStatusChip = (status) => {
    const s = String(status || "pending").toLowerCase();
    switch (s) {
      case "delivered":
        return <Chip label="Delivered" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case "cancelled":
        return <Chip label="Cancelled by User" color="error" size="small" sx={{ fontWeight: 600 }} />;
      case "shiped":
      case "shipped":
        return <Chip label="Shipped" color="info" size="small" sx={{ fontWeight: 600 }} />;
      case "processing":
        return <Chip label="Processing" color="primary" size="small" sx={{ fontWeight: 600 }} />;
      case "returned":
        return <Chip label="Returned" color="secondary" size="small" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 600 }} />;
    }
  };

  // Helper for payment status chip rendering
  const getPaymentBadge = (method, status) => {
    const isWallet = method === "wallet";
    const isCompleted = status === "completed";
    const isCod = method === "cod";

    let label = "Pending";
    let color = "warning";

    if (isWallet && isCompleted) {
      label = "Paid via Wallet";
      color = "success";
    } else if (isCompleted) {
      label = "Paid";
      color = "success";
    } else if (isCod) {
      label = "Pay on Delivery";
      color = "default";
    } else if (status === "retry_pending") {
      label = "Payment Pending";
      color = "error";
    }

    return (
      <Chip
        size="small"
        label={label}
        color={color}
        variant={color === "default" ? "outlined" : "filled"}
        sx={{ fontWeight: 600, width: "fit-content" }}
      />
    );
  };

  return (
    <Box sx={{ padding: { xs: 2, md: 3 }, backgroundColor: "transparent", minHeight: "100vh" }}>
      {/* Top Header Card */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#1E1F23",
          borderRadius: 2,
          padding: 2.5,
          marginBottom: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#ffffff" }}>
            Orders Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.5 }}>
            Manage, filter, and track all customer orders, payments, and cancellations in real-time.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          {/* Quick Search */}
          <TextField
            size="small"
            placeholder="Search by ID, Name, Phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ color: "#9ca3af" }}>
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 260 },
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A2B30",
                color: "#fff",
                borderRadius: 2,
                "& fieldset": { borderColor: "#3f3f46" },
                "&:hover fieldset": { borderColor: "#71717a" },
              },
            }}
          />

          <Badge badgeContent={activeFiltersCount} color="warning">
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={() => setIsFilterDrawerOpen(true)}
              sx={{
                bgcolor: "#3f3f46",
                color: "#ffffff",
                "&:hover": { bgcolor: "#52525b" },
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
              }}
            >
              Filters
            </Button>
          </Badge>

          {activeFiltersCount > 0 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={resetFilters}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Reset Filters
            </Button>
          )}
        </Box>
      </Box>

      {/* Advanced Filter Drawer */}
      <Drawer
        anchor="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 380 },
            bgcolor: "#1E1F23",
            color: "#ffffff",
            p: 3,
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Advanced Filters
          </Typography>
          <IconButton onClick={() => setIsFilterDrawerOpen(false)} sx={{ color: "#9ca3af" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: "#2e2f34", mb: 3 }} />

        <Grid container spacing={3}>
          {/* Order Status Filters */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#facc15", mb: 1 }}>
              Order Status
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.orderStatus.cancelled}
                    onChange={() => handleFilterChange("orderStatus", "cancelled")}
                    sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#ef4444" } }}
                  />
                }
                label="Cancelled Orders"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.orderStatus.delivered}
                    onChange={() => handleFilterChange("orderStatus", "delivered")}
                    sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#22c55e" } }}
                  />
                }
                label="Delivered Orders"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.orderStatus.processing}
                    onChange={() => handleFilterChange("orderStatus", "processing")}
                    sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#3b82f6" } }}
                  />
                }
                label="Processing Orders"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.orderStatus.shipped}
                    onChange={() => handleFilterChange("orderStatus", "shipped")}
                    sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#06b6d4" } }}
                  />
                }
                label="Shipped Orders"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.orderStatus.pending}
                    onChange={() => handleFilterChange("orderStatus", "pending")}
                    sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#f59e0b" } }}
                  />
                }
                label="Pending Orders"
              />
            </FormGroup>
          </Grid>

          {/* Return Status Filters */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#facc15", mb: 1 }}>
              Return Status
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.returnStatus.returnRequested}
                    onChange={() => handleFilterChange("returnStatus", "returnRequested")}
                    sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#f59e0b" } }}
                  />
                }
                label="Return Requested (Pending Review)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.returnStatus.returnAccepted}
                    onChange={() => handleFilterChange("returnStatus", "returnAccepted")}
                    sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#22c55e" } }}
                  />
                }
                label="Return Accepted / Refunded"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.returnStatus.returnRejected}
                    onChange={() => handleFilterChange("returnStatus", "returnRejected")}
                    sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#ef4444" } }}
                  />
                }
                label="Return Rejected"
              />
            </FormGroup>
          </Grid>

          {/* Sort By Order Amount */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#facc15", mb: 1 }}>
              Sort by Order Amount
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.orderAmount.highToLow}
                    onChange={() => handleFilterChange("orderAmount", "highToLow")}
                    sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#eab308" } }}
                  />
                }
                label="Amount: High to Low"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.orderAmount.lowToHigh}
                    onChange={() => handleFilterChange("orderAmount", "lowToHigh")}
                    sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#eab308" } }}
                  />
                }
                label="Amount: Low to High"
              />
            </FormGroup>
          </Grid>

          {/* Date Range Filter */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#facc15", mb: 1 }}>
              Filter by Order Date
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
                <DatePicker
                  label="From Date"
                  value={filterOptions.dateRange.startDate}
                  onChange={(date) => {
                    setFilterOptions((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, startDate: date },
                    }));
                    setPage(0);
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#2A2B30",
                          color: "#fff",
                        },
                        "& .MuiInputLabel-root": { color: "#9ca3af" },
                      },
                    },
                  }}
                />
                <DatePicker
                  label="To Date"
                  value={filterOptions.dateRange.endDate}
                  onChange={(date) => {
                    setFilterOptions((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, endDate: date },
                    }));
                    setPage(0);
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#2A2B30",
                          color: "#fff",
                        },
                        "& .MuiInputLabel-root": { color: "#9ca3af" },
                      },
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={resetFilters}
              fullWidth
              sx={{ textTransform: "none", fontWeight: 600, py: 1 }}
            >
              Reset All Filters
            </Button>
          </Grid>
        </Grid>
      </Drawer>

      {/* Orders Accordion List */}
      {filteredOrders.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "#1E1F23",
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <ReceiptIcon sx={{ fontSize: 64, color: "#6b7280", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 600 }}>
            No Orders Found
          </Typography>
          <Typography variant="body2" sx={{ color: "#9ca3af", mt: 1 }}>
            {activeFiltersCount > 0
              ? "No orders match your filter criteria. Try resetting filters."
              : "No customer orders have been placed yet."}
          </Typography>
          {activeFiltersCount > 0 && (
            <Button
              variant="outlined"
              color="warning"
              onClick={resetFilters}
              sx={{ mt: 3, textTransform: "none" }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      ) : (
        filteredOrders
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((order) => {
            const isOrderCancelled =
              order.orderStatus === "Cancelled" ||
              (order.items && order.items.every((i) => i.status === "Cancelled"));

            return (
              <Accordion
                key={order.orderId}
                sx={{
                  mb: 2.5,
                  borderRadius: "8px !important",
                  overflow: "hidden",
                  bgcolor: "#1E1F23",
                  color: "#ffffff",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                  border: isOrderCancelled ? "1px solid rgba(239,68,68,0.4)" : "1px solid #2e2f34",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#9ca3af" }} />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    bgcolor: isOrderCancelled ? "rgba(239,68,68,0.06)" : "#222328",
                    borderBottom: "1px solid #2e2f34",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      justifyContent: "space-between",
                      alignItems: "center",
                      pr: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#ffffff" }}>
                          Order #{String(order.orderId).slice(-8).toUpperCase()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                          ({order.orderId})
                        </Typography>
                        {isOrderCancelled ? (
                          <Chip
                            label="Cancelled by User"
                            color="error"
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        ) : (
                          getStatusChip(order.orderStatus)
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ color: "#d1d5db" }}>
                        <strong>Customer:</strong> {order.customer?.name || "N/A"} &bull;{" "}
                        <span style={{ color: "#9ca3af" }}>{order.customer?.email || "N/A"}</span>
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                        Placed on: {new Date(order.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                          Total Paid Amount
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#4ade80" }}>
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderDetailClick(order);
                        }}
                        sx={{
                          bgcolor: "#3b82f6",
                          color: "#ffffff",
                          "&:hover": { bgcolor: "#2563eb" },
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 2,
                        }}
                      >
                        Order Details
                      </Button>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer component={Paper} sx={{ bgcolor: "transparent", boxShadow: "none" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#191a1e" }}>
                          <TableCell sx={{ color: "#9ca3af", fontWeight: 700, width: "30%" }}>
                            Product & Variant
                          </TableCell>
                          <TableCell sx={{ color: "#9ca3af", fontWeight: 700, textAlign: "center" }}>
                            Qty
                          </TableCell>
                          <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>
                            Unit Price
                          </TableCell>
                          <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>
                            Item Total
                          </TableCell>
                          <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>
                            Payment Info
                          </TableCell>
                          <TableCell sx={{ color: "#9ca3af", fontWeight: 700, textAlign: "center" }}>
                            Action / Management
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.items?.map((item) => {
                          const isItemCancelled =
                            item.status === "Cancelled" || order.orderStatus === "Cancelled";
                          const isItemDelivered =
                            item.status === "Delivered" || order.orderStatus === "Delivered";
                          const effectivePrice = item.finalPrice || item.price;
                          const lineTotal = effectivePrice * item.quantity;

                          return (
                            <TableRow
                              key={item.itemId}
                              sx={{
                                borderBottom: "1px solid #2e2f34",
                                bgcolor: isItemCancelled ? "rgba(239,68,68,0.03)" : "transparent",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
                              }}
                            >
                              {/* Product Info */}
                              <TableCell sx={{ color: "#ffffff" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                  {item.image ? (
                                    <Box
                                      component="img"
                                      src={item.image}
                                      alt={item.productName}
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 1.5,
                                        objectFit: "cover",
                                        border: "1px solid #3f3f46",
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 1.5,
                                        bgcolor: "#27272a",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <ReceiptIcon sx={{ color: "#71717a", fontSize: 24 }} />
                                    </Box>
                                  )}
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff" }}>
                                      {item.productName || "Product"}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                                      Color: {item.color || "N/A"} &bull; Size: {item.size || "N/A"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              {/* Quantity */}
                              <TableCell sx={{ color: "#ffffff", textAlign: "center", fontWeight: 600 }}>
                                {item.quantity}
                              </TableCell>

                              {/* Unit Price */}
                              <TableCell sx={{ color: "#ffffff" }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  ₹{Number(effectivePrice).toLocaleString("en-IN")}
                                </Typography>
                                {item.price && item.finalPrice && item.finalPrice < item.price && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      textDecoration: "line-through",
                                      color: "#71717a",
                                      display: "block",
                                    }}
                                  >
                                    ₹{Number(item.price).toLocaleString("en-IN")}
                                  </Typography>
                                )}
                              </TableCell>

                              {/* Item Total */}
                              <TableCell sx={{ color: "#4ade80", fontWeight: 700 }}>
                                ₹{Number(lineTotal).toLocaleString("en-IN")}
                              </TableCell>

                              {/* Status */}
                              <TableCell>{getStatusChip(item.status)}</TableCell>

                              {/* Payment Info */}
                              <TableCell>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#e4e4e7" }}>
                                    {order.payment?.method === "wallet"
                                      ? "Wallet Payment"
                                      : order.payment?.method === "cod"
                                      ? "Cash on Delivery"
                                      : order.payment?.method === "online"
                                      ? "Online (Razorpay)"
                                      : order.payment?.method || "N/A"}
                                  </Typography>
                                  {getPaymentBadge(order.payment?.method, order.payment?.status)}
                                </Box>
                              </TableCell>

                              {/* Action Management */}
                              <TableCell sx={{ textAlign: "center" }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {/* CRITICAL: If item or order is cancelled, do NOT show edit status, show clear badge & reason */}
                                  {isItemCancelled ? (
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                      <Chip
                                        icon={<CancelIcon sx={{ "&&": { color: "#ef4444" } }} />}
                                        label="Order Cancelled by User"
                                        size="small"
                                        sx={{
                                          color: "#ef4444",
                                          borderColor: "#ef4444",
                                          fontWeight: 600,
                                          bgcolor: "rgba(239, 68, 68, 0.1)",
                                        }}
                                      />
                                      {(item.cancellationReason || order.orderReason) && (
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#f87171",
                                            fontStyle: "italic",
                                            mt: 0.5,
                                            maxWidth: 200,
                                            textAlign: "center",
                                          }}
                                        >
                                          Reason: {item.cancellationReason || order.orderReason}
                                        </Typography>
                                      )}
                                    </Box>
                                  ) : item.returnRequested && item.returnStatus === "Return Pending" ? (
                                    /* Return Pending Approval */
                                    <Button
                                      variant="contained"
                                      color="warning"
                                      size="small"
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setSelectedItem(item);
                                        setIsReturnApprovalModalOpen(true);
                                      }}
                                      sx={{ textTransform: "none", fontWeight: 600, minWidth: 150 }}
                                    >
                                      Review Return Request
                                    </Button>
                                  ) : item.status === "Returned" || item.returnStatus === "Return Approved" ? (
                                    <Chip
                                      label="Return Approved"
                                      color="success"
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontWeight: 600 }}
                                    />
                                  ) : isItemDelivered ? (
                                    /* If order or item is delivered, do NOT show status update option */
                                    <Chip
                                      icon={<CheckCircleIcon sx={{ "&&": { color: "#22c55e" } }} />}
                                      label="Order Delivered"
                                      size="small"
                                      sx={{
                                        color: "#22c55e",
                                        borderColor: "#22c55e",
                                        fontWeight: 600,
                                        bgcolor: "rgba(34, 197, 94, 0.1)",
                                        px: 1,
                                      }}
                                    />
                                  ) : (
                                    /* Normal Active Item: Admin can update status */
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                                      onClick={() => handleEditClick(order, item)}
                                      sx={{
                                        bgcolor: "#f59e0b",
                                        color: "#000",
                                        "&:hover": { bgcolor: "#d97706" },
                                        textTransform: "none",
                                        fontWeight: 700,
                                        borderRadius: 1.5,
                                        minWidth: 130,
                                      }}
                                    >
                                      Edit Status
                                    </Button>
                                  )}

                                  {item.returnStatus === "Return Rejected" && (
                                    <Chip
                                      label="Return Rejected"
                                      color="error"
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            );
          })
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <TablePagination
          component="div"
          count={filteredOrders.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            mt: 2,
            color: "#ffffff",
            "& .MuiTablePagination-selectIcon": { color: "#ffffff" },
            "& .MuiTablePagination-actions button": { color: "#ffffff" },
          }}
        />
      )}

      {/* Edit Status Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "#1E1F23", color: "#ffffff", borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #2e2f34", fontWeight: 700 }}>
          Update Item Delivery Status
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: "#9ca3af", mb: 2 }}>
            Updating status for product:{" "}
            <strong style={{ color: "#fff" }}>{selectedItem?.productName}</strong>
          </Typography>
          <FormControl fullWidth>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              sx={{
                bgcolor: "#2A2B30",
                color: "#ffffff",
                borderRadius: 1.5,
                "& .MuiSelect-icon": { color: "#ffffff" },
              }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Shiped">Shipped</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #2e2f34" }}>
          <Button onClick={() => setIsEditModalOpen(false)} sx={{ color: "#9ca3af" }}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleStatusChange(selectedOrder?.orderId, selectedItem?.itemId, newStatus)
            }
            variant="contained"
            sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, fontWeight: 600 }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comprehensive Enterprise Order Details Modal */}
      <Dialog
        open={isOrderDetailModalOpen}
        onClose={() => setIsOrderDetailModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#1E1F23",
            color: "#ffffff",
            borderRadius: 2.5,
            border: "1px solid #2e2f34",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #2e2f34",
            bgcolor: "#24252a",
            py: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ReceiptIcon sx={{ color: "#f59e0b" }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff" }}>
                Order #{selectedOrder?.orderId}
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Placed on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setIsOrderDetailModalOpen(false)} sx={{ color: "#9ca3af" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedOrder && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Top 3 Summary Cards */}
              <Grid container spacing={2}>
                {/* 1. Customer Information */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: "#24252a", color: "#fff", borderRadius: 2, border: "1px solid #2e2f34", height: "100%" }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <PersonIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#3b82f6" }}>
                          Customer Details
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {selectedOrder.customer?.name || "N/A"}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, color: "#9ca3af" }}>
                        <EmailIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">{selectedOrder.customer?.email || "N/A"}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, color: "#9ca3af" }}>
                        <PhoneIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {selectedOrder.shippingAddress?.mobileNumber || "N/A"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 2. Shipping Address */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: "#24252a", color: "#fff", borderRadius: 2, border: "1px solid #2e2f34", height: "100%" }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <LocationOnIcon sx={{ color: "#22c55e", fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#22c55e" }}>
                          Delivery Address
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedOrder.shippingAddress?.fullName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.5, lineHeight: 1.4 }}>
                        {selectedOrder.shippingAddress?.address},<br />
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{" "}
                        <strong>{selectedOrder.shippingAddress?.pincode}</strong>
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                        <LocalShippingIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                          Method: {selectedOrder.shippingMethod || "Standard Delivery"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 3. Payment Overview */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: "#24252a", color: "#fff", borderRadius: 2, border: "1px solid #2e2f34", height: "100%" }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <PaymentIcon sx={{ color: "#eab308", fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#eab308" }}>
                          Payment Overview
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="body2" sx={{ color: "#9ca3af" }}>Method:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {selectedOrder.payment?.method === "wallet"
                            ? "Wallet Payment"
                            : selectedOrder.payment?.method === "cod"
                            ? "Cash on Delivery"
                            : selectedOrder.payment?.method === "online"
                            ? "Online (Razorpay)"
                            : selectedOrder.payment?.method || "N/A"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="body2" sx={{ color: "#9ca3af" }}>Status:</Typography>
                        {getPaymentBadge(selectedOrder.payment?.method, selectedOrder.payment?.status)}
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="caption" sx={{ color: "#9ca3af" }}>Txn ID:</Typography>
                        <Typography variant="caption" sx={{ color: "#d1d5db", fontFamily: "monospace" }}>
                          {selectedOrder.payment?.transactionId || "N/A"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Products Table */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: "#fff" }}>
                  Ordered Items ({selectedOrder.items?.length || 0})
                </Typography>
                <TableContainer component={Paper} sx={{ bgcolor: "#24252a", borderRadius: 2, border: "1px solid #2e2f34" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#191a1e" }}>
                        <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>Product</TableCell>
                        <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>Variant</TableCell>
                        <TableCell sx={{ color: "#9ca3af", fontWeight: 700, textAlign: "center" }}>Qty</TableCell>
                        <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>Paid Price</TableCell>
                        <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>Line Total</TableCell>
                        <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>Item Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items?.map((item) => {
                        const unitPaid = item.finalPrice || item.price;
                        const lineTotal = unitPaid * item.quantity;
                        const isCancelled = item.status === "Cancelled" || selectedOrder.orderStatus === "Cancelled";

                        return (
                          <TableRow key={item.itemId} sx={{ borderBottom: "1px solid #2e2f34" }}>
                            <TableCell sx={{ color: "#fff" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                {item.image && (
                                  <Box
                                    component="img"
                                    src={item.image}
                                    alt={item.productName}
                                    sx={{ width: 44, height: 44, borderRadius: 1, objectFit: "cover" }}
                                  />
                                )}
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {item.productName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ color: "#d1d5db" }}>
                              {item.color} / {item.size}
                            </TableCell>
                            <TableCell sx={{ color: "#fff", textAlign: "center", fontWeight: 600 }}>
                              {item.quantity}
                            </TableCell>
                            <TableCell sx={{ color: "#fff" }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ₹{Number(unitPaid).toLocaleString("en-IN")}
                              </Typography>
                              {item.price && item.finalPrice && item.finalPrice < item.price && (
                                <Typography variant="caption" sx={{ textDecoration: "line-through", color: "#71717a" }}>
                                  ₹{Number(item.price).toLocaleString("en-IN")}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ color: "#4ade80", fontWeight: 700 }}>
                              ₹{Number(lineTotal).toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                {isCancelled ? (
                                  <Chip label="Cancelled by User" color="error" size="small" sx={{ fontWeight: 600 }} />
                                ) : (
                                  getStatusChip(item.status)
                                )}
                                {(item.cancellationReason || selectedOrder.orderReason) && isCancelled && (
                                  <Typography variant="caption" sx={{ color: "#f87171", fontStyle: "italic" }}>
                                    Reason: {item.cancellationReason || selectedOrder.orderReason}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Financial Calculation Breakdown */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Card sx={{ bgcolor: "#24252a", color: "#fff", borderRadius: 2, border: "1px solid #2e2f34", minWidth: 320 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#facc15", mb: 2 }}>
                      Payment Breakdown
                    </Typography>

                    {/* Subtotal */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" sx={{ color: "#9ca3af" }}>Items Total:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ₹{selectedOrder.items
                          ?.reduce((s, i) => s + (i.finalPrice || i.price) * i.quantity, 0)
                          .toLocaleString("en-IN")}
                      </Typography>
                    </Box>

                    {/* Coupon Discount */}
                    {selectedOrder.discountAmount > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" sx={{ color: "#22c55e" }}>
                          Coupon Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ""}:
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#22c55e", fontWeight: 600 }}>
                          -₹{Number(selectedOrder.discountAmount).toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                    )}

                    {/* Delivery Charge */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: "#9ca3af" }}>Delivery Charge:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedOrder.deliveryCharge > 0 ? `₹${selectedOrder.deliveryCharge}` : "FREE"}
                      </Typography>
                    </Box>

                    <Divider sx={{ borderColor: "#3f3f46", my: 1.5 }} />

                    {/* Total Paid */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Total Paid:
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: "#4ade80" }}>
                        ₹{Number(selectedOrder.totalAmount).toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #2e2f34" }}>
          <Button
            onClick={() => setIsOrderDetailModalOpen(false)}
            variant="contained"
            sx={{ bgcolor: "#3f3f46", "&:hover": { bgcolor: "#52525b" }, px: 3, fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Approval Modal */}
      <Dialog
        open={isReturnApprovalModalOpen}
        onClose={() => setIsReturnApprovalModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "#1E1F23", color: "#ffffff", borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #2e2f34", fontWeight: 700, color: "#f59e0b" }}>
          Return Request Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2.5 }}>
          {selectedItem && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#fff" }}>
                Product: {selectedItem.productName} ({selectedItem.color}, Size {selectedItem.size})
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "#24252a", borderRadius: 1.5, border: "1px solid #2e2f34" }}>
                <Typography variant="body2" sx={{ color: "#facc15", fontWeight: 700, mb: 0.5 }}>
                  Return Reason:
                </Typography>
                <Typography variant="body1" sx={{ color: "#fff", mb: 1.5 }}>
                  {selectedItem.returnReason || "No reason specified"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#9ca3af", fontWeight: 700, mb: 0.5 }}>
                  Customer Explanation / Additional Details:
                </Typography>
                <Typography variant="body2" sx={{ color: "#e4e4e7" }}>
                  {selectedItem.additionalDetails || "No additional comments provided."}
                </Typography>
              </Paper>
              <Alert severity="info" sx={{ bgcolor: "rgba(59,130,246,0.1)", color: "#93c5fd" }}>
                Approving this return will automatically credit ₹
                {(selectedItem.finalPrice || selectedItem.price) * selectedItem.quantity} to the customer's wallet and restore product inventory.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #2e2f34" }}>
          <Button onClick={() => setIsReturnApprovalModalOpen(false)} sx={{ color: "#9ca3af" }}>
            Cancel
          </Button>
          <Button
            onClick={() => setIsRejectReasonModalOpen(true)}
            color="error"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          >
            Reject Return
          </Button>
          <Button
            onClick={() =>
              handleReturnApproval(selectedOrder?.orderId, selectedItem?.itemId, true)
            }
            color="success"
            variant="contained"
            sx={{ fontWeight: 700 }}
          >
            Approve & Refund to Wallet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog
        open={isRejectReasonModalOpen}
        onClose={() => setIsRejectReasonModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "#1E1F23", color: "#ffffff", borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #2e2f34", fontWeight: 700, color: "#ef4444" }}>
          Return Rejection Reason
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: "#9ca3af" }}>
            Please state why this return request is being rejected. This explanation will be emailed to the customer.
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Item tags removed, outside 7-day return window..."
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A2B30",
                color: "#fff",
                borderRadius: 1.5,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #2e2f34" }}>
          <Button onClick={() => setIsRejectReasonModalOpen(false)} sx={{ color: "#9ca3af" }}>
            Cancel
          </Button>
          <Button
            onClick={handleReturnRejection}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim()}
            sx={{ fontWeight: 600 }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%", fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Orders;
