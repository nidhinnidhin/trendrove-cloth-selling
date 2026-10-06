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
} from "@mui/material";
import { Add, Delete, Search, Edit as EditIcon } from "@mui/icons-material";
import axiosInstance from "@/utils/adminAxiosInstance";
import axios from "axios";
import AddBanner from "../../modals/addBanner";
import EditBanner from "../../modals/editBanner";

const Banners = () => {
  const [bannersData, setBannersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/banners`);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/banners`);
        setBannersData(response.data);
        setBannersData(response.data);
      } catch (err) {
        setError("Failed to fetch banners data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleBannerUpdated = (updatedBanner) => {
    if (updatedBanner && updatedBanner._id) {
      setBannersData((prevData) =>
        prevData.map((banner) =>
          banner._id === updatedBanner._id ? updatedBanner : banner
        )
      );
    }
  };

  const handleEditModalOpen = (banner) => {
    setSelectedBanner(banner);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedBanner(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteBanner = (bannerId) => {
    setBannerToDelete(bannerId);
    setConfirmationModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/banners/delete/${bannerToDelete}`);
      setBannersData((prevData) =>
        prevData.filter((banner) => banner._id !== bannerToDelete)
      );
      setSnackbarMessage("Banner successfully deleted!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Failed to delete banner.");
      setSnackbarOpen(true);
    }
    setConfirmationModalOpen(false);
  };

  const handleToggleStatus = async (bannerId) => {
    try {
      await axiosInstance.patch(`/banners/toggle/${bannerId}`);
      setBannersData((prevData) =>
        prevData.map((banner) =>
          banner._id === bannerId 
            ? { ...banner, isActive: !banner.isActive } 
            : banner
        )
      );
      setSnackbarMessage("Banner status updated successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Failed to update banner status.");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleConfirmationModalClose = () => setConfirmationModalOpen(false);

  if (loading) {
    return <Box sx={{  }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{  }}>Error: {error}</Box>;
  }

  return (
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
            Banners
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
          Add New Banner
        </Button>
      </Box>

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
                Banner Image
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "transparent",
                  
                  fontWeight: "bold",
                }}
              >
                Title
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "transparent",
                  
                  fontWeight: "bold",
                }}
              >
                Description
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "transparent",
                  
                  fontWeight: "bold",
                }}
              >
                Discount
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
            {bannersData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell sx={{  }}>
                    <img src={banner.image} alt={banner.title} width={100} />
                  </TableCell>
                  <TableCell sx={{  }}>{banner.title}</TableCell>
                  <TableCell sx={{  }}>
                    {banner.description}
                  </TableCell>
                  <TableCell sx={{  }}>
                    {banner.discount}%
                  </TableCell>
                  <TableCell sx={{  }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: banner.isActive ? "#4CAF50" : "#f44336",
                        
                      }}
                      onClick={() => handleToggleStatus(banner._id)}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        sx={{
                          
                          
                        }}
                        onClick={() => handleEditModalOpen(banner)}
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<Delete />}
                        sx={{
                          backgroundColor: "black",
                          
                        }}
                        onClick={() => handleDeleteBanner(banner._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={bannersData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          backgroundColor: "#1E1F23",
          
        }}
      />

      <AddBanner
        open={isModalOpen} 
        handleClose={handleModalClose} 
        onSuccess={(newBanner) => {
          setBannersData([newBanner, ...bannersData]);
          setSnackbarMessage("Banner added successfully!");
          setSnackbarOpen(true);
        }}
      />
      
      <EditBanner
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        banner={selectedBanner}
        handleBannerUpdated={handleBannerUpdated}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success"
          sx={{ backgroundColor: "#1E1F23",  }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmationModalOpen}
        onClose={handleConfirmationModalClose}
        PaperProps={{
          sx: {
            backgroundColor: "#1E1F23",
            
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this banner?
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleConfirmationModalClose} 
            sx={{  }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            sx={{  }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Banners;
