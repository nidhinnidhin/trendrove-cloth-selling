import React, { useEffect, useState, useMemo } from "react";
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
  IconButton,
  Tooltip,
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
  TrendingUp,
  TrendingDown,
  PictureAsPdf,
  Visibility,
  Close,
  Inventory,
  ReceiptLong,
  Assessment,
  MonetizationOn,
} from "@mui/icons-material";
import DashLineChart from "../components/dashboard/dashLineChart";
import RevenueCard from "../components/dashboard/revenueCard";
import UserManagement from "../components/users/users";
import CategoryManagement from "../components/category/category";
import BrandManagement from "../components/brand/brand";
import { useRouter } from "next/router";
import ProductManagement from "../components/products/products";
import OrderManagement from "../components/orders/orders";
import CouponManagement from "../components/coupons/coupons";
import OfferManagement from "../components/offers/offfers";
import BannerManagement from "../components/banners/banners";
import axiosInstance from "@/utils/adminAxiosInstance";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import DisplayChat from "../components/chat/displayChat";
import SidebarDrawer from "./SidebarDrawer";

const Dashboard = () => {
  const [selectedTopic, setSelectedTopic] = useState("Sales Summary");
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filterType, setFilterType] = useState("last7days");
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    returnedOrders: 0,
    totalGrossSales: 0,
    totalProductDiscount: 0,
    totalCouponDiscount: 0,
    totalDiscount: 0,
    totalDelivery: 0,
    totalRefunds: 0,
    totalEstimatedCost: 0,
    totalNetProfit: 0,
    overallMargin: 0,
    averageOrderValue: 0,
  });

  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);

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
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [chartFilter, setChartFilter] = useState("monthly");
  const [chartData, setChartData] = useState([]);

  // Helper: compute comprehensive financial metrics per order
  const getOrderMetrics = (order) => {
    if (!order) return {};
    const items = order.items || [];

    // 1. Gross items subtotal at MRP / standard catalog price
    const grossItemTotal = items.reduce((sum, item) => {
      const p = Number(item.price) || 0;
      const q = Number(item.quantity) || 1;
      return sum + p * q;
    }, 0);

    // 2. Product-level discount (offer discount)
    const productDiscount = items.reduce((sum, item) => {
      const p = Number(item.price) || 0;
      const fp = Number(item.finalPrice || item.price) || 0;
      const q = Number(item.quantity) || 1;
      return sum + Math.max(0, (p - fp) * q);
    }, 0);

    // 3. Coupon discount
    const couponDiscount = Number(order.discountAmount) || 0;

    // 4. Total discount
    const totalDiscount = productDiscount + couponDiscount;

    // 5. Delivery fee
    const deliveryCharge =
      Number(order.deliveryCharge) ||
      (order.shipping?.deliveryCharge !== undefined
        ? Number(order.shipping.deliveryCharge)
        : 0);

    // 6. Final amount paid
    const finalPaid = Number(order.totalAmount) || 0;

    // 7. Status checks
    const statusLower = (order.orderStatus || "").toLowerCase();
    const isCancelled = statusLower === "cancelled";
    const isReturned =
      statusLower === "returned" || items.some((i) => (i.status || "").toLowerCase() === "returned");

    // 8. Estimated Cost of Goods Sold (COGS)
    // Benchmark: 60% of original MRP for active items
    const estimatedCost = isCancelled ? 0 : Math.round(grossItemTotal * 0.6);

    // 9. Profit / Loss for this order
    const netProfit = isCancelled ? 0 : Math.round(finalPaid - estimatedCost);
    const profitMargin =
      !isCancelled && finalPaid > 0
        ? Number(((netProfit / finalPaid) * 100).toFixed(1))
        : 0;

    return {
      grossItemTotal,
      productDiscount,
      couponDiscount,
      totalDiscount,
      deliveryCharge,
      finalPaid,
      isCancelled,
      isReturned,
      estimatedCost,
      netProfit,
      profitMargin,
    };
  };

  // Helper: filter orders by selected date range
  const filterOrdersByDate = (ordersList, type, dates) => {
    if (!ordersList || !ordersList.length) return [];
    if (type === "all") return ordersList;

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (type) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last7days":
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last30days":
        startDate.setDate(now.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        break;
      case "custom":
        if (dates?.startDate) {
          startDate = new Date(dates.startDate);
          startDate.setHours(0, 0, 0, 0);
        } else {
          startDate = new Date(0);
        }
        if (dates?.endDate) {
          endDate = new Date(dates.endDate);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
    }

    return ordersList.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  // Helper: calculate executive KPI stats
  const calculateStats = (ordersList) => {
    let totalRevenue = 0;
    let totalOrders = ordersList.length;
    let completedOrders = 0;
    let pendingOrders = 0;
    let cancelledOrders = 0;
    let returnedOrders = 0;
    let totalGrossSales = 0;
    let totalProductDiscount = 0;
    let totalCouponDiscount = 0;
    let totalDiscount = 0;
    let totalDelivery = 0;
    let totalRefunds = 0;
    let totalEstimatedCost = 0;
    let totalNetProfit = 0;

    ordersList.forEach((order) => {
      const metrics = getOrderMetrics(order);
      const statusLower = (order.orderStatus || "").toLowerCase();

      totalGrossSales += metrics.grossItemTotal + metrics.deliveryCharge;
      totalProductDiscount += metrics.productDiscount;
      totalCouponDiscount += metrics.couponDiscount;
      totalDiscount += metrics.totalDiscount;
      totalDelivery += metrics.deliveryCharge;

      if (metrics.isCancelled) {
        cancelledOrders++;
        totalRefunds += metrics.finalPaid;
      } else {
        totalRevenue += metrics.finalPaid;
        totalEstimatedCost += metrics.estimatedCost;
        totalNetProfit += metrics.netProfit;

        if (statusLower === "delivered" || statusLower === "completed") {
          completedOrders++;
        } else {
          pendingOrders++;
        }

        if (metrics.isReturned) {
          returnedOrders++;
        }
      }
    });

    const activeOrderCount = totalOrders - cancelledOrders;
    const overallMargin =
      totalRevenue > 0
        ? Number(((totalNetProfit / totalRevenue) * 100).toFixed(1))
        : 0;
    const averageOrderValue =
      activeOrderCount > 0 ? Math.round(totalRevenue / activeOrderCount) : 0;

    setStats({
      totalRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      returnedOrders,
      totalGrossSales,
      totalProductDiscount,
      totalCouponDiscount,
      totalDiscount,
      totalDelivery,
      totalRefunds,
      totalEstimatedCost,
      totalNetProfit,
      overallMargin,
      averageOrderValue,
    });
  };

  // Helper: calculate financial ledger data with Credits and Debits
  const calculateLedgerData = (ordersList) => {
    if (!ordersList || ordersList.length === 0) {
      setLedgerData({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        recentTransactions: [],
      });
      return;
    }

    let totalCredit = 0;
    let totalDebit = 0;
    const transactions = [];

    ordersList.forEach((order) => {
      const metrics = getOrderMetrics(order);
      const shortId = String(order.orderId).slice(-8);

      if (metrics.isCancelled) {
        // Cancelled order is recorded as a refund debit
        totalDebit += metrics.finalPaid;
        transactions.push({
          id: `REF-${shortId}`,
          orderId: order.orderId,
          date: order.createdAt,
          type: "DEBIT",
          category: "Cancellation Refund",
          amount: metrics.finalPaid,
          description: `Order #${shortId} Cancelled - Refund Processed`,
          status: "Processed",
          paymentMethod: order.payment?.method?.toUpperCase() || "COD",
        });
      } else {
        // Realized sale credit
        totalCredit += metrics.finalPaid;
        transactions.push({
          id: `ORD-${shortId}`,
          orderId: order.orderId,
          date: order.createdAt,
          type: "CREDIT",
          category: "Order Revenue",
          amount: metrics.finalPaid,
          description: `Order #${shortId} - ${order.customer?.name || order.customer?.email || "Customer"}`,
          status: order.orderStatus,
          paymentMethod: order.payment?.method?.toUpperCase() || "COD",
        });

        // Estimated cost of goods debit
        if (metrics.estimatedCost > 0) {
          totalDebit += metrics.estimatedCost;
          transactions.push({
            id: `COGS-${shortId}`,
            orderId: order.orderId,
            date: order.createdAt,
            type: "DEBIT",
            category: "Cost of Goods (COGS)",
            amount: metrics.estimatedCost,
            description: `Stock / Wholesale Cost for Order #${shortId}`,
            status: "Completed",
            paymentMethod: "Internal",
          });
        }
      }
    });

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    setLedgerData({
      totalRevenue: totalCredit,
      totalExpenses: totalDebit,
      netProfit: totalCredit - totalDebit,
      recentTransactions: transactions,
    });
  };

  // Fetch orders on mount
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/checkout/get-all-order-product"
      );
      if (response.data?.orders) {
        const fetched = response.data.orders;
        setAllOrders(fetched);
        const filtered = filterOrdersByDate(fetched, filterType, customDates);
        setOrders(filtered);
        calculateStats(filtered);
        calculateLedgerData(filtered);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders reactively whenever filterType or customDates changes
  useEffect(() => {
    if (allOrders.length > 0) {
      const filtered = filterOrdersByDate(allOrders, filterType, customDates);
      setOrders(filtered);
      calculateStats(filtered);
      calculateLedgerData(filtered);
      setOrderPage(0);
      setLedgerPage(0);
    }
  }, [filterType, customDates, allOrders]);

  // Chart data sync
  useEffect(() => {
    if (!orders.length) {
      setChartData([]);
      return;
    }

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
      default:
        filteredOrders = orders;
    }

    setChartData(filteredOrders);
  }, [chartFilter, orders]);

  // Fetch ancillary data
  useEffect(() => {
    const fetchData = async () => {
      try {
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
      }
    };

    fetchData();
  }, []);

  // Authentication check
  useEffect(() => {
    const admin_logged = localStorage.getItem("admin-logged");
    if (admin_logged) {
      router.push("/admin/dashboard/dashboard");
    } else {
      router.push("/admin/authentication/login");
    }
  }, []);

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
    } finally {
      setOpenLogoutDialog(false);
    }
  };

  const handleCancelLogout = () => {
    setOpenLogoutDialog(false);
  };

  const paginatedOrders = useMemo(() => {
    return orders.slice(
      orderPage * rowsPerPage,
      (orderPage + 1) * rowsPerPage
    );
  }, [orders, orderPage, rowsPerPage]);

  const paginatedLedgerTransactions = useMemo(() => {
    return ledgerData.recentTransactions.slice(
      ledgerPage * rowsPerPage,
      (ledgerPage + 1) * rowsPerPage
    );
  }, [ledgerData.recentTransactions, ledgerPage, rowsPerPage]);

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

  // Professional PDF Export Generator
  const generatePDF = (type = "sales") => {
    const isLedger = type === "ledger";
    const doc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Dark corporate header
    doc.setFillColor(18, 19, 23);
    doc.rect(0, 0, pageWidth, 28, "F");

    // Brand & Title
    doc.setFontSize(18);
    doc.setTextColor(255, 152, 0); // Orange
    doc.setFont("helvetica", "bold");
    doc.text("TREND TROVE", 14, 12);

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.text(
      isLedger
        ? "Financial Ledger & Cash Flow Statement"
        : "Executive Order Summary & Financial Performance Report",
      14,
      20
    );

    // Meta details on right
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    const dateStr = new Date().toLocaleString("en-IN");
    doc.text(`Generated: ${dateStr}`, pageWidth - 14, 12, { align: "right" });
    const periodLabel =
      filterType === "custom" && customDates.startDate
        ? `Custom: ${customDates.startDate} to ${customDates.endDate || "today"}`
        : filterType.toUpperCase();
    doc.text(`Period: ${periodLabel}`, pageWidth - 14, 20, { align: "right" });

    if (isLedger) {
      // Ledger Financial KPI Summary
      doc.autoTable({
        startY: 34,
        head: [["Financial Ledger Metric", "Value (INR)", "Operational Notes", "Status"]],
        body: [
          [
            "Total Inflow (Realized Sales)",
            `Rs. ${ledgerData.totalRevenue.toLocaleString("en-IN")}`,
            "Gross collections from customer orders",
            "CREDIT",
          ],
          [
            "Total Outflow (Debits & Costs)",
            `Rs. ${ledgerData.totalExpenses.toLocaleString("en-IN")}`,
            "Customer refunds, cancellations & estimated stock costs",
            "DEBIT",
          ],
          [
            "Net Ledger Profit / Balance",
            `Rs. ${ledgerData.netProfit.toLocaleString("en-IN")}`,
            "Net realized financial standing for period",
            ledgerData.netProfit >= 0 ? "PROFIT" : "DEFICIT",
          ],
          [
            "Total Recorded Transactions",
            `${ledgerData.recentTransactions.length} entries`,
            "Detailed credit and debit items recorded below",
            "ACTIVE",
          ],
        ],
        theme: "striped",
        headStyles: {
          fillColor: [255, 152, 0],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 9, cellPadding: 2.5 },
      });

      // Detailed Ledger Transactions Table
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 8,
        head: [
          [
            "Date",
            "Txn / Order ID",
            "Description",
            "Category",
            "Type",
            "Amount",
            "Payment Method",
            "Status",
          ],
        ],
        body: ledgerData.recentTransactions.map((t) => [
          new Date(t.date).toLocaleDateString("en-IN"),
          String(t.id),
          t.description,
          t.category || "General",
          t.type,
          `Rs. ${Number(t.amount).toLocaleString("en-IN")}`,
          t.paymentMethod || "N/A",
          t.status,
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [30, 31, 35],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          2: { cellWidth: 70 },
          4: { fontStyle: "bold" },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 4) {
            if (data.cell.raw === "CREDIT") {
              data.cell.styles.textColor = [46, 125, 50]; // Green
            } else if (data.cell.raw === "DEBIT") {
              data.cell.styles.textColor = [211, 47, 47]; // Red
            }
          }
        },
      });
    } else {
      // Executive Sales & Financial KPI Summary Table
      doc.autoTable({
        startY: 34,
        head: [["Financial & Order Metric", "Value (INR / Count)", "Performance Metric", "Value (INR / Count)"]],
        body: [
          [
            "Gross Merchandise Value (MRP)",
            `Rs. ${stats.totalGrossSales.toLocaleString("en-IN")}`,
            "Total Orders Received",
            `${stats.totalOrders} orders`,
          ],
          [
            "Catalog Product Markdowns",
            `Rs. ${stats.totalProductDiscount.toLocaleString("en-IN")}`,
            "Completed / Delivered Orders",
            `${stats.completedOrders} orders`,
          ],
          [
            "Coupon Discounts Applied",
            `Rs. ${stats.totalCouponDiscount.toLocaleString("en-IN")}`,
            "Pending / In-Transit Orders",
            `${stats.pendingOrders} orders`,
          ],
          [
            "Total Discounts Absorbed",
            `Rs. ${stats.totalDiscount.toLocaleString("en-IN")}`,
            "Cancelled Orders (Refunds)",
            `${stats.cancelledOrders} (Rs. ${stats.totalRefunds.toLocaleString("en-IN")})`,
          ],
          [
            "Delivery Charges Collected",
            `Rs. ${stats.totalDelivery.toLocaleString("en-IN")}`,
            "Returned Orders",
            `${stats.returnedOrders} orders`,
          ],
          [
            "Net Realized Revenue",
            `Rs. ${stats.totalRevenue.toLocaleString("en-IN")}`,
            "Average Order Value (AOV)",
            `Rs. ${stats.averageOrderValue.toLocaleString("en-IN")}`,
          ],
          [
            "Estimated Stock Cost (COGS)",
            `Rs. ${stats.totalEstimatedCost.toLocaleString("en-IN")}`,
            "Net Profit (Margin %)",
            `Rs. ${stats.totalNetProfit.toLocaleString("en-IN")} (${stats.overallMargin}%)`,
          ],
        ],
        theme: "striped",
        headStyles: {
          fillColor: [255, 152, 0],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 8.5, cellPadding: 2.2 },
      });

      // Detailed Orders Line-by-Line Breakdown Table
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 8,
        head: [
          [
            "Order ID",
            "Date",
            "Customer",
            "Items & Qty",
            "Base MRP",
            "Discount",
            "Delivery",
            "Net Paid",
            "Payment",
            "Status",
            "Est. Profit",
          ],
        ],
        body: orders.map((order) => {
          const metrics = getOrderMetrics(order);
          const itemsSummary = (order.items || [])
            .map(
              (item) =>
                `${item.productName || "Item"} (${item.size || "-"}) x${item.quantity || 1}`
            )
            .join("\n");
          return [
            String(order.orderId).slice(-8),
            new Date(order.createdAt).toLocaleDateString("en-IN"),
            `${order.customer?.name || "Customer"}\n${order.customer?.email || ""}`,
            itemsSummary,
            `Rs. ${metrics.grossItemTotal.toLocaleString("en-IN")}`,
            metrics.totalDiscount > 0
              ? `-Rs. ${metrics.totalDiscount.toLocaleString("en-IN")}`
              : "Rs. 0",
            `Rs. ${metrics.deliveryCharge}`,
            `Rs. ${metrics.finalPaid.toLocaleString("en-IN")}`,
            `${order.payment?.method?.toUpperCase() || "COD"}\n(${order.payment?.status || "pending"})`,
            order.orderStatus,
            metrics.isCancelled
              ? "Rs. 0 (Cancelled)"
              : `+Rs. ${metrics.netProfit.toLocaleString("en-IN")}\n(${metrics.profitMargin}%)`,
          ];
        }),
        theme: "grid",
        headStyles: {
          fillColor: [30, 31, 35],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 7.5, cellPadding: 2, overflow: "linebreak" },
        columnStyles: {
          2: { cellWidth: 35 },
          3: { cellWidth: 55 },
          10: { fontStyle: "bold" },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 10) {
            if (data.cell.raw && String(data.cell.raw).startsWith("+")) {
              data.cell.styles.textColor = [46, 125, 50]; // Green
            } else if (
              data.cell.raw &&
              String(data.cell.raw).includes("Cancelled")
            ) {
              data.cell.styles.textColor = [158, 158, 158]; // Grey
            }
          }
        },
      });
    }

    // Confidentiality footer and page numbering
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Trend Trove Confidential Management Report | Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 6,
        { align: "center" }
      );
    }

    const fileName = isLedger
      ? `trend_trove_financial_ledger_${new Date().toISOString().split("T")[0]}.pdf`
      : `trend_trove_order_summary_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  };

  // Professional Excel Export Generator
  const exportToExcel = (target = "sales") => {
    const isLedger = target === "ledger" || Array.isArray(target);
    const workbook = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().split("T")[0];

    if (isLedger) {
      const summaryRows = [
        { "Metric": "Report Period", "Value": filterType.toUpperCase() },
        { "Metric": "Generated Date", "Value": new Date().toLocaleString("en-IN") },
        { "Metric": "Total Inflow (Credits / Sales)", "Value": ledgerData.totalRevenue },
        { "Metric": "Total Outflow (Debits & Costs)", "Value": ledgerData.totalExpenses },
        { "Metric": "Net Financial Profit / Balance", "Value": ledgerData.netProfit },
        { "Metric": "Total Recorded Transactions", "Value": ledgerData.recentTransactions.length },
      ];

      const ledgerRows = ledgerData.recentTransactions.map((t) => ({
        "Date": new Date(t.date).toLocaleDateString("en-IN"),
        "Transaction ID": t.id,
        "Order Reference ID": t.orderId || "N/A",
        "Description": t.description,
        "Category": t.category || "General",
        "Entry Type": t.type,
        "Amount (INR)": t.amount,
        "Payment Method": t.paymentMethod,
        "Status": t.status,
      }));

      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      const wsLedger = XLSX.utils.json_to_sheet(ledgerRows);

      XLSX.utils.book_append_sheet(workbook, wsSummary, "Ledger KPI Summary");
      XLSX.utils.book_append_sheet(workbook, wsLedger, "Transaction Details");

      XLSX.writeFile(workbook, `trend_trove_financial_ledger_${dateStr}.xlsx`);
    } else {
      // Sales / Order Summary Excel Export
      const summaryRows = [
        { "Key Performance Indicator": "Report Period", "Value": filterType.toUpperCase() },
        { "Key Performance Indicator": "Generated On", "Value": new Date().toLocaleString("en-IN") },
        { "Key Performance Indicator": "Total Orders Placed", "Value": stats.totalOrders },
        { "Key Performance Indicator": "Completed / Delivered Orders", "Value": stats.completedOrders },
        { "Key Performance Indicator": "Pending / In-Transit Orders", "Value": stats.pendingOrders },
        { "Key Performance Indicator": "Cancelled Orders", "Value": stats.cancelledOrders },
        { "Key Performance Indicator": "Returned Orders", "Value": stats.returnedOrders },
        { "Key Performance Indicator": "Gross Merchandise Value (MRP)", "Value": stats.totalGrossSales },
        { "Key Performance Indicator": "Catalog Product Discounts", "Value": stats.totalProductDiscount },
        { "Key Performance Indicator": "Coupon Discounts Applied", "Value": stats.totalCouponDiscount },
        { "Key Performance Indicator": "Total Discounts Absorbed", "Value": stats.totalDiscount },
        { "Key Performance Indicator": "Delivery Charges Collected", "Value": stats.totalDelivery },
        { "Key Performance Indicator": "Total Refunds & Cancellations", "Value": stats.totalRefunds },
        { "Key Performance Indicator": "Net Realized Revenue", "Value": stats.totalRevenue },
        { "Key Performance Indicator": "Estimated Stock Cost (COGS)", "Value": stats.totalEstimatedCost },
        { "Key Performance Indicator": "Net Business Profit", "Value": stats.totalNetProfit },
        { "Key Performance Indicator": "Net Profit Margin (%)", "Value": `${stats.overallMargin}%` },
        { "Key Performance Indicator": "Average Order Value (AOV)", "Value": stats.averageOrderValue },
      ];

      const orderRows = orders.map((order) => {
        const metrics = getOrderMetrics(order);
        const itemNames = (order.items || [])
          .map(
            (i) =>
              `${i.productName || "Item"} (${i.size || "-"}) x${i.quantity || 1} [@Rs.${i.finalPrice || i.price}]`
          )
          .join("; ");
        const totalQty = (order.items || []).reduce(
          (q, it) => q + (it.quantity || 1),
          0
        );

        return {
          "Order ID": String(order.orderId),
          "Order Date": new Date(order.createdAt).toLocaleString("en-IN"),
          "Customer Name": order.customer?.name || "N/A",
          "Customer Email": order.customer?.email || "N/A",
          "Products / Items Summary": itemNames,
          "Total Items Qty": totalQty,
          "Gross Items MRP (INR)": metrics.grossItemTotal,
          "Product Discount (INR)": metrics.productDiscount,
          "Coupon Code": order.couponCode || "None",
          "Coupon Discount (INR)": metrics.couponDiscount,
          "Total Discount (INR)": metrics.totalDiscount,
          "Delivery Charge (INR)": metrics.deliveryCharge,
          "Final Paid (INR)": metrics.finalPaid,
          "Payment Method": (order.payment?.method || "").toUpperCase(),
          "Payment Status": order.payment?.status || "",
          "Order Status": order.orderStatus,
          "Estimated Stock Cost (COGS)": metrics.estimatedCost,
          "Net Profit (INR)": metrics.netProfit,
          "Profit Margin (%)": `${metrics.profitMargin}%`,
        };
      });

      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      const wsOrders = XLSX.utils.json_to_sheet(orderRows);

      XLSX.utils.book_append_sheet(workbook, wsSummary, "KPI Summary");
      XLSX.utils.book_append_sheet(workbook, wsOrders, "Orders Breakdown");

      XLSX.writeFile(workbook, `trend_trove_order_summary_${dateStr}.xlsx`);
    }
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
              {/* Executive Controls Bar: Date Filtering & Exports */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "stretch", md: "center" },
                  gap: 2,
                  mb: 3,
                  p: 2.5,
                  backgroundColor: "#1E1F23",
                  borderRadius: 2.5,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Time Range Selector */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="date-filter-label" sx={{ color: "#B8BBC2" }}>
                      Reporting Period
                    </InputLabel>
                    <Select
                      labelId="date-filter-label"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      label="Reporting Period"
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        color: "#FFFFFF",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(255, 255, 255, 0.15)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#FF9800",
                        },
                        "& .MuiSvgIcon-root": { color: "#FF9800" },
                      }}
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="last7days">Last 7 Days</MenuItem>
                      <MenuItem value="last30days">Last 30 Days</MenuItem>
                      <MenuItem value="thisMonth">This Month</MenuItem>
                      <MenuItem value="thisYear">This Year</MenuItem>
                      <MenuItem value="custom">Custom Date Range</MenuItem>
                    </Select>
                  </FormControl>

                  {filterType === "custom" && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <TextField
                        size="small"
                        type="date"
                        label="From"
                        InputLabelProps={{ shrink: true, sx: { color: "#B8BBC2" } }}
                        value={customDates.startDate}
                        onChange={(e) =>
                          setCustomDates((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        sx={{
                          width: 155,
                          backgroundColor: "rgba(255,255,255,0.05)",
                          input: { color: "#FFFFFF" },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.15)",
                          },
                        }}
                      />
                      <TextField
                        size="small"
                        type="date"
                        label="To"
                        InputLabelProps={{ shrink: true, sx: { color: "#B8BBC2" } }}
                        value={customDates.endDate}
                        onChange={(e) =>
                          setCustomDates((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        sx={{
                          width: 155,
                          backgroundColor: "rgba(255,255,255,0.05)",
                          input: { color: "#FFFFFF" },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.15)",
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>

                {/* Report Download & Logout Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<PictureAsPdf />}
                    onClick={() => generatePDF("sales")}
                    sx={{
                      backgroundColor: "#FF9800",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      textTransform: "none",
                      px: 2,
                      "&:hover": { backgroundColor: "#F57C00" },
                    }}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<TableChart />}
                    onClick={() => exportToExcel("sales")}
                    sx={{
                      backgroundColor: "#2E7D32",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      textTransform: "none",
                      px: 2,
                      "&:hover": { backgroundColor: "#1B5E20" },
                    }}
                  >
                    Export Excel
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outlined"
                    sx={{
                      borderColor: "rgba(244, 67, 54, 0.5)",
                      color: "#F44336",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#F44336",
                        backgroundColor: "rgba(244, 67, 54, 0.1)",
                      },
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Box>

              {/* Comprehensive Financial & Operational KPI Cards */}
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <RevenueCard
                    title="Net Realized Revenue"
                    amount={stats.totalRevenue}
                    percent={stats.totalOrders > 0 ? `${stats.totalOrders} total orders` : null}
                    icon={AttachMoney}
                    color="#4CAF50"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <RevenueCard
                    title="Net Profit"
                    amount={stats.totalNetProfit}
                    percent={`${stats.overallMargin}% margin`}
                    icon={TrendingUp}
                    color="#00B0FF"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <RevenueCard
                    title="Total Orders"
                    amount={stats.totalOrders}
                    percent={`${stats.completedOrders} delivered | ${stats.pendingOrders} pending`}
                    icon={ShoppingBag}
                    color="#7C4DFF"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <RevenueCard
                    title="Total Discounts"
                    amount={stats.totalDiscount}
                    percent={`MRP Offers + Coupons`}
                    icon={LocalOffer}
                    color="#FF9800"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <RevenueCard
                    title="Gross Sales (MRP)"
                    amount={stats.totalGrossSales}
                    icon={ReceiptLong}
                    color="#3F51B5"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <RevenueCard
                    title="Est. Stock Cost (COGS)"
                    amount={stats.totalEstimatedCost}
                    icon={Inventory}
                    color="#607D8B"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <RevenueCard
                    title="Refunds & Cancelled"
                    amount={stats.totalRefunds}
                    percent={`${stats.cancelledOrders} cancelled`}
                    icon={Cancel}
                    color="#F44336"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <RevenueCard
                    title="Delivery Charges"
                    amount={stats.totalDelivery}
                    icon={LocalShipping}
                    color="#009688"
                  />
                </Grid>
              </Grid>

              {/* Sales Overview Chart */}
              <Card sx={{ mb: 3, backgroundColor: "#1E1F23", border: "1px solid rgba(255,255,255,0.08)" }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                      Sales Overview & Revenue Trends
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <Select
                        value={chartFilter}
                        onChange={(e) => setChartFilter(e.target.value)}
                        sx={{
                          color: "white",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.2)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FF9800",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FF9800",
                          },
                          "& .MuiSvgIcon-root": {
                            color: "#FF9800",
                          },
                        }}
                      >
                        <MenuItem value="daily">Today (Hourly)</MenuItem>
                        <MenuItem value="weekly">Last 7 Days</MenuItem>
                        <MenuItem value="monthly">This Year</MenuItem>
                        <MenuItem value="yearly">All Time</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <DashLineChart data={chartData} />
                </CardContent>
              </Card>

              {/* Comprehensive Order & Financial Summary Table */}
              <Card sx={{ backgroundColor: "#1E1F23", border: "1px solid rgba(255,255,255,0.08)", mb: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1.5,
                      mb: 2.5,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                        Executive Order & Financial Summary
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#B8BBC2" }}>
                        Showing {orders.length} orders for period: {filterType.toUpperCase()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<PictureAsPdf />}
                        onClick={() => generatePDF("sales")}
                        variant="outlined"
                        sx={{
                          color: "#FF9800",
                          borderColor: "rgba(255,152,0,0.5)",
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": {
                            borderColor: "#FF9800",
                            backgroundColor: "rgba(255,152,0,0.08)",
                          },
                        }}
                      >
                        PDF Report
                      </Button>
                      <Button
                        size="small"
                        startIcon={<TableChart />}
                        onClick={() => exportToExcel("sales")}
                        variant="outlined"
                        sx={{
                          color: "#4CAF50",
                          borderColor: "rgba(76,175,80,0.5)",
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": {
                            borderColor: "#4CAF50",
                            backgroundColor: "rgba(76,175,80,0.08)",
                          },
                        }}
                      >
                        Excel Report
                      </Button>
                    </Box>
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700 }}>Order ID</TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700 }}>Date</TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700 }}>Customer</TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700 }}>Items</TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700 }}>Base MRP</TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700 }}>Discount</TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700 }}>Delivery</TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700 }}>Final Paid</TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700 }}>Profit</TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700 }}>Payment</TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: 700, textAlign: "center" }}>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={12} sx={{ textAlign: "center", py: 4, color: "#888" }}>
                              No orders found for the selected time period.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedOrders.map((order) => {
                            const metrics = getOrderMetrics(order);
                            return (
                              <TableRow
                                key={order.orderId}
                                hover
                                sx={{
                                  "&:hover": { backgroundColor: "rgba(255,255,255,0.03)" },
                                  opacity: metrics.isCancelled ? 0.65 : 1,
                                }}
                              >
                                <TableCell sx={{ color: "white", fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 600 }}>
                                  #{String(order.orderId).slice(-8)}
                                </TableCell>
                                <TableCell sx={{ color: "#B8BBC2", fontSize: "0.85rem" }}>
                                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                </TableCell>
                                <TableCell sx={{ color: "white" }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                    {order.customer?.name || "Customer"}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#888", display: "block" }}>
                                    {order.customer?.email || "N/A"}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ color: "#DDD", maxWidth: 170 }}>
                                  {(order.items || []).map((item, idx) => (
                                    <Typography
                                      key={item.itemId || idx}
                                      variant="caption"
                                      sx={{
                                        display: "block",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      • {item.productName || "Item"} ({item.size || "-"}) x{item.quantity || 1}
                                    </Typography>
                                  ))}
                                </TableCell>
                                <TableCell sx={{ color: "#AAA", fontSize: "0.85rem" }}>
                                  ₹{metrics.grossItemTotal.toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell sx={{ color: metrics.totalDiscount > 0 ? "#FF9800" : "#777", fontSize: "0.85rem" }}>
                                  {metrics.totalDiscount > 0
                                    ? `-₹${metrics.totalDiscount.toLocaleString("en-IN")}`
                                    : "₹0"}
                                </TableCell>
                                <TableCell sx={{ color: "#AAA", fontSize: "0.85rem" }}>
                                  {metrics.deliveryCharge > 0 ? `₹${metrics.deliveryCharge}` : "Free"}
                                </TableCell>
                                <TableCell sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.9rem" }}>
                                  ₹{metrics.finalPaid.toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell>
                                  {metrics.isCancelled ? (
                                    <Chip
                                      label="₹0 (Cancelled)"
                                      size="small"
                                      sx={{
                                        backgroundColor: "rgba(244,67,54,0.15)",
                                        color: "#F44336",
                                        fontSize: "0.75rem",
                                      }}
                                    />
                                  ) : (
                                    <Box>
                                      <Typography variant="caption" sx={{ color: "#4CAF50", fontWeight: 700, display: "block" }}>
                                        +₹{metrics.netProfit.toLocaleString("en-IN")}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: "#81C784", fontSize: "0.7rem" }}>
                                        ({metrics.profitMargin}%)
                                      </Typography>
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={order.payment?.method?.toUpperCase() || "COD"}
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        order.payment?.method === "online"
                                          ? "rgba(33, 150, 243, 0.2)"
                                          : order.payment?.method === "wallet"
                                          ? "rgba(156, 39, 176, 0.2)"
                                          : "rgba(255, 152, 0, 0.2)",
                                      color:
                                        order.payment?.method === "online"
                                          ? "#2196F3"
                                          : order.payment?.method === "wallet"
                                          ? "#BA68C8"
                                          : "#FF9800",
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={order.orderStatus}
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        order.orderStatus === "Delivered"
                                          ? "rgba(76, 175, 80, 0.2)"
                                          : order.orderStatus === "Cancelled"
                                          ? "rgba(244, 67, 54, 0.2)"
                                          : order.orderStatus === "Returned"
                                          ? "rgba(156, 39, 176, 0.2)"
                                          : "rgba(255, 152, 0, 0.2)",
                                      color:
                                        order.orderStatus === "Delivered"
                                          ? "#4CAF50"
                                          : order.orderStatus === "Cancelled"
                                          ? "#F44336"
                                          : order.orderStatus === "Returned"
                                          ? "#BA68C8"
                                          : "#FF9800",
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                  <Tooltip title="View Order & Profit Details">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedOrderForDetail(order);
                                        setOrderDetailOpen(true);
                                      }}
                                      sx={{
                                        color: "#FF9800",
                                        "&:hover": { backgroundColor: "rgba(255, 152, 0, 0.12)" },
                                      }}
                                    >
                                      <Visibility fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Orders Table Pagination */}
                  <TablePagination
                    component="div"
                    count={orders.length}
                    page={orderPage}
                    onPageChange={handleOrderPageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{
                      color: "white",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      mt: 1,
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
                </CardContent>
              </Card>
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
                      onClick={() => exportToExcel("ledger")}
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

      {/* Detailed Order & Financial Breakdown Modal Dialog */}
      <Dialog
        open={orderDetailOpen}
        onClose={() => setOrderDetailOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#1E1F23",
            color: "#FFFFFF",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        {selectedOrderForDetail && (() => {
          const metrics = getOrderMetrics(selectedOrderForDetail);
          const shipping = selectedOrderForDetail.shippingAddress;
          return (
            <>
              <DialogTitle sx={{ pb: 1, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#FF9800" }}>
                      Order #{String(selectedOrderForDetail.orderId).slice(-8)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#B8BBC2" }}>
                      Placed on {new Date(selectedOrderForDetail.createdAt).toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip
                      label={selectedOrderForDetail.orderStatus}
                      size="small"
                      sx={{
                        backgroundColor:
                          selectedOrderForDetail.orderStatus === "Delivered"
                            ? "rgba(76, 175, 80, 0.2)"
                            : selectedOrderForDetail.orderStatus === "Cancelled"
                            ? "rgba(244, 67, 54, 0.2)"
                            : "rgba(255, 152, 0, 0.2)",
                        color:
                          selectedOrderForDetail.orderStatus === "Delivered"
                            ? "#4CAF50"
                            : selectedOrderForDetail.orderStatus === "Cancelled"
                            ? "#F44336"
                            : "#FF9800",
                        fontWeight: 700,
                      }}
                    />
                    <IconButton size="small" onClick={() => setOrderDetailOpen(false)} sx={{ color: "#AAA" }}>
                      <Close />
                    </IconButton>
                  </Box>
                </Box>
              </DialogTitle>

              <DialogContent sx={{ mt: 2 }}>
                {/* Customer & Payment Meta */}
                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)", height: "100%" }}>
                      <Typography variant="subtitle2" sx={{ color: "#FF9800", fontWeight: 700, mb: 1 }}>
                        Customer & Shipping Details
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedOrderForDetail.customer?.name || "Customer"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#B8BBC2", display: "block" }}>
                        {selectedOrderForDetail.customer?.email || "N/A"}
                      </Typography>
                      {shipping && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <Typography variant="caption" sx={{ color: "#DDD", display: "block" }}>
                            {shipping.fullName} ({shipping.mobileNumber})
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#AAA", display: "block" }}>
                            {shipping.address}, {shipping.city}, {shipping.state} - {shipping.pincode}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)", height: "100%" }}>
                      <Typography variant="subtitle2" sx={{ color: "#FF9800", fontWeight: 700, mb: 1 }}>
                        Payment & Fulfillment
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#AAA", display: "block" }}>
                        Payment Method:{" "}
                        <strong style={{ color: "#FFF" }}>
                          {selectedOrderForDetail.payment?.method?.toUpperCase() || "COD"}
                        </strong>
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#AAA", display: "block" }}>
                        Payment Status:{" "}
                        <strong style={{ color: selectedOrderForDetail.payment?.status === "completed" ? "#4CAF50" : "#FF9800" }}>
                          {selectedOrderForDetail.payment?.status || "pending"}
                        </strong>
                      </Typography>
                      {selectedOrderForDetail.payment?.transactionId && (
                        <Typography variant="caption" sx={{ color: "#AAA", display: "block" }}>
                          Txn ID: {selectedOrderForDetail.payment.transactionId}
                        </Typography>
                      )}
                      {selectedOrderForDetail.orderReason && (
                        <Typography variant="caption" sx={{ color: "#F44336", display: "block", mt: 0.5 }}>
                          Reason: {selectedOrderForDetail.orderReason}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Items Ordered */}
                <Typography variant="subtitle2" sx={{ color: "#FF9800", fontWeight: 700, mb: 1 }}>
                  Items in this Order ({selectedOrderForDetail.items?.length || 0})
                </Typography>
                <TableContainer component={Paper} sx={{ backgroundColor: "rgba(255,255,255,0.02)", mb: 2.5, borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                        <TableCell sx={{ color: "#B8BBC2", fontWeight: 600 }}>Product</TableCell>
                        <TableCell sx={{ color: "#B8BBC2", fontWeight: 600 }}>Size/Color</TableCell>
                        <TableCell sx={{ color: "#B8BBC2", fontWeight: 600 }}>Qty</TableCell>
                        <TableCell sx={{ color: "#B8BBC2", fontWeight: 600 }}>Base MRP</TableCell>
                        <TableCell sx={{ color: "#B8BBC2", fontWeight: 600 }}>Discounted</TableCell>
                        <TableCell sx={{ color: "#B8BBC2", fontWeight: 600 }}>Line Total</TableCell>
                        <TableCell sx={{ color: "#B8BBC2", fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(selectedOrderForDetail.items || []).map((item, idx) => {
                        const basePrice = Number(item.price) || 0;
                        const finalPrice = Number(item.finalPrice || item.price) || 0;
                        const lineTotal = finalPrice * (item.quantity || 1);
                        return (
                          <TableRow key={item.itemId || idx}>
                            <TableCell sx={{ color: "white" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.productName}
                                    style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }}
                                  />
                                )}
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                  {item.productName || "Product"}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ color: "#B8BBC2", fontSize: "0.85rem" }}>
                              {item.size || "-"} {item.color ? `/ ${item.color}` : ""}
                            </TableCell>
                            <TableCell sx={{ color: "white", fontSize: "0.85rem" }}>
                              x{item.quantity || 1}
                            </TableCell>
                            <TableCell sx={{ color: "#888", fontSize: "0.85rem", textDecoration: basePrice > finalPrice ? "line-through" : "none" }}>
                              ₹{basePrice.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell sx={{ color: "#FF9800", fontSize: "0.85rem", fontWeight: 600 }}>
                              ₹{finalPrice.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell sx={{ color: "#4CAF50", fontSize: "0.85rem", fontWeight: 700 }}>
                              ₹{lineTotal.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.status || "Pending"}
                                size="small"
                                sx={{
                                  fontSize: "0.7rem",
                                  backgroundColor:
                                    item.status === "Delivered"
                                      ? "rgba(76, 175, 80, 0.2)"
                                      : item.status === "Cancelled"
                                      ? "rgba(244, 67, 54, 0.2)"
                                      : "rgba(255, 152, 0, 0.2)",
                                  color:
                                    item.status === "Delivered"
                                      ? "#4CAF50"
                                      : item.status === "Cancelled"
                                      ? "#F44336"
                                      : "#FF9800",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Financial Summary Breakdown */}
                <Box sx={{ p: 2, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Typography variant="subtitle2" sx={{ color: "#FF9800", fontWeight: 700, mb: 1.5 }}>
                    Price & Financial Profit/Loss Breakdown
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: "#AAA", display: "block" }}>Gross MRP Subtotal</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#DDD" }}>₹{metrics.grossItemTotal.toLocaleString("en-IN")}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: "#AAA", display: "block" }}>Product Discount</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#FF9800" }}>-₹{metrics.productDiscount.toLocaleString("en-IN")}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: "#AAA", display: "block" }}>
                        Coupon {selectedOrderForDetail.couponCode ? `(${selectedOrderForDetail.couponCode})` : ""}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#FF9800" }}>-₹{metrics.couponDiscount.toLocaleString("en-IN")}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: "#AAA", display: "block" }}>Delivery Charge</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#DDD" }}>₹{metrics.deliveryCharge}</Typography>
                    </Grid>

                    <Grid item xs={12}><Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 0.5 }} /></Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" sx={{ color: "#AAA", display: "block" }}>Net Paid by Customer</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#FFFFFF" }}>₹{metrics.finalPaid.toLocaleString("en-IN")}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" sx={{ color: "#AAA", display: "block" }}>Estimated Wholesale Cost (COGS)</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#B8BBC2" }}>₹{metrics.estimatedCost.toLocaleString("en-IN")}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ color: "#AAA", display: "block" }}>Realized Net Profit</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: metrics.isCancelled ? "#888" : "#4CAF50" }}>
                        {metrics.isCancelled ? "₹0 (Cancelled)" : `+₹${metrics.netProfit.toLocaleString("en-IN")} (${metrics.profitMargin}%)`}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>

              <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <Button onClick={() => setOrderDetailOpen(false)} variant="contained" sx={{ backgroundColor: "#FF9800", "&:hover": { backgroundColor: "#F57C00" }, textTransform: "none", fontWeight: 600 }}>
                  Close
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

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
