import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Paper,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Divider,
  Rating,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TableContainer,
  Stack,
  Pagination,
} from "@mui/material";
import {
  LocalShipping,
  Cancel,
  AccessTime,
  LocationOn,
  Payment,
  ShoppingBag,
  Replay,
  ExpandMore,
} from "@mui/icons-material";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
  Font,
} from "@react-pdf/renderer";
import { RateReview } from "@mui/icons-material";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import AddReviewModal from "@/components/modals/addReview";
import axiosInstance from "@/utils/axiosInstance";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { format } from "date-fns";

Font.register({
  family: "Helvetica",
  src: "path/to/your/font/Helvetica.ttf",
});

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333333",
  },
  invoiceInfo: {
    marginBottom: 5,
  },
  invoiceId: {
    fontSize: 12,
    fontWeight: "bold",
  },
  invoiceDate: {
    fontSize: 10,
    color: "#666666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
    padding: 5,
    borderRadius: 3,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EEEEEE",
    borderRadius: 3,
    padding: 8,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    padding: 8,
  },
  col1: { width: "40%" },
  col2: { width: "15%" },
  col3: { width: "15%" },
  col4: { width: "15%" },
  col5: { width: "15%" },
  total: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 5,
  },
  totalLabel: {
    width: 100,
    textAlign: "right",
    marginRight: 10,
    fontWeight: "bold",
  },
  totalValue: {
    width: 80,
    textAlign: "right",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
  },
  grandTotalLabel: {
    width: 100,
    textAlign: "right",
    marginRight: 10,
    fontWeight: "bold",
    fontSize: 12,
  },
  grandTotalValue: {
    width: 80,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 12,
  },
  footer: {
    marginTop: 30,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
  paymentInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 3,
  },
  paymentMethod: {
    flexDirection: "row",
    marginBottom: 5,
  },
  paymentStatus: {
    flexDirection: "row",
    marginBottom: 5,
  },
  statusChip: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: 3,
    borderRadius: 3,
    fontSize: 8,
    width: 60,
    textAlign: "center",
  },
  pendingChip: {
    backgroundColor: "#FFC107",
    color: "white",
    padding: 3,
    borderRadius: 3,
    fontSize: 8,
    width: 60,
    textAlign: "center",
  },
  productImage: {
    width: 30,
    height: 30,
    marginRight: 5,
    border: "1pt solid #EEEEEE",
  },
});

