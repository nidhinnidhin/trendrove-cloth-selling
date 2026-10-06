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
import { Add, Block, Search, Edit as EditIcon } from "@mui/icons-material";
import axios from "axios";
import AddCategoryModal from "../../modals/addCategoryModal";
import EditCategoryModal from "../../modals/editCategoryModal";
import axiosInstance from "@/utils/adminAxiosInstance";

const Category = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [categoryToBlock, setCategoryToBlock] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/categories/get/admin");
        if (response.data && Array.isArray(response.data.categories)) {
          setCategoryData(response.data.categories);
        } else {
          setError("Invalid categories data format");
        }
      } catch (err) {
        setError("Failed to fetch categories data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryAdded = (newCategory) => {
    if (newCategory && newCategory._id) {
      setCategoryData((prevData) => [newCategory, ...prevData]);
    } else {
      console.error("Invalid new category:", newCategory);
    }
  };

  const handleCategoryUpdated = (updatedCategory) => {
    if (updatedCategory && updatedCategory._id) {
      setCategoryData((prevData) =>
        prevData.map((category) =>
          category._id === updatedCategory._id ? updatedCategory : category
        )
      );
    } else {
      console.error("Invalid updated category:", updatedCategory);
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

  const handleEditModalOpen = (category) => {
    if (category && category._id) {
      setSelectedCategory(category);
      setIsEditModalOpen(true);
    } else {
      console.error("Invalid category selected:", category);
    }
  };
  const handleEditModalClose = () => {
    setSelectedCategory(null);
    setIsEditModalOpen(false);
  };

  const handleBlockCategory = (categoryId) => {
    setCategoryToBlock(categoryId);
    setIsConfirmationModalOpen(true); 
  };

  const handleConfirmBlock = async () => {
    if (!categoryToBlock) return;
    try {
      const response = await axiosInstance.patch(
        `/categories/block/${categoryToBlock}`
      );
      if (response.status === 200) {
        setCategoryData((prevData) =>
          prevData.map((category) =>
            category._id === categoryToBlock
              ? { ...category, isDeleted: true }
              : category
          )
        );
        setSnackbarMessage(response.data.message);
        setSnackbarOpen(true);
        setIsConfirmationModalOpen(false); 
      }
    } catch (error) {
      console.error("Error blocking category:", error);
      setSnackbarMessage("Failed to block category.");
      setSnackbarOpen(true);
      setIsConfirmationModalOpen(false); 
    }
  };

  const handleUnBlockCategory = async (categoryId) => {
    try {
      const response = await axiosInstance.patch(
        `/categories/unblock/${categoryId}`
      );
      if (response.status === 200) {
        setCategoryData((prevData) =>
          prevData.map((category) =>
            category._id === categoryId
              ? { ...category, isDeleted: false }
              : category
          )
        );
        setSnackbarMessage("Category successfully unblocked!");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error unblocking category:", error);
      setSnackbarMessage("Failed to unblock category.");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleConfirmationModalClose = () => setIsConfirmationModalOpen(false);

  if (loading) {
    return <Box sx={{  }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{  }}>Error: {error}</Box>;
  }

  return (
    <>
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
              Categories
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
            Add New Category
          </Button>
          <Box>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
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
                  Category
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
                  Edit Category
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "transparent",
                    
                    fontWeight: "bold",
                  }}
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((category) => (
                  <TableRow key={category._id}>
                    <TableCell sx={{  }}>
                      {category.name}
                    </TableCell>
                    <TableCell sx={{  }}>
                      {new Date(category.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        sx={{
                          
                          
                        }}
                        onClick={() => handleEditModalOpen(category)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell>
                      {category.isDeleted ? (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Block />}
                          sx={{
                            backgroundColor: "black",
                            color: "gray",
                          }}
                          onClick={() => handleUnBlockCategory(category._id)}
                        >
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Block />}
                          sx={{
                            backgroundColor: "black",
                            
                          }}
                          onClick={() => handleBlockCategory(category._id)}
                        >
                          Block
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={categoryData.length}
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
      <AddCategoryModal
        open={isModalOpen}
        handleClose={handleModalClose}
        onCategoryAdded={handleCategoryAdded}
      />
      <EditCategoryModal
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        category={selectedCategory}
        handleCategoryUpdated={handleCategoryUpdated}
      />

      {/* Confirmation Modal */}
      <Dialog
        open={isConfirmationModalOpen}
        onClose={handleConfirmationModalClose}
      >
        <DialogTitle>Confirm Block</DialogTitle>
        <DialogContent>
          Are you sure you want to block this category?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmationModalClose}
            sx={{  }}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmBlock} sx={{  }}>
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

export default Category;
