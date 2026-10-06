import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Paper,
  Box,
  TablePagination,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip, // Import Chip component for status
} from "@mui/material";
import {
  Add,
  Block,
  Search,
  Edit as EditIcon,
  Delete,
} from "@mui/icons-material"; // Import Delete icon
import axios from "axios";
import axiosInstance from "@/utils/adminAxiosInstance";
import AddCoupon from "../../modals/addCoupon";
import EditCouponModal from "../../modals/editCouponModal";

const Coupons = () => {
  const [couponsData, setCouponsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [search, setSearch] = useState("");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          "/coupon/get",
          {
            params: { page: page + 1, limit: rowsPerPage, search },
          }
        );

        if (response.data && response.data.coupons) {
          setCouponsData(response.data.coupons);
        } else {
          setError("Invalid coupons data format");
        }
      } catch (err) {
        setError("Failed to fetch coupons data");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [page, rowsPerPage, search]);

  const handleCouponAdded = (newCoupon) => {
    if (newCoupon && newCoupon._id) {
      setCouponsData((prevData) => [newCoupon, ...prevData]);
    } else {
      console.error("Invalid new coupon:", newCoupon);
    }
  };

  const handleCouponUpdated = (updatedCoupon) => {
    if (updatedCoupon && updatedCoupon._id) {
      setCouponsData((prevData) =>
        prevData.map((coupon) =>
          coupon._id === updatedCoupon._id ? updatedCoupon : coupon
        )
      );
    } else {
      console.error("Invalid updated coupon:", updatedCoupon);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleEditModalOpen = (coupon) => {
    if (coupon && coupon._id) {
      setSelectedCoupon(coupon);
      setIsEditModalOpen(true);
    } else {
      console.error("Invalid coupon selected:", coupon);
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedCoupon(null);
  };

  const handleDeleteCoupon = (couponId) => {
    setCouponToDelete(couponId);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;

    try {
      const response = await axiosInstance.delete(`/coupon/delete/${couponToDelete}`);
      if (response.status === 200) {
        setCouponsData((prevData) =>
          prevData.filter((coupon) => coupon._id !== couponToDelete)
        );
        setSnackbarMessage(response.data.message);
        setSnackbarOpen(true);
        setIsConfirmationModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      setSnackbarMessage("Failed to delete coupon.");
      setSnackbarOpen(true);
      setIsConfirmationModalOpen(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleConfirmationModalClose = () => setIsConfirmationModalOpen(false);

  return (
    <>
      <Box sx={{ padding: 3, backgroundColor: "transparent" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#1E1F23",
            borderRadius: 2,
            padding: 2,
            marginBottom: 2,
          }}
        >
          <Box>
            <Box
              component="span"
              sx={{ fontSize: "20px", fontWeight: "bold",  }}
            >
              Coupons
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              
              
              "&:hover": {  },
              border: "1px solid #FF9800",
            }}
            onClick={handleModalOpen}
          >
            Add New Coupon
          </Button>
          <Box>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)} // Update search state
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <Search sx={{  }} />
                  </IconButton>
                ),
              }}
              sx={{
                backgroundColor: "#2C2D33",
                
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  
                  "& fieldset": {
                    borderColor: "#FF9800",
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            padding: 2,
            backgroundColor: "#1E1F23",
            borderRadius: 3,
          }}
        >
          <Table sx={{ width: "100%", backgroundColor: "#2C2D33" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: "transparent",
                    
                    fontWeight: "bold",
                  }}
                >
                  Coupon Code
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "transparent",
                    
                    fontWeight: "bold",
                  }}
                >
                  Discount Type
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "transparent",
                    
                    fontWeight: "bold",
                  }}
                >
                  Created At
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "transparent",
                    
                    fontWeight: "bold",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "transparent",
                    
                    fontWeight: "bold",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {couponsData.map((coupon) => (
                <TableRow
                  key={coupon._id}
                  sx={{
                    opacity: coupon.isExpired ? 0.5 : 1,
                  }}
                >
                  <TableCell sx={{  }}>
                    {coupon.couponCode}
                  </TableCell>
                  <TableCell sx={{  }}>
                    {coupon.discountType}
                  </TableCell>
                  <TableCell sx={{  }}>
                    {new Date(coupon.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={coupon.isExpired ? "Inactive" : "Active"}
                      color={coupon.isExpired ? "error" : "success"}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      sx={{
                        
                        
                        margin: "0px 10px",
                      }}
                      onClick={() => handleEditModalOpen(coupon)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Delete />}
                      sx={{ backgroundColor: "red",  }}
                      onClick={() => handleDeleteCoupon(coupon._id)}
                    >
                      Delete Coupon
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={couponsData.length} // Adjust to actual count
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            backgroundColor: "#1E1F23",
            
          }}
        />
      </Box>

      {/* Modals */}
      <AddCoupon
        open={isModalOpen}
        handleClose={handleModalClose}
        handleCouponAdded={handleCouponAdded}
      />

      <EditCouponModal
        open={isEditModalOpen}
        handleClose={handleEditModalClose} // Ensure consistency
        coupon={selectedCoupon}
        handleCouponUpdated={handleCouponUpdated}
      />

      {/* Confirmation Modal */}
      <Dialog
        open={isConfirmationModalOpen}
        onClose={handleConfirmationModalClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this coupon?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmationModalClose}
            sx={{  }}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} sx={{  }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Coupons;
