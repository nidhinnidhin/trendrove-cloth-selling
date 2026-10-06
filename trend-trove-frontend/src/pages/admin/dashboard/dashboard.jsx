import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ButtonGroup,
  TextField,
  Chip,
  CircularProgress,
  TablePagination,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import {
  ArrowForward,
  AttachMoney,
  ShoppingBag,
  LocalShipping,
  AssignmentReturn,
  LocalOffer,
  Cancel,
  FileDownload,
  Person,
  Discount,
  Collections,
  Category as CategoryIcon,
  GetApp,
  TableChart,
} from "@mui/icons-material";
import DashLineChart from "../components/dashboard/dashLineChart";
import RevenueCard from "../components/dashboard/revenueCard";
import Users from "../components/users/users";
import CategoryManagement from "../components/category/category";
import BrandManagement from "../components/brand/brand";
import { useRouter } from "next/router";
import ProductManagement from "../components/products/products";
import Orders from "../components/orders/orders";
import Cookie from "js-cookie";
import Coupons from "../components/coupons/coupons";
import Offers from "../components/offers/offfers";
import axios from "axios";
import axiosInstance from "@/utils/adminAxiosInstance";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Banners from "../components/banners/banners";
import Cookies from "js-cookie";
import UserManagement from "../components/users/users";
import OrderManagement from "../components/orders/orders";
import CouponManagement from "../components/coupons/coupons";
import OfferManagement from "../components/offers/offfers";
import BannerManagement from "../components/banners/banners";
import * as XLSX from "xlsx";
import DisplayChat from "../components/chat/displayChat";
import SidebarDrawer from "./SidebarDrawer";

