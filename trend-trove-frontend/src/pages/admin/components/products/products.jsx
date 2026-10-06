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
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Typography,
} from "@mui/material";
import { Add, Block, Edit, ExpandMore, Search } from "@mui/icons-material";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import AddProductModal from "../../modals/addProductModal";
import AddVariantModal from "../../modals/addVariantModal"; // Fixed duplicate import issue
import EditProductModal from "../../modals/editProductModal";
import AddSizeVariantModal from "../../modals/addSizeVariantModal";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditVariantModal from "../../modals/editVariantModel";
import EditSizeVariantModal from "../../modals/editSizeModal";
import axiosInstance from "@/utils/adminAxiosInstance";

const Product = () => {
  // State Management
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isEditVariantModalOpen, setIsEditVariantModalOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [variantsData, setVariantsData] = useState({});
  const [sizeVariantsData, setSizeVariantsData] = useState({});
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [sizeVariantModalOpen, setSizeVariantModalOpen] = useState(false);
  const [isEditSizeVariantModalOpen, setIsEditSizeVariantModalOpen] =
    useState(false);
  const [currentSizeVariant, setCurrentSizeVariant] = useState(null);
  const [variantId, setVariantId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToBlock, setProductToBlock] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const limit = 8;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/products/get?page=${currentPage}&limit=${rowsPerPage}&search=${searchTerm}`
      );
      setProductsData(response.data.products);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleVariantFetch = async (productId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/variants/variant/get/${productId}`
      );
      if (response.data.variants) {
        setVariantsData((prev) => ({
          ...prev,
          [productId]: response.data.variants,
        }));
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch variants",
        severity: "error",
      });
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSizesFetch = async (variantId) => {
    try {
      const response = await axiosInstance.get(
        // `${process.env.NEXT_PUBLIC_API_URL}/sizes/sizes/${variantId}`
        `${process.env.NEXT_PUBLIC_API_URL}/sizes/sizes/${variantId}`
      );
      if (response.status === 200) {
        setSizeVariantsData((prev) => ({
          ...prev,
          [variantId]: response.data.sizeVariants,
        }));
      }
    } catch (error) {
      console.error("Error fetching sizes:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch sizes",
        severity: "error",
      });
    }
  };

  const handleBlockProduct = async (productId, isBlocked) => {
    try {
      const url = isBlocked
        ? `/products/unblock/${productId}`
        : `/products/block/${productId}`;

      const response = await axiosInstance.patch(url);
      if (response.status === 200) {
        setProductsData((prevData) =>
          prevData.map((product) =>
            product._id === productId
              ? { ...product, isDeleted: !isBlocked }
              : product
          )
        );
        setSnackbar({
          open: true,
          message: `Product successfully ${
            isBlocked ? "unblocked" : "blocked"
          }`,
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update product status",
        severity: "error",
      });
    }
    setIsConfirmModalOpen(false);
  };
  const handleEditSizeVariant = (sizeVariant) => {
    setCurrentSizeVariant(sizeVariant);
    setIsEditSizeVariantModalOpen(true);
  };

  const handleEditSizeVariantModalClose = () => {
    setIsEditSizeVariantModalOpen(false);
    setCurrentSizeVariant(null);
  };

  const handleEditVariantModalClose = () => {
    setIsEditVariantModalOpen(false);
    setCurrentVariant(null);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const closeSizeVariantModal = () => {
    setSizeVariantModalOpen(false);
    setVariantId("");
  };

  const snackbarOpen = snackbar.open;
  const snackbarMessage = snackbar.message;

  const handleProductUpdated = (updatedProduct) => {
    setProductsData((prevData) =>
      prevData.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setSnackbar({
      open: true,
      message: "Product updated successfully",
      severity: "success",
    });
  };

  // Modal handlers
  const handleAddVariant = (productId) => {
    setSelectedProductId(productId);
    setIsVariantModalOpen(true);
  };

  const handleAddSize = (variantId) => {
    setVariantId(variantId);
    setSizeVariantModalOpen(true);
  };

  const handleProductAdded = (newProduct) => {
    setProductsData((prevProducts) => [newProduct, ...prevProducts]);

    setSnackbar({
      open: true,
      message: "Product added successfully!",
      severity: "success",
    });
  };

  const handleVariantAdded = async (newVariant) => {
    try {
      // First, update the local state with the new variant
      setVariantsData((prevVariants) => {
        const existingVariants = prevVariants[newVariant.productId] || [];
        return {
          ...prevVariants,
          [newVariant.productId]: [...existingVariants, newVariant],
        };
      });

      // Fetch the updated variants list to ensure synchronization
      await handleVariantFetch(newVariant.productId);

      setSnackbar({
        open: true,
        message: "Variant added successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating variants:", error);
      setSnackbar({
        open: true,
        message: "Error updating variants list",
        severity: "error",
      });
    }
  };

  const handleSizeVariantAdded = (newSizeVariant) => {
    // Update the sizeVariantsData state with the new size variant
    setSizeVariantsData(prevSizeVariants => {
      const existingVariantSizes = prevSizeVariants[newSizeVariant.variantId] || [];
      return {
        ...prevSizeVariants,
        [newSizeVariant.variantId]: [...existingVariantSizes, newSizeVariant]
      };
    });
  
    setSnackbar({
      open: true,
      message: "Size variant added successfully!",
      severity: "success",
    });
  };

  if (loading) {
    return (
      <Box sx={{ padding: 3, textAlign: "center" }}>
        <Typography variant="h6" sx={{ color: "#ffffff" }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3, textAlign: "center" }}>
        <Typography variant="h6" sx={{ color: "#f44336" }}>
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, backgroundColor: "transparent", minHeight: "100vh" }}>
      {/* Header Section */}
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
          Products Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsModalOpen(true)}
          sx={{
            
            
            "&:hover": { backgroundColor: "#66bb6a" },
          }}
        >
          Add New Product
        </Button>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            
            borderRadius: 1,
            width: "250px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#1E1F23",
              },
              "&:hover fieldset": {
                borderColor: "#1E1F23",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1E1F23",
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <IconButton>
                <Search />
              </IconButton>
            ),
          }}
        />
      </Box>

      {/* Products List with Accordions */}
      {productsData.map((product) => (
        <Accordion
          key={product._id}
          sx={{ mb: 2, boxShadow: 3 }}
          onChange={() => handleVariantFetch(product._id)}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              
              borderBottom: "1px solid #e0e0e0",
            }}
          >
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
                  {product.name}
                </Typography>
                <Typography variant="body1" sx={{ color: "#B8BBC2" }}>
                  Category: {product.category.name} | Brand:{" "}
                  {product.brand.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#B8BBC2" }}>
                  Created: {new Date(product.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentProduct(product);
                    setIsEditModalOpen(true);
                  }}
                  sx={{
                    backgroundColor: "#ff9800",
                    
                    "&:hover": { backgroundColor: "#ffb74d" },
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Block />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlockProduct(product._id, product.isDeleted);
                  }}
                  sx={{
                    backgroundColor: product.isDeleted ? "#f44336" : "#4caf50", // Red for blocked, green for unblocked
                    
                    "&:hover": {
                      backgroundColor: product.isDeleted
                        ? "#ef5350"
                        : "#66bb6a", // Darker red/green on hover
                    },
                  }}
                >
                  {product.isDeleted ? "Unblock" : "Block"}
                </Button>
              </Box>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ backgroundColor: "transparent" }}>
            {/* Add Variant Button */}
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleAddVariant(product._id)}
                sx={{
                  
                  
                  "&:hover": { backgroundColor: "#66bb6a" },
                }}
              >
                Add Variant
              </Button>
            </Box>

            {/* Variants Section */}
            {variantsData[product._id]?.map((variant) => (
              <Accordion
                key={variant._id}
                sx={{ mb: 1 }}
                onChange={() => handleSizesFetch(variant._id)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <img
                      src={variant.mainImage}
                      alt={variant.color}
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                    <Typography sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      {variant.color}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  {/* Size Variants Table */}
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => handleAddSize(variant._id)}
                      sx={{
                        
                        
                        "&:hover": { backgroundColor: "#66bb6a" },
                        mb: 2,
                      }}
                    >
                      Add Size
                    </Button>
                  </Box>

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#1E1F23" }}>
                          <TableCell sx={{  }}>Size</TableCell>
                          <TableCell sx={{  }}>Price</TableCell>
                          <TableCell sx={{  }}>
                            Discount Price
                          </TableCell>
                          <TableCell sx={{  }}>Stock</TableCell>
                          {/* <TableCell sx={{  }}>Actions</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sizeVariantsData[variant._id] &&
                        sizeVariantsData[variant._id].length > 0 ? (
                          sizeVariantsData[variant._id].map((size) => (
                            <TableRow key={size._id}>
                              <TableCell>{size.size}</TableCell>
                              <TableCell>₹{size.price}</TableCell>
                              <TableCell>₹{size.discountPrice}</TableCell>
                              <TableCell>{size.stockCount}</TableCell>
                              {/* <TableCell> */}
                              {/* <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleEditSizeVariant(size)}
                                  sx={{
                                    
                                    
                                    "&:hover": { backgroundColor: "#FFB74D" },
                                  }}
                                >
                                  Edit
                                </Button> */}
                              {/* </TableCell> */}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              No size variants available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <TablePagination
          component="div"
          count={totalPages * limit} // Total number of products
          page={currentPage - 1} // MUI Pagination is zero-based
          rowsPerPage={limit}
          onPageChange={(event, newPage) => setCurrentPage(newPage + 1)} // Convert to one-based
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setCurrentPage(1); // Reset to the first page
          }}
        />
      </Box>

      {/* Modals */}
      <AddProductModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      <EditProductModal
        open={isEditModalOpen}
        handleClose={() => setIsEditModalOpen(false)}
        product={currentProduct}
        handleProductUpdated={handleProductUpdated}
      />

      <AddVariantModal
        open={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        productId={selectedProductId}
        onVariantAdded={handleVariantAdded}
      />
      <AddSizeVariantModal
        open={sizeVariantModalOpen}
        onClose={closeSizeVariantModal}
        variantId={variantId}
        onSizeAdded={handleSizeVariantAdded} // Add this line
      />
      <EditVariantModal
        open={isEditVariantModalOpen}
        onClose={handleEditVariantModalClose}
        variant={currentVariant}
      />

      <EditSizeVariantModal
        open={isEditSizeVariantModalOpen}
        onClose={handleEditSizeVariantModalClose}
        sizeVariant={currentSizeVariant}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Product;
