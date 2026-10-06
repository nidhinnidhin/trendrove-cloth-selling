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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Add,
  Search,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,

} from "@mui/icons-material";
import axiosInstance from "@/utils/adminAxiosInstance";
import AddOfferModal from "../../modals/addOffer";
import EditOfferModal from "../../modals/editOffer";

const Offers = () => {
  const [offersData, setOffersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [offerToReset, setOfferToReset] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [page, rowsPerPage, search]);

  const handleResetOffer = async (offerId) => {
    setOfferToReset(offerId);
    setResetConfirmOpen(true);
  };

  const handleConfirmReset = async () => {
    if (!offerToReset) return;

    try {
      await axiosInstance.post(`/offer/reset/${offerToReset}`);
      setOffersData((prevOffers) =>
        prevOffers.map((offer) =>
          offer._id === offerToReset
            ? { ...offer, isActive: false }
            : offer
        )
      );
      setSnackbarMessage("Offer reset successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Error resetting offer");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setResetConfirmOpen(false);
      setOfferToReset(null);
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/offer/list");

      if (response.data && response.data.offers) {
        setOffersData(response.data.offers);
      }
      console.log(response.data.offers);
    } catch (err) {
      console.error("Failed to fetch offers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (offerId) => {
    setOfferToDelete(offerId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!offerToDelete) return;

    try {
      await axiosInstance.delete(`/offer/delete/${offerToDelete}`);
      setOffersData((prevOffers) =>
        prevOffers.filter((offer) => offer._id !== offerToDelete)
      );
    } catch (error) {
      console.error("Error deleting offer", error);
    } finally {
      setDeleteConfirmOpen(false);
      setOfferToDelete(null);
    }
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "transparent" }}>
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
            Offers
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            
            
            "&:hover": {  },
            border: "1px solid #FF9800",
          }}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Offer
        </Button>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "#1E1F23", borderRadius: 3 }}
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
                Offer Name
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "transparent",
                  
                  fontWeight: "bold",
                }}
              >
                Offer Type
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
                Validity
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
            {offersData.map((offer) => (
              <TableRow key={offer._id}>
                <TableCell sx={{  }}>
                  {offer.offerName}
                </TableCell>
                <TableCell sx={{  }}>
                  {offer.offerType}
                </TableCell>
                <TableCell sx={{  }}>
                  {offer.discountPercentage}%
                </TableCell>
                <TableCell sx={{  }}>
                  {new Date(offer.startDate).toLocaleString()} -{" "}
                  {new Date(offer.endDate).toLocaleString()}
                </TableCell>
                <TableCell sx={{  }}>
                  <Chip
                    label={offer.isActive ? "Active" : "Inactive"}
                    sx={{
                      backgroundColor: offer.isActive ? "green" : "red",
                      
                      padding: "5px 10px",
                    }}
                  />
                </TableCell>
                <TableCell sx={{ display: "flex", gap: "10px" }}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    sx={{   }}
                    onClick={() => {
                      setSelectedOffer(offer);
                      setIsEditModalOpen(true);
                    }}
                  >
                  </Button>

                  <Button
                    onClick={() => handleOpenDeleteModal(offer._id)}
                    sx={{
                      backgroundColor: "red",
                      
                      "&:hover": { backgroundColor: "darkred" },
                    }}
                  >
                    <DeleteIcon />
                  </Button>
                  <Button
                    onClick={() => handleResetOffer(offer._id)}
                    sx={{
                      backgroundColor: "#4CAF50",
                      
                      "&:hover": { backgroundColor: "#45a049" },
                    }}
                  >
                    <RefreshIcon />
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
        count={offersData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />

      <Dialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
      >
        <DialogTitle>Confirm Reset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset this offer? This will remove all
            discounts applied through this offer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmReset} color="primary">
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this offer? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <AddOfferModal
        open={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        handleOfferAdded={(newOffer) =>
          setOffersData((prev) => [newOffer, ...prev])
        }
      />
      <EditOfferModal
        open={isEditModalOpen}
        handleClose={() => setIsEditModalOpen(false)}
        offer={selectedOffer}
        handleOfferUpdated={(updatedOffer) => {
          setOffersData((prevOffers) =>
            prevOffers.map((offer) =>
              offer._id === updatedOffer._id ? updatedOffer : offer
            )
          );
        }}
      />
    </Box>
  );
};

export default Offers;