const Dashboard = () => {
  const [selectedTopic, setSelectedTopic] = useState("Sales Summary");
  const [selectedDate, setSelectedDate] = useState("Last 7 days");
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filterType, setFilterType] = useState("last7days");

  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    returnedOrders: 0,
    cancelledOrders: 0,
    totalDiscount: 0,
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ledgerData, setLedgerData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    recentTransactions: [],
  });

  const router = useRouter();

  const [orderPage, setOrderPage] = useState(0);
  const [ledgerPage, setLedgerPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginatedOrders = orders.slice(
    orderPage * rowsPerPage,
    (orderPage + 1) * rowsPerPage
  );

  const paginatedLedgerTransactions = ledgerData.recentTransactions.slice(
    ledgerPage * rowsPerPage,
    (ledgerPage + 1) * rowsPerPage
  );

  const handleOrderPageChange = (event, newPage) => {
    setOrderPage(newPage);
  };

  const handleLedgerPageChange = (event, newPage) => {
    setLedgerPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setOrderPage(0);
    setLedgerPage(0);
  };

  const [chartFilter, setChartFilter] = useState("monthly");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, [filterType, customDates]);

  useEffect(() => {
    if (!orders.length) return;

    const currentDate = new Date();
    let filteredOrders = [];

    switch (chartFilter) {
      case "yearly":
        filteredOrders = orders;
        break;

      case "monthly":
        filteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getFullYear() === currentDate.getFullYear();
        });
        break;

      case "weekly":
        const oneWeekAgo = new Date(currentDate);
        oneWeekAgo.setDate(currentDate.getDate() - 7);
        filteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= oneWeekAgo;
        });
        break;

      case "daily":
        const today = new Date(currentDate);
        today.setHours(0, 0, 0, 0);
        filteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= today;
        });
        break;
    }

    setChartData(filteredOrders);
  }, [chartFilter, orders]);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get(
        "/checkout/get-all-order-product"
      );
      if (response.data?.orders) {
        const filteredOrders = filterOrdersByDate(response.data.orders);
        setOrders(filteredOrders);
        calculateStats(filteredOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const filterOrdersByDate = (orders) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (filterType) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last7days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "last30days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "custom":
        if (customDates.startDate && customDates.endDate) {
          startDate = new Date(customDates.startDate);
          endDate = new Date(customDates.endDate);
        }
        break;
    }

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const calculateStats = (orders) => {
    const newStats = orders.reduce(
      (acc, order) => {
        if (order.orderStatus !== "Cancelled") {
          acc.totalRevenue += order.totalAmount;
        }

        acc.totalOrders++;

        switch (order.orderStatus.toLowerCase()) {
          case "pending":
            acc.pendingOrders++;
            break;
          case "cancelled":
            acc.cancelledOrders++;
            break;
        }

        if (order.items.some((item) => item.status === "Returned")) {
          acc.returnedOrders++;
        }

        order.items.forEach((item) => {
          const originalPrice = item.price * item.quantity;
          const finalPrice = order.totalAmount;
          acc.totalDiscount += originalPrice - finalPrice;
        });

        return acc;
      },
      {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        returnedOrders: 0,
        cancelledOrders: 0,
        totalDiscount: 0,
      }
    );

    setStats(newStats);
  };

  const handleLogout = () => {
    setOpenLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await axiosInstance.post("/adminlogout");

      localStorage.removeItem("admin-logged");
      Cookies.remove("adminToken");

      router.push("/admin/authentication/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setSnackbarMessage("Logout failed. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setOpenLogoutDialog(false);
    }
  };

  useEffect(() => {
    let admin_logged = localStorage.getItem("admin-logged");
    if (admin_logged) {
      router.push("/admin/dashboard/dashboard");
    } else {
      router.push("/admin/authentication/login");
    }
  }, []);

  const handleCancelLogout = () => {
    setOpenLogoutDialog(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Order Summary Report", 14, 22);

    doc.setFontSize(12);
    doc.text(
      `Period: ${filterType.replace(/([A-Z])/g, " $1").toLowerCase()}`,
      14,
      32
    );

    doc.autoTable({
      startY: 40,
      head: [["Metric", "Value"]],
      body: [
        ["Total Revenue", `₹${stats.totalRevenue.toLocaleString("en-IN")}`],
        ["Total Orders", stats.totalOrders],
        ["Pending Orders", stats.pendingOrders],
        ["Returned Orders", stats.returnedOrders],
        ["Cancelled Orders", stats.cancelledOrders],
        ["Total Discount", `₹${stats.totalDiscount.toLocaleString("en-IN")}`],
      ],
      theme: "grid",
      headStyles: { fillColor: [255, 152, 0] },
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [
        [
          "Order ID",
          "Date",
          "Customer",
          "Items",
          "Amount",
          "Status",
          "Payment",
        ],
      ],
      body: orders.map((order) => [
        order.orderId,
        new Date(order.createdAt).toLocaleDateString(),
        order.customer.email,
        order.items
          .map((item) => `${item.productName} x ${item.quantity}`)
          .join("\n"),
        `₹${order.totalAmount}`,
        order.orderStatus,
        order.payment.method,
      ]),
      theme: "grid",
      headStyles: { fillColor: [255, 152, 0] },
      styles: { overflow: "linebreak" },
      columnStyles: {
        3: { cellWidth: 50 },
      },
    });

    const fileName = `order_summary_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          axiosInstance.get("/products/get?page=1&limit=10"),
          axiosInstance.get("/categories/get/admin"),
          axiosInstance.get("/brands/get/admin"),
        ]);

        setProducts(productsRes.data.products || []);
        setCategories(categoriesRes.data.categories || []);
        setBrands(brandsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const calculateLedgerData = () => {
      if (!orders || orders.length === 0) return;

      const ledger = orders.reduce(
        (acc, order) => {
          // Calculate revenue
          if (order.orderStatus !== "Cancelled") {
            acc.totalRevenue += order.totalAmount;
          }

          // Add to transactions list
          acc.recentTransactions.push({
            id: order.orderId,
            date: order.createdAt,
            type: "CREDIT",
            amount: order.totalAmount,
            description: `Order #${order.orderId}`,
            status: order.orderStatus,
            paymentMethod: order.payment.method,
          });

          return acc;
        },
        {
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          recentTransactions: [],
        }
      );

      // Sort transactions by date
      ledger.recentTransactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      // Calculate net profit
      ledger.netProfit = ledger.totalRevenue - ledger.totalExpenses;

      setLedgerData(ledger);
    };

    calculateLedgerData();
  }, [orders]);

  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
    XLSX.writeFile(
      workbook,
      `ledger_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#FF9800',
      },
      secondary: {
        main: '#1E1F23',
      },
      background: {
        default: '#121317',
        paper: '#1E1F23',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B8BBC2',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: '#1E1F23',
            backgroundImage: 'none',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          },
          head: {
            fontWeight: 600,
            backgroundColor: 'rgba(255,255,255,0.02)',
          }
        },
      },
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", width: "100%" }}>
        <SidebarDrawer selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic} />

        <Box
          sx={{
            flexGrow: 1,
            padding: 3,
            width: "calc(100% - 260px)",
            backgroundColor: "#121317", // updated to match theme
            height: "100vh",
            overflow: "auto",
            color: "#ffffff"
          }}
        >
          {selectedTopic === "Sales Summary" && (
            <Box>
              <Grid
                container
                spacing={3}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="date-filter" sx={{ color: "#212121" }}>
                      Select Date
                    </InputLabel>
                    <Select
                      labelId="date-filter"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      label="Select Date"
                      sx={{
                        backgroundColor: "#f5f5f5",
                        color: "#212121",
                      }}
                    >
                      <MenuItem value="Last 7 days">Last 7 days</MenuItem>
                      <MenuItem value="Last 30 days">Last 30 days</MenuItem>
                      <MenuItem value="This Month">This Month</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid>
                  <Button
                    onClick={handleLogout}
                    variant="contained"
                    sx={{
                      backgroundColor: "red",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#d32f2f",
                      },
                    }}
                  >
                    Logout
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ marginTop: 2 }}>
                <Button
                  variant="contained"
                  onClick={generatePDF}
                  sx={{
                    backgroundColor: "#FF9800",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#FF5722",
                    },
                  }}
                >
                  Download Summary
                </Button>
              </Box>

              <Divider sx={{ marginY: 3, borderColor: "#444" }} />

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Total Revenue"
                    amount={stats.totalRevenue}
                    icon={AttachMoney}
                    color="#4CAF50"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Total Orders"
                    amount={stats.totalOrders}
                    icon={ShoppingBag}
                    color="#2196F3"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Pending Orders"
                    amount={stats.pendingOrders}
                    icon={LocalShipping}
                    color="#FF9800"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Returns"
                    amount={stats.returnedOrders}
                    icon={AssignmentReturn}
                    color="#f44336"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Cancelled"
                    amount={stats.cancelledOrders}
                    icon={Cancel}
                    color="#9C27B0"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Total Discount"
                    amount={stats.totalDiscount}
                    icon={LocalOffer}
                    color="#607D8B"
                  />
                </Grid>
              </Grid>

              <Card sx={{ mb: 3, backgroundColor: "#333" }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "white" }}>
                      Sales Overview
                    </Typography>
                    <FormControl sx={{ minWidth: 120 }}>
                      <Select
                        value={chartFilter}
                        onChange={(e) => setChartFilter(e.target.value)}
                        sx={{
                          color: "white",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.23)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.23)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FF9800",
                          },
                          "& .MuiSvgIcon-root": {
                            color: "white",
                          },
                        }}
                      >
                        <MenuItem value="daily">Today</MenuItem>
                        <MenuItem value="weekly">Last 7 Days</MenuItem>
                        <MenuItem value="monthly">This Year</MenuItem>
                        <MenuItem value="yearly">All Time</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <DashLineChart data={chartData} />
                </CardContent>
              </Card>

              <Card sx={{ backgroundColor: "#333" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                    Recent Orders
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: "white" }}>
                            Order ID
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>Date</TableCell>
                          <TableCell sx={{ color: "white" }}>
                            Customer
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>Items</TableCell>
                          <TableCell sx={{ color: "white" }}>
                            Total Amount
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>Status</TableCell>
                          <TableCell sx={{ color: "white" }}>Payment</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedOrders.map((order) => (
                          <TableRow key={order.orderId}>
                            <TableCell sx={{ color: "white" }}>
                              {order.orderId}
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              {order.customer.email}
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              {order.items.map((item) => (
                                <div key={item.itemId}>
                                  {item.productName} x {item.quantity}
                                </div>
                              ))}
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              ₹{order.totalAmount}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.orderStatus}
                                color={
                                  order.orderStatus === "pending"
                                    ? "warning"
                                    : order.orderStatus === "Cancelled"
                                    ? "error"
                                    : order.orderStatus === "Returned"
                                    ? "info"
                                    : "success"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.payment.method}
                                color={
                                  order.payment.status === "completed"
                                    ? "success"
                                    : "warning"
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Orders Table Pagination */}
              <TablePagination
                component="div"
                count={orders.length}
                page={orderPage}
                onPageChange={handleOrderPageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                  color: "white",
                  ".MuiTablePagination-select": {
                    color: "white",
                  },
                  ".MuiTablePagination-selectIcon": {
                    color: "white",
                  },
                  ".MuiTablePagination-displayedRows": {
                    color: "white",
                  },
                  ".MuiTablePagination-actions": {
                    color: "white",
                  },
                }}
              />
              {/* Top Products, Categories, and Brands Overview */}
              <Grid container spacing={3}>
                {/* Products Column */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ backgroundColor: "#333", height: "100%" }}>
                    <CardHeader
                      title={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="h6" sx={{ color: "#FF9800" }}>
                            Top Products
                          </Typography>
                          <Chip
                            label={`Total: ${products.length}`}
                            sx={{ backgroundColor: "#FF9800", color: "white" }}
                          />
                        </Box>
                      }
                    />
                    <CardContent>
                      <List sx={{ maxHeight: 400, overflow: "auto" }}>
                        {loading ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              p: 2,
                            }}
                          >
                            <CircularProgress sx={{ color: "#FF9800" }} />
                          </Box>
                        ) : (
                          products.slice(0, 10).map((product) => (
                            <ListItem
                              key={product._id}
                              sx={{
                                color: "white",
                                "&:hover": { backgroundColor: "#444" },
                                borderRadius: 1,
                                mb: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  width: "100%",
                                }}
                              >
                                <img
                                  src={product.variants?.[0]?.mainImage}
                                  alt={product.name}
                                  style={{
                                    width: 60,
                                    height: 60,
                                    marginRight: 10,
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                  }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1">
                                    {product.name}
                                  </Typography>
                                  <Typography variant="body2" color="gray">
                                    {product.category.name} |{" "}
                                    {product.brand.name}
                                  </Typography>
                                  <Typography variant="body2" color="#FF9800">
                                    ₹
                                    {product.variants?.[0]?.sizes?.[0]?.price ||
                                      "N/A"}
                                  </Typography>
                                </Box>
                                {product.isDeleted && (
                                  <Chip
                                    label="Blocked"
                                    size="small"
                                    sx={{
                                      backgroundColor: "#f44336",
                                      color: "white",
                                    }}
                                  />
                                )}
                              </Box>
                            </ListItem>
                          ))
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Categories Column */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ backgroundColor: "#333", height: "100%" }}>
                    <CardHeader
                      title={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="h6" sx={{ color: "#FF9800" }}>
                            Categories
                          </Typography>
                          <Chip
                            label={`Total: ${categories.length}`}
                            sx={{ backgroundColor: "#FF9800", color: "white" }}
                          />
                        </Box>
                      }
                    />
                    <CardContent>
                      <List sx={{ maxHeight: 400, overflow: "auto" }}>
                        {loading ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              p: 2,
                            }}
                          >
                            <CircularProgress sx={{ color: "#FF9800" }} />
                          </Box>
                        ) : (
                          categories.slice(0, 10).map((category) => (
                            <ListItem
                              key={category._id}
                              sx={{
                                color: "white",
                                "&:hover": { backgroundColor: "#444" },
                                borderRadius: 1,
                                mb: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  width: "100%",
                                }}
                              >
                                <CategoryIcon
                                  sx={{ mr: 2, color: "#FF9800" }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1">
                                    {category.name}
                                  </Typography>
                                  <Typography variant="body2" color="gray">
                                    Created:{" "}
                                    {new Date(
                                      category.createdAt
                                    ).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                {category.isDeleted && (
                                  <Chip
                                    label="Blocked"
                                    size="small"
                                    sx={{
                                      backgroundColor: "#f44336",
                                      color: "white",
                                    }}
                                  />
                                )}
                              </Box>
                            </ListItem>
                          ))
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Brands Column */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ backgroundColor: "#333", height: "100%" }}>
                    <CardHeader
                      title={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="h6" sx={{ color: "#FF9800" }}>
                            Brands
                          </Typography>
                          <Chip
                            label={`Total: ${brands.length}`}
                            sx={{ backgroundColor: "#FF9800", color: "white" }}
                          />
                        </Box>
                      }
                    />
                    <CardContent>
                      <List sx={{ maxHeight: 400, overflow: "auto" }}>
                        {loading ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              p: 2,
                            }}
                          >
                            <CircularProgress sx={{ color: "#FF9800" }} />
                          </Box>
                        ) : (
                          brands.slice(0, 10).map((brand) => (
                            <ListItem
                              key={brand._id}
                              sx={{
                                color: "white",
                                "&:hover": { backgroundColor: "#444" },
                                borderRadius: 1,
                                mb: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  width: "100%",
                                }}
                              >
                                <img
                                  src={brand.image}
                                  alt={brand.name}
                                  style={{
                                    width: 60,
                                    height: 60,
                                    marginRight: 10,
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                  }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1">
                                    {brand.name}
                                  </Typography>
                                  <Typography variant="body2" color="gray">
                                    Created:{" "}
                                    {new Date(
                                      brand.createdAt
                                    ).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                {brand.isDeleted && (
                                  <Chip
                                    label="Blocked"
                                    size="small"
                                    sx={{
                                      backgroundColor: "#f44336",
                                      color: "white",
                                    }}
                                  />
                                )}
                              </Box>
                            </ListItem>
                          ))
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Ledger Book Section */}
              <Card
                sx={{
                  backgroundColor: "#333",
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: 3,
                  margin: "15px 0px",
                }}
              >
                <CardHeader
                  title={
                    <Typography variant="h5" sx={{ color: "#FF9800" }}>
                      Financial Ledger
                    </Typography>
                  }
                />
                <CardContent>
                  {/* Summary Cards */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <Card
                        sx={{
                          backgroundColor: "#424242",
                          p: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h6" sx={{ color: "#4CAF50" }}>
                          Total Revenue
                        </Typography>
                        <Typography variant="h4" sx={{ color: "white" }}>
                          ₹{ledgerData.totalRevenue.toLocaleString("en-IN")}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card
                        sx={{
                          backgroundColor: "#424242",
                          p: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h6" sx={{ color: "#F44336" }}>
                          Total Expenses
                        </Typography>
                        <Typography variant="h4" sx={{ color: "white" }}>
                          ₹{ledgerData.totalExpenses.toLocaleString("en-IN")}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card
                        sx={{
                          backgroundColor: "#424242",
                          p: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h6" sx={{ color: "#FF9800" }}>
                          Net Profit
                        </Typography>
                        <Typography variant="h4" sx={{ color: "white" }}>
                          ₹{ledgerData.netProfit.toLocaleString("en-IN")}
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Transactions Table */}
                  <TableContainer
                    component={Paper}
                    sx={{ backgroundColor: "#424242" }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{ color: "#FF9800", fontWeight: "bold" }}
                          >
                            Date
                          </TableCell>
                          <TableCell
                            sx={{ color: "#FF9800", fontWeight: "bold" }}
                          >
                            Transaction ID
                          </TableCell>
                          <TableCell
                            sx={{ color: "#FF9800", fontWeight: "bold" }}
                          >
                            Description
                          </TableCell>
                          <TableCell
                            sx={{ color: "#FF9800", fontWeight: "bold" }}
                          >
                            Type
                          </TableCell>
                          <TableCell
                            sx={{ color: "#FF9800", fontWeight: "bold" }}
                          >
                            Amount
                          </TableCell>
                          <TableCell
                            sx={{ color: "#FF9800", fontWeight: "bold" }}
                          >
                            Payment Method
                          </TableCell>
                          <TableCell
                            sx={{ color: "#FF9800", fontWeight: "bold" }}
                          >
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedLedgerTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell sx={{ color: "white" }}>
                              {new Date(transaction.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              {transaction.id}
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              {transaction.description}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.type}
                                sx={{
                                  backgroundColor:
                                    transaction.type === "CREDIT"
                                      ? "#4CAF50"
                                      : "#F44336",
                                  color: "white",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              ₹{transaction.amount.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              {transaction.paymentMethod}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.status}
                                sx={{
                                  backgroundColor:
                                    transaction.status === "Completed"
                                      ? "#4CAF50"
                                      : transaction.status === "Pending"
                                      ? "#FF9800"
                                      : transaction.status === "Cancelled"
                                      ? "#F44336"
                                      : "#757575",
                                  color: "white",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Ledger Table Pagination */}
                  <TablePagination
                    component="div"
                    count={ledgerData.recentTransactions.length}
                    page={ledgerPage}
                    onPageChange={handleLedgerPageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25]}
                    sx={{
                      color: "white",
                      ".MuiTablePagination-select": {
                        color: "white",
                      },
                      ".MuiTablePagination-selectIcon": {
                        color: "white",
                      },
                      ".MuiTablePagination-displayedRows": {
                        color: "white",
                      },
                      ".MuiTablePagination-actions": {
                        color: "white",
                      },
                    }}
                  />

                  {/* Export Buttons */}
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      gap: 2,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<GetApp />}
                      onClick={() => generatePDF("ledger")}
                      sx={{
                        backgroundColor: "#FF9800",
                        "&:hover": { backgroundColor: "#F57C00" },
                      }}
                    >
                      Export as PDF
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<TableChart />}
                      onClick={() =>
                        exportToExcel(ledgerData.recentTransactions)
                      }
                      sx={{
                        backgroundColor: "#4CAF50",
                        "&:hover": { backgroundColor: "#388E3C" },
                      }}
                    >
                      Export as Excel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {selectedTopic === "Products" && <ProductManagement />}
          {selectedTopic === "Users" && <UserManagement />}
          {selectedTopic === "Categories" && <CategoryManagement />}
          {selectedTopic === "Brands" && <BrandManagement />}
          {selectedTopic === "Orders" && <OrderManagement />}
          {selectedTopic === "Coupons" && <CouponManagement />}
          {selectedTopic === "Offers" && <OfferManagement />}
          {selectedTopic === "Banners" && <BannerManagement />}
          {selectedTopic === "Chats" && <DisplayChat />}
        </Box>
      </Box>

      <Dialog
        open={openLogoutDialog}
        onClose={handleCancelLogout}
        aria-labelledby="logout-dialog-title"
        keepMounted={false}
        disablePortal
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to logout?</DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary" autoFocus>
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="error">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default Dashboard;