// Create Invoice PDF Document component
const InvoicePDF = ({ order }) => {
  const activeItems = order.items.filter(item => 
    item.status !== "Returned" && 
    !(item.returnRequested && item.returnStatus === "Return Approved")
  );
  
  // Only proceed if there are active items
  if (activeItems.length === 0) {
    return null;
  }
  
  // Calculate subtotal for active items only
  const activeSubtotal = activeItems.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );
  
  // Calculate proportional delivery charge and discount
  const proportionFactor = activeSubtotal / order.subTotal;
  const activeDeliveryCharge = Math.round(order.deliveryCharge * proportionFactor);
  const activeCouponDiscount = Math.round(order.couponDiscount * proportionFactor);
  
  // Calculate final amount
  const finalAmount = activeSubtotal + activeDeliveryCharge - activeCouponDiscount;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src="/logo.png" style={styles.logo} />
            <Text style={styles.title}>TAX INVOICE</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceId}>Invoice #: {order.orderId}</Text>
            <Text style={styles.invoiceDate}>
              Date: {format(new Date(order.orderDate), "dd MMM yyyy")}
            </Text>
            <Text style={styles.invoiceDate}>
              Time: {format(new Date(order.orderDate), "hh:mm a")}
            </Text>
          </View>
        </View>

        {/* Company Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Company:</Text>
            <Text style={styles.value}>TREND TROVE Pvt. Ltd.</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>
              123 Fashion Street, Style City, IN 400001
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>GSTIN:</Text>
            <Text style={styles.value}>22AAAAA0000A1Z5</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contact:</Text>
            <Text style={styles.value}>
              +91 9876543210 | support@trendtrove.com
            </Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{order.shippingAddress.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>
              {`${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>
              {order.shippingAddress.mobileNumber}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order Date:</Text>
            <Text style={styles.value}>
              {format(new Date(order.orderDate), "dd MMM yyyy")}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Product</Text>
              <Text style={styles.col2}>Unit Price</Text>
              <Text style={styles.col3}>Quantity</Text>
              <Text style={styles.col4}>Tax (18%)</Text>
              <Text style={styles.col5}>Total</Text>
            </View>

            {activeItems.map((item, index) => {
              const itemTotal = item.price * item.quantity;
              const taxRate = 0.18; // 18% GST
              const taxAmount = (itemTotal * taxRate) / (1 + taxRate); // Reverse calculate tax
              const priceExclTax = itemTotal - taxAmount;

              return (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.col1, { flexDirection: "column" }]}>
                    <Text>{item.productName}</Text>
                    <Text style={{ fontSize: 8, color: "#666666" }}>
                      {`Size: ${item.size}, Color: ${item.color}`}
                    </Text>
                    <Text style={{ fontSize: 8, color: "#666666" }}>
                      {`HSN: 6203`}
                    </Text>
                  </View>
                  <Text style={styles.col2}>₹{item.price.toFixed(2)}</Text>
                  <Text style={styles.col3}>{item.quantity}</Text>
                  <Text style={styles.col4}>₹{taxAmount.toFixed(2)}</Text>
                  <Text style={styles.col5}>₹{itemTotal.toFixed(2)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.total}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>₹{activeSubtotal.toFixed(2)}</Text>
          </View>

          {activeDeliveryCharge > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery:</Text>
              <Text style={styles.totalValue}>
                ₹{activeDeliveryCharge.toFixed(2)}
              </Text>
            </View>
          )}

          {activeCouponDiscount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>
                -₹{activeCouponDiscount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>
              ₹{finalAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.paymentInfo}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.paymentMethod}>
            <Text style={styles.label}>Payment Mode:</Text>
            <Text style={styles.value}>{order.payment?.method || "N/A"}</Text>
          </View>
          <View style={styles.paymentStatus}>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.value}>
              <Text
                style={
                  order.payment?.status === "completed"
                    ? styles.statusChip
                    : styles.pendingChip
                }
              >
                {order.payment?.status || "N/A"}
              </Text>
            </View>
          </View>
          {order.couponCode && (
            <View style={styles.row}>
              <Text style={styles.label}>Coupon Applied:</Text>
              <Text style={styles.value}>{order.couponCode}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This is a computer-generated invoice and does not require a
            signature.
          </Text>
          <Text>
            For any queries regarding this invoice, please contact our support
            at support@trendtrove.com
          </Text>
          <Text>Thank you for shopping with TREND TROVE!</Text>
        </View>
      </Page>
    </Document>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [error, setError] = useState("");
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5; // You can adjust this number

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get("/checkout/get-orders");
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOpenReviewModal = (orderId, itemId) => {
    setSelectedOrder(orderId);
    setSelectedItem(itemId);
    setOpenReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setOpenReviewModal(false);
  };

  const handleOpenModal = (orderId, itemId, type) => {
    console.log("OrderId:", orderId, "ItemId: ", itemId);

    setSelectedOrder(orderId);
    setSelectedItem(itemId);
    setModalType(type);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setReturnReason("");
    setAdditionalDetails("");
    setError("");
  };

  const handleReturnProduct = async () => {
    if (!returnReason || !additionalDetails.trim()) {
      setError("Please select a return reason and provide additional details.");
      return;
    }

    try {
      const response = await axiosInstance.patch(
        `/checkout/return-product/${selectedOrder}/${selectedItem}`,
        {
          reason: returnReason,
          details: additionalDetails,
        }
      );

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order.orderId === selectedOrder) {
              const updatedOrder = {
                ...order,
                items: order.items.map((item) =>
                  item.itemId === selectedItem
                    ? {
                        ...item,
                        returnRequested: true,
                        returnStatus: "Return Pending",
                        returnReason: returnReason,
                      }
                    : item
                ),
              };
              return updatedOrder;
            }
            return order;
          })
        );
        handleCloseModal();
        setError("");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to process return request. Please try again."
      );
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setError("Please provide a reason for cancellation");
      return;
    }

    try {
      const response = await axiosInstance.patch(
        `/checkout/cancel-order/${selectedOrder}/${selectedItem}`,
        { reason: cancelReason }
      );

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order.orderId === selectedOrder) {
              const updatedOrder = {
                ...order,
                items: order.items.map((item) =>
                  item.itemId === selectedItem
                    ? {
                        ...item,
                        status: "Cancelled",
                        cancelReason: cancelReason,
                      }
                    : item
                ),
              };
              return updatedOrder;
            }
            return order;
          })
        );
        handleCloseModal();
        setError("");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to process cancel order request. Please try again."
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Cancelled":
        return "error";
      default:
        return "primary";
    }
  };

  const handleRetryPayment = async (order) => {
    try {
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

      // Create new order for retry payment
      const response = await axiosInstance.post(`/payment/create-order`, {
        amount: Math.round(order.payment.amount * 100),
        currency: "INR",
        checkoutId: order.orderId,
        isRetry: true,
      });

      const orderData = response.data;

      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SlhJwHElHKOoQI",
        amount: orderData.amount || Math.round(order.payment.amount * 100),
        currency: orderData.currency || "INR",
        name: "TREND TROVE",
        description: "Purchase Payment Retry",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axiosInstance.post(`/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              checkoutId: order.orderId,
              isRetry: true,
            });

            if (verifyResponse.data.status === "success") {
              setSnackbar({
                open: true,
                message: "Payment successful!",
                severity: "success",
              });
              window.location.reload();
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            setSnackbar({
              open: true,
              message: "Payment verification failed",
              severity: "error",
            });
          }
        },
        modal: {
          ondismiss: async function () {
            try {
              await axiosInstance.post(`/payment/cancel`, {
                orderId: orderData.id,
                checkoutId: order.orderId,
                status: "retry_pending",
              });
            } catch (error) {
              console.error("Failed to handle payment cancellation:", error);
            }
          },
        },
        prefill: {
          name: order.shippingAddress?.fullName || "",
          contact: order.shippingAddress?.mobileNumber || "",
        },
        theme: {
          color: "#333",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment retry failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to retry payment",
        severity: "error",
      });
    }
  };

  const hasActiveItems = (order) => {
    return order.items.some(item => 
      item.status !== "Returned" && 
      !(item.returnRequested && item.returnStatus === "Return Approved")
    );
  };

  const handleDownloadInvoice = (order) => {
    // Only show download button if order has non-returned items
    
    if (!hasActiveItems(order)) {
      return null;
    }

    return (
      <PDFDownloadLink
        document={<InvoicePDF order={order} />}
        fileName={`TrendTrove_Invoice_${order.orderId}.pdf`}
      >
        {({ blob, url, loading, error }) => (
          <IconButton
            onClick={(e) => e.stopPropagation()}
            disabled={loading}
            sx={{ color: "#333" }}
            title="Download Invoice"
          >
            <FileDownloadIcon />
          </IconButton>
        )}
      </PDFDownloadLink>
    );
  };

  // Calculate total amount for an order
  const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  // Calculate pagination values
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Header />
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        My Orders
      </Typography>

      {currentOrders.map((order) => {
        const orderTotal = calculateOrderTotal(order);
        console.log("Ordered date", order);

        return (
          <Accordion
            key={order.orderId}
            defaultExpanded={true}
            sx={{
              mb: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: "#f5f5f5",
                borderBottom: "1px solid rgba(0,0,0,0.1)",
                "&:hover": {
                  backgroundColor: "#eeeeee",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  pr: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Order ID: {order.orderId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(order.orderDate).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal: ₹{orderTotal}
                    </Typography>
                    {order.deliveryCharge > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Delivery Charge: ₹{order.deliveryCharge}
                      </Typography>
                    )}
                    {order.couponDiscount > 0 && (
                      <Typography
                        variant="body2"
                        sx={{ color: "success.main" }}
                      >
                        Coupon Discount: -₹{order.couponDiscount}
                      </Typography>
                    )}
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "primary.main", fontWeight: 600, mt: 0.5 }}
                    >
                      Final Amount: ₹{order.payment?.amount || orderTotal}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  {order.payment?.status === "retry_pending" &&
                    order.payment?.method === "online" && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetryPayment(order);
                        }}
                        startIcon={<Payment />}
                        sx={{
                          backgroundColor: "#1976d2",
                          "&:hover": {
                            backgroundColor: "#115293",
                          },
                        }}
                      >
                        Retry Payment
                      </Button>
                    )}

                  {hasActiveItems(order) && handleDownloadInvoice(order)}
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#fafafa" }}>
                      <TableCell>Product</TableCell>
                      <TableCell>Delivery Address</TableCell>
                      <TableCell>Payment Info</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow
                        key={`${order.orderId}-${item.itemId}-${index}`}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <img
                              src={item.image}
                              alt={item.productName}
                              style={{
                                width: 80,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: "4px",
                                marginRight: 10,
                              }}
                            />
                            <Box>
                              <Typography variant="subtitle2">
                                {item.productName}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Size: {item.size}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Color: {item.color}
                              </Typography>
                              <Typography variant="body2">
                                Price: ₹{item.price} × {item.quantity}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                Item Total: ₹{item.price * item.quantity}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Delivery Address Column */}
                        <TableCell>
                          {order.shippingAddress ? (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
                              }}
                            >
                              <Typography variant="subtitle2">
                                {order.shippingAddress.fullName}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {order.shippingAddress.address},
                                {order.shippingAddress.city},
                                {order.shippingAddress.state} -{" "}
                                {order.shippingAddress.pincode}
                              </Typography>
                              <Typography variant="body2">
                                Mobile: {order.shippingAddress.mobileNumber}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="error">
                              Address not available
                            </Typography>
                          )}
                        </TableCell>

                        {/* Payment Info Column */}
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.5,
                            }}
                          >
                            <Typography variant="subtitle2">
                              <Payment
                                sx={{
                                  fontSize: 16,
                                  mr: 0.5,
                                  verticalAlign: "text-bottom",
                                }}
                              />
                              {order.payment?.method || "N/A"}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Stack direction="row" spacing={1}>
                              {order.payment?.status === "pending" && (
                                <Chip
                                  label={order.payment?.status}
                                  color="primary"
                                  variant="contained"
                                />
                              )}
                              {order.payment?.status === "completed" && (
                                <Chip
                                  label={order.payment?.status}
                                  color="success"
                                  variant="contained"
                                />
                              )}
                              {order.payment?.status === "retry_pending" && (
                                <Chip
                                  label={order.payment?.status}
                                  color="error"
                                  variant="contained"
                                />
                              )}
                            </Stack>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="textSecondary">
                                Subtotal: ₹{item.price * item.quantity}
                              </Typography>

                              {order.couponCode && (
                                <Typography variant="body2" color="error">
                                  Coupon ({order.couponCode}): -₹
                                  {(
                                    item.price * item.quantity -
                                    (order.payment?.amount || 0)
                                  ).toFixed(1)}
                                </Typography>
                              )}
                              {order.deliveryCharge > 0 && (
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  Delivery: ₹{order.deliveryCharge}
                                </Typography>
                              )}

                              <Divider sx={{ my: 1 }} />

                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "bold", color: "green" }}
                              >
                                Final Price: ₹{item?.finalPrice || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={item.status || order.orderStatus}
                            color={getStatusColor(
                              item.status || order.orderStatus
                            )}
                          />
                        </TableCell>

                        <TableCell>
                          {(item.status === "pending" ||
                            item.status === "Processing") && (
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() =>
                                handleOpenModal(
                                  order.orderId,
                                  item.itemId,
                                  "cancel"
                                )
                              }
                              sx={{ width: "150px", mb: 1 }}
                            >
                              Cancel
                            </Button>
                          )}

                          {/* Show Return button for delivered orders */}
                          {item.status === "Delivered" && (
                            <>
                              {item.returnRequested ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  <Chip
                                    label={`Return ${item.returnStatus}`}
                                    color={
                                      item.returnStatus === "Return Approved"
                                        ? "success"
                                        : item.returnStatus ===
                                          "Return Rejected"
                                        ? "error"
                                        : "warning"
                                    }
                                    sx={{ minWidth: "150px" }}
                                  />
                                  {item.returnStatus === "Return Rejected" && (
                                    <Typography variant="caption" color="error">
                                      Your return request was rejected
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<Replay />}
                                  onClick={() =>
                                    handleOpenModal(
                                      order.orderId,
                                      item.itemId,
                                      "return"
                                    )
                                  }
                                  sx={{ width: "150px" }}
                                >
                                  Return
                                </Button>
                              )}
                            </>
                          )}

                          {(item.status === "Delivered" ||
                            item.status === "Returned") && (
                            <Button
                              variant="outlined"
                              color="success"
                              onClick={() =>
                                handleOpenReviewModal(
                                  order.orderId,
                                  item.itemId
                                )
                              }
                              sx={{
                                width: "150px",
                                margin: "10px 0px",
                                backgroundColor: "rgba(0, 0, 0, 0.05)",
                                "&:hover": {
                                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                                },
                              }}
                            >
                              Add Review
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <AddReviewModal
        openReviewModal={openReviewModal}
        handleCloseReviewModal={handleCloseReviewModal}
        selectedOrder={selectedOrder}
        selectedItem={selectedItem}
        orders={orders}
        setOrders={setOrders}
      />

      {/* Return Product Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>
          {modalType === "return" ? "Return Product" : "Cancel Order"}
        </DialogTitle>
        <DialogContent>
          {modalType === "return" ? (
            <>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Return Reason</InputLabel>
                <Select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  label="Return Reason"
                >
                  <MenuItem value="Defective">Defective</MenuItem>
                  <MenuItem value="Not as described">Not as described</MenuItem>
                  <MenuItem value="Wrong size/fit">Wrong size/fit</MenuItem>
                  <MenuItem value="Changed my mind">Changed my mind</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Details"
                variant="outlined"
                margin="normal"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
              />
            </>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Cancellation Reason"
              variant="outlined"
              margin="normal"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          )}
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
          <Button
            onClick={
              modalType === "return" ? handleReturnProduct : handleCancelOrder
            }
            variant="contained"
            color="primary"
          >
            {modalType === "return" ? "Submit Return" : "Confirm Cancel"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add pagination at the bottom */}
      {orders.length > ordersPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      <Footer />
    </Container>
  );
};

export default OrdersPage;
