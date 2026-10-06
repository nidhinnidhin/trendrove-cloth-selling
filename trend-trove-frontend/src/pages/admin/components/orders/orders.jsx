import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryIcon from "@mui/icons-material/History";
import axiosInstance from "@/utils/adminAxiosInstance";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const Orders = () => {
  const [orders, setOrders] = useState([]);
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
  const [isReturnApprovalModalOpen, setIsReturnApprovalModalOpen] =
    useState(false);
  const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get(
          "/checkout/get-all-order-product"
        );

        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, itemId, newStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/checkout/update-order-status/${orderId}/${itemId}`,
        { newStatus }
      );

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.itemId === itemId
                      ? { ...item, status: newStatus }
                      : item
                  ),
                  orderStatus: response.data.order.orderStatus,
                }
              : order
          )
        );
        setSnackbar({
          open: true,
          message: "Item status updated successfully",
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
    if (order.orderStatus === "Cancelled") {
      setSnackbar({
        open: true,
        message: "Cannot edit status of a cancelled order",
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
                          returnStatus: approved
                            ? "Return Approved"
                            : "Return Rejected",
                        }
                      : item
                  ),
                }
              : order
          )
        );
        setSnackbar({
          open: true,
          message: `Return ${approved ? "approved" : "rejected"} successfully`,
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error processing return request",
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
        setSnackbar({
          open: true,
          message: "Return rejected successfully",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error processing return rejection",
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

  // Fetch orders (existing method)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get(
          "/checkout/get-all-order-product"
        );
        if (response.data.success) {
          setOrders(response.data.orders);
          setFilteredOrders(response.data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Advanced filtering function
  const applyFilters = () => {
    let result = [...orders];

    if (filterOptions.returnStatus.returnRequested) {
      result = result.filter((order) =>
        order.items.some((item) => item.returnRequested && item.returnStatus === "Return Pending")
      );
    }
    if (filterOptions.returnStatus.returnAccepted) {
      result = result.filter((order) =>
        order.items.some((item) => item.returnStatus === "Return Approved")
      );
    }
    if (filterOptions.returnStatus.returnRejected) {
      result = result.filter((order) =>
        order.items.some((item) => item.returnStatus === "Return Rejected")
      );
    }

    if (filterOptions.orderStatus.cancelled) {
      result = result.filter((order) => order.orderStatus === "Cancelled");
    }
    if (filterOptions.orderStatus.delivered) {
      result = result.filter((order) =>
        order.items.some((item) => item.status === "Delivered")
      );
    }
    if (filterOptions.orderStatus.processing) {
      result = result.filter((order) =>
        order.items.some((item) => item.status === "Processing")
      );
    }
    if (filterOptions.orderStatus.shipped) {
      result = result.filter((order) =>
        order.items.some((item) => item.status === "Shiped")
      );
    }

    if (filterOptions.orderAmount.highToLow) {
      result.sort((a, b) => b.totalAmount - a.totalAmount);
    }
    if (filterOptions.orderAmount.lowToHigh) {
      result.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    if (filterOptions.dateRange.startDate && filterOptions.dateRange.endDate) {
      result = result.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate >= filterOptions.dateRange.startDate &&
          orderDate <= filterOptions.dateRange.endDate
        );
      });
    }

    setFilteredOrders(result);
    setPage(0);
  };

  // const resetFilters = () => {
  //   setFilterOptions({
  //     returnStatus: {
  //       returnRequested: false,
  //       returnAccepted: false,
  //       returnRejected: false,
  //     },
  //     orderStatus: {
  //       cancelled: false,
  //       delivered: false,
  //       processing: false,
  //       shipped: false,
  //     },
  //     orderAmount: {
  //       highToLow: false,
  //       lowToHigh: false,
  //     },
  //     dateRange: {
  //       startDate: null,
  //       endDate: null,
  //     },
  //   });
  //   setFilteredOrders(orders);
  // };

  // Update filter options and apply filters
  
  // const resetFilters = () => {
  //   setFilterOptions({
  //     returnStatus: {
  //       returnRequested: false,
  //       returnAccepted: false,
  //       returnRejected: false,
  //     },
  //     orderStatus: {
  //       cancelled: false,
  //       delivered: false,
  //       processing: false,
  //       shipped: false,
  //     },
  //     orderAmount: {
  //       highToLow: false,
  //       lowToHigh: false,
  //     },
  //     dateRange: {
  //       startDate: null,
  //       endDate: null,
  //     },
  //   });
  //   setFilteredOrders(orders);
  // };
  const handleFilterChange = (category, key) => {
    const updatedFilters = { ...filterOptions };

    // For exclusive filters (only one can be selected)
    if (category === "orderAmount") {
      updatedFilters.orderAmount = {
        highToLow:
          key === "highToLow" ? !updatedFilters.orderAmount.highToLow : false,
        lowToHigh:
          key === "lowToHigh" ? !updatedFilters.orderAmount.lowToHigh : false,
      };
    } else {
      updatedFilters[category][key] = !updatedFilters[category][key];
    }

    setFilterOptions(updatedFilters);
    applyFilters();
  };

  // Reset all filters
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
    setFilteredOrders(orders);
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "transparent", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#1E1F23",
          borderRadius: 2,
          padding: 2,
          marginBottom: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h6" sx={{  fontWeight: "bold" }}>
          Orders Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<FilterListIcon />}
          onClick={() => setIsFilterDrawerOpen(true)}
          sx={{
            
            color: "#ffffff",
            "&:hover": { backgroundColor: "#e0e0e0" },
          }}
        >
          Filters
        </Button>
      </Box>

      <Drawer
        anchor="left"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 400, padding: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Advanced Filters
          </Typography>

          <Grid container spacing={2}>
            {/* Return Status Filters */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Return Status
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.returnStatus.returnRequested}
                      onChange={() => handleFilterChange('returnStatus', 'returnRequested')}
                    />
                  }
                  label="Return Requested"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.returnStatus.returnAccepted}
                      onChange={() => handleFilterChange('returnStatus', 'returnAccepted')}
                    />
                  }
                  label="Return Accepted"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.returnStatus.returnRejected}
                      onChange={() => handleFilterChange('returnStatus', 'returnRejected')}
                    />
                  }
                  label="Return Rejected"
                />
              </FormGroup>
            </Grid>

            {/* Order Status Filters */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Order Status
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.orderStatus.cancelled}
                      onChange={() => handleFilterChange('orderStatus', 'cancelled')}
                    />
                  }
                  label="Cancelled Orders"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.orderStatus.delivered}
                      onChange={() => handleFilterChange('orderStatus', 'delivered')}
                    />
                  }
                  label="Delivered Orders"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.orderStatus.processing}
                      onChange={() => handleFilterChange('orderStatus', 'processing')}
                    />
                  }
                  label="Processing Orders"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.orderStatus.shipped}
                      onChange={() => handleFilterChange('orderStatus', 'shipped')}
                    />
                  }
                  label="Shipped Orders"
                />
              </FormGroup>
            </Grid>

            {/* Order Amount Filters */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Order Amount
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.orderAmount.highToLow}
                      onChange={() => handleFilterChange('orderAmount', 'highToLow')}
                    />
                  }
                  label="High to Low"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.orderAmount.lowToHigh}
                      onChange={() => handleFilterChange('orderAmount', 'lowToHigh')}
                    />
                  }
                  label="Low to High"
                />
              </FormGroup>
            </Grid>

            {/* Date Range Filter */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Date Range
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={filterOptions.dateRange.startDate}
                    onChange={(date) => {
                      setFilterOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, startDate: date }
                      }));
                      applyFilters();
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                  <DatePicker
                    label="End Date"
                    value={filterOptions.dateRange.endDate}
                    onChange={(date) => {
                      setFilterOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, endDate: date }
                      }));
                      applyFilters();
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>

            {/* Reset Filters Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="secondary"
                onClick={resetFilters}
                fullWidth
              >
                Reset All Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Drawer>

      {filteredOrders
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((order) => {
          console.log("orderssssssssssssssssssssssssssss", order);

          return (
            <Accordion key={order.orderId} sx={{ mb: 2, boxShadow: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#ffffff" }}
                    >
                      Order ID: {order.orderId}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#B8BBC2" }}>
                      Customer: {order.customer.name} {order.customer.email}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#B8BBC2" }}>
                      Total Amount: ₹{order.totalAmount}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrderDetailClick(order);
                    }}
                    sx={{
                      
                      
                      "&:hover": { backgroundColor: "#66bb6a" },
                    }}
                  >
                    Order Details
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#1E1F23" }}>
                        <TableCell
                          sx={{  fontWeight: "bold" }}
                        >
                          Product
                        </TableCell>
                        <TableCell
                          sx={{  fontWeight: "bold" }}
                        >
                          Quantity
                        </TableCell>
                        <TableCell
                          sx={{  fontWeight: "bold" }}
                        >
                          Price
                        </TableCell>
                        <TableCell
                          sx={{  fontWeight: "bold" }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          sx={{  fontWeight: "bold" }}
                        >
                          Actions
                        </TableCell>
                        <TableCell
                          sx={{  fontWeight: "bold" }}
                        >
                          Payement Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => {
                        console.log("Itemmm", order.payment.status);

                        return (
                          <TableRow key={item.itemId}>
                            <TableCell>
                              {item.productName.slice(0, 20)} - {item.color} (
                              {item.size})
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.price}</TableCell>
                            <TableCell>{item.status || "Pending"}</TableCell>

                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                {/* Show Return Request button if return is pending */}
                                {item.returnRequested &&
                                item.returnStatus === "Return Pending" ? (
                                  <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setSelectedItem(item);
                                      setIsReturnApprovalModalOpen(true);
                                    }}
                                    sx={{ minWidth: "160px" }}
                                  >
                                    View Return Request
                                  </Button>
                                ) : null}

                                {/* Show Edit Status button only if:
                                  1. No return request exists OR return was rejected
                                  2. AND item is not already returned/approved */}
                                {(!item.returnRequested ||
                                  item.returnStatus === "Return Rejected") &&
                                  item.status !== "Returned" &&
                                  item.returnStatus !== "Return Approved" && (
                                    <Button
                                      variant="contained"
                                      startIcon={<EditIcon />}
                                      onClick={() =>
                                        handleEditClick(order, item)
                                      }
                                      sx={{
                                        backgroundColor: "#ff9800",
                                        
                                        "&:hover": {
                                          backgroundColor: "#ffb74d",
                                        },
                                        minWidth: "160px",
                                      }}
                                    >
                                      Edit Status
                                    </Button>
                                  )}

                                {/* Show return status chip if return was requested */}
                                {item.returnRequested &&
                                  item.returnStatus !== "Return Pending" && (
                                    <Chip
                                      label={item.returnStatus}
                                      color={
                                        item.returnStatus === "Return Approved"
                                          ? "success"
                                          : "error"
                                      }
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                              </Box>
                            </TableCell>
                            <TableCell>{order.payment.status}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })}

      <TablePagination
        component="div"
        count={orders.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mt: 2, color: "#ffffff" }}
      />

      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <DialogTitle sx={{ backgroundColor: "#1E1F23",  }}>
          Update Item Status
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Shiped">Shiped</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          <Button
            onClick={() =>
              handleStatusChange(
                selectedOrder?.orderId,
                selectedItem?.itemId,
                newStatus
              )
            }
            color="primary"
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isOrderDetailModalOpen}
        onClose={() => setIsOrderDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: "#1E1F23",  }}>
          Order Details
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "#ffffff" }}
              >
                Order ID: {selectedOrder.orderId}
              </Typography>
              <Typography variant="body1">
                <strong>Customer:</strong> {selectedOrder.customer.name}
                {selectedOrder.customer.email}
              </Typography>
              <Typography variant="body1">
                <strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}
              </Typography>
              <Typography variant="body1">
                <strong>Ordered at:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 3, fontWeight: "bold", color: "#ffffff" }}
              >
                Shipping Address
              </Typography>
              <Typography variant="body1">
                {selectedOrder.shippingAddress.fullName}
              </Typography>
              <Typography variant="body1">
                {selectedOrder.shippingAddress.address},{" "}
                {selectedOrder.shippingAddress.city},{" "}
                {selectedOrder.shippingAddress.state} -{" "}
                {selectedOrder.shippingAddress.pincode}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong>{" "}
                {selectedOrder.shippingAddress.mobileNumber}
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 3, fontWeight: "bold", color: "#ffffff" }}
              >
                Products
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#1E1F23" }}>
                      <TableCell sx={{  fontWeight: "bold" }}>
                        Product
                      </TableCell>
                      <TableCell sx={{  fontWeight: "bold" }}>
                        Quantity
                      </TableCell>
                      <TableCell sx={{  fontWeight: "bold" }}>
                        Price
                      </TableCell>
                      <TableCell sx={{  fontWeight: "bold" }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item) => {
                      console.log("Orderrrrrrrrrrrrrrrrrrrrrrrrrraaaaa", item);

                      return (
                        <TableRow key={item.itemId}>
                          <TableCell>
                            {item.productName} - {item.color} ({item.size})
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.price}</TableCell>
                          <TableCell>{item.status}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOrderDetailModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isReturnApprovalModalOpen}
        onClose={() => setIsReturnApprovalModalOpen(false)}
      >
        <DialogTitle sx={{ backgroundColor: "#1E1F23",  }}>
          Return Request Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedItem && (
            <Box>
              <Typography variant="h6">
                Return Reason: {selectedItem.returnReason}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Additional Details: {selectedItem.additionalDetails}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsReturnApprovalModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIsRejectReasonModalOpen(true);
            }}
            color="error"
            variant="contained"
          >
            Reject Return
          </Button>
          <Button
            onClick={() =>
              handleReturnApproval(
                selectedOrder?.orderId,
                selectedItem?.itemId,
                true
              )
            }
            color="success"
            variant="contained"
          >
            Approve Return
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isRejectReasonModalOpen}
        onClose={() => setIsRejectReasonModalOpen(false)}
      >
        <DialogTitle sx={{ backgroundColor: "#1E1F23",  }}>
          Return Rejection Reason
        </DialogTitle>
        <DialogContent sx={{ mt: 2, minWidth: 400 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting the return request:
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRejectReasonModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReturnRejection}
            color="primary"
            variant="contained"
            disabled={!rejectReason.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Orders;
