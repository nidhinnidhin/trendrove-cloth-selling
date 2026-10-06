import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Button,
  Snackbar,
  Alert,
  FormControl,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { styled } from '@mui/material/styles';
import axiosInstance from "@/utils/axiosInstance";
import { useDispatch } from "react-redux";
import { setWishlistLength } from "@/redux/features/wishlistSlice";
import { setCartLength } from "@/redux/features/cartSlice";

// Styled Components
const WishlistContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: '0 auto',
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  backgroundColor: '#ffffff',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    '& table': {
      '& td': {
        display: 'block',
        textAlign: 'center',
        borderBottom: 'none',
        padding: theme.spacing(1),
      },
      '& td:last-child': {
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingBottom: theme.spacing(2),
      },
    },
    '& thead': {
      display: 'none',
    },
  },
}));

const ProductImage = styled('img')({
  width: 100,
  height: 100,
  objectFit: 'contain',
  borderRadius: 8,
});

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#fce4ec',
  color: '#c2185b',
  '&:hover': {
    backgroundColor: '#f8bbd0',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
}));

const StyledSelect = styled(Select)({
  minWidth: 80,
});

const Wishlist = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      const response = await axiosInstance.get("/user/wishlist/get");
      setItems(response.data.Wishlist);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
    }
  };

  const handleRemoveFromWishlist = async (item) => {
    try {
      await axiosInstance.delete(`/user/wishlist/remove/${item._id}`);
      
      const wishlistResponse = await axiosInstance.get("/user/wishlist/get");
      dispatch(setWishlistLength(wishlistResponse.data.Wishlist.length));
      
      setSnackbarMessage("Item removed from wishlist");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      fetchWishlistItems();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      setSnackbarMessage("Failed to remove item");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      const productData = {
        productId: item.product._id,
        variantId: item.variant._id,
        sizeVariantId: item.sizeVariant._id,
        quantity: 1,
      };

      const response = await axiosInstance.post("/cart/add-to-cart", productData);
      
      if (response.status === 201) {
        const cartResponse = await axiosInstance.get("/cart/get-cart");
        dispatch(setCartLength(cartResponse.data.cart.items.length));
        
        setSnackbarMessage("Product added to cart successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setSnackbarMessage("Failed to add to cart");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  return (
    <WishlistContainer>
      <Typography variant="h4" sx={{ mb: 4, color: '#c2185b', textAlign: 'center' }}>
        My Wishlist
      </Typography>

      {items.length === 0 ? (
        <Box textAlign="center" p={4}>
          <FavoriteIcon sx={{ fontSize: 60, color: '#ffcdd2', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#c2185b', mb: 1 }}>
            Your Wishlist is Empty
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={2}>
            Add items that you like to your wishlist
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/')}
            sx={{
              backgroundColor: '#c2185b',
              '&:hover': { backgroundColor: '#ad1457' }
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <ProductImage
                      src={item.variant.mainImage}
                      alt={item.product.name}
                      onClick={() => handleProductClick(item.product._id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Size: {item.sizeVariant.size}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Color: {item.variant.color}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">
                      ₹{item.sizeVariant.discountPrice}
                    </Typography>
                    {item.sizeVariant.price !== item.sizeVariant.discountPrice && (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ textDecoration: 'line-through' }}
                      >
                        ₹{item.sizeVariant.price}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Grid container spacing={1} direction="column">
                      <Grid item>
                        <ActionButton
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.sizeVariant.stockCount}
                          fullWidth
                        >
                          {item.sizeVariant.stockCount ? 'Add to Cart' : 'Out of Stock'}
                        </ActionButton>
                      </Grid>
                      <Grid item>
                        <ActionButton
                          startIcon={<DeleteIcon />}
                          onClick={() => handleRemoveFromWishlist(item)}
                          fullWidth
                        >
                          Remove
                        </ActionButton>
                      </Grid>
                    </Grid>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            bgcolor: snackbarSeverity === 'success' ? '#c2185b' : '#d32f2f',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </WishlistContainer>
  );
};

export default Wishlist;
