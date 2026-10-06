import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import {
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Snackbar,
  Grid,
  Slide,
  TextField,
  Tooltip,
  Container,
} from "@mui/material";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../../media/logo.png";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import ProfileModal from "@/components/modals/profileModal";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setCartLength } from "@/redux/features/cartSlice";
import { setWishlistLength } from "@/redux/features/wishlistSlice";
import { motion } from "framer-motion";
import LocalMallIcon from "@mui/icons-material/LocalMall"; // Custom cart icon
import {
  ShoppingCartIcon,
  HeartIcon,
  HomeIcon,
  ShirtIcon,
  TagIcon,
} from "lucide-react";

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState([]);

  const dispatch = useDispatch();
  const cartLength = useSelector((state) => state.cart.cartLength);
  const wishlistLength = useSelector((state) => state.wishlist.wishlistLength);

  useEffect(() => {
    const fetchCartLength = async () => {
      const token = localStorage.getItem("usertoken");
      if (token) {
        try {
          const response = await axiosInstance.get("/cart/get-cart");
          
          if (response.data && response.data.cart && response.data.cart.items) {
            dispatch(setCartLength(response.data.cart.items.length));
          } else {
            dispatch(setCartLength(0));
          }
        } catch (error) {
          console.error("Error fetching cart length:", error);
          dispatch(setCartLength(0));
        }
      } else {
        dispatch(setCartLength(0));
      }
    };

    fetchCartLength();
  }, [dispatch]);

  useEffect(() => {
    const fetchWishlistLength = async () => {
      const token = localStorage.getItem("usertoken");
      if (token) {
        try {
          const response = await axiosInstance.get("/user/wishlist/get");
          if (response.data.Wishlist) {
            dispatch(setWishlistLength(response.data.Wishlist.length));
          }
        } catch (error) {
          console.error("Error fetching wishlist length:", error);
        }
      }
    };

    fetchWishlistLength();
  }, [dispatch]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("usertoken");
      setToken(storedToken);
      if (storedToken) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const response = await axiosInstance.get("/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserProfile(response.data.user.image || "");
          setUser(response.data.user);
        } catch (error) {
          if (error.response?.status === 404) {
            setUserProfile(response.data.user.image || "");
          } else {
            console.error("Error fetching Profile:", error);
          }
          setIsLoading(false);
          setSnackbarOpen(true);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories");
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleProfileClick = () => {
    router.push("/profile/userprofile");
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // Call logout endpoint to clear CSRF token
      await axiosInstance.post("/users/logout");
      
      // Clear localStorage token
      localStorage.removeItem("usertoken");
      localStorage.removeItem("userId");
      
      // Clear state
      setToken(null);
      setIsLoggedIn(false);
      dispatch(setCartLength(0));
      dispatch(setWishlistLength(0));
      
      // Clear all cookies including CSRF token
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.split("=");
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      // Show success message
      setSnackbarMessage("Successfully logged out");
      setSnackbarOpen(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/authentication/loginSignup");
      }, 1000);

    } catch (error) {
      console.error("Logout error:", error);
      setErrorMessage("Error during logout. Please try again.");
    } finally {
      setOpenLogoutDialog(false);
    }
  };

  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUserProfile(updatedUser.image);
    setUser(updatedUser);
  };

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev);
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const response = await axiosInstance.get(`/products/product/search`, {
          params: { query },
        });
        setSearchResults(response.data.products);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchItemClick = () => {
    router.push(`/productListing/searchResults?search=${searchQuery}`);
    setIsSearchOpen(false);
  };

  const handleCategoryClick = (category) => {
    router.push(`/productListing/searchResults?category=${category._id}`);
    setIsSearchOpen(false);
  };

  const menuItems = [
    { text: "Home", icon: <HomeIcon size={20} />, path: "/" },
    {
      text: "Explore",
      path: "/productListing/explore",
      icon: <ShirtIcon size={20} />,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, marginBottom: "50px" }}>
      <AppBar position="fixed" sx={{ bgcolor: "#fff", boxShadow: "none" }}>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            width: "100%",
            padding: isMobile ? "8px 16px" : "8px 5%",
            borderBottom: "1px solid #eee",
          }}
        >
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ color: "#333" }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ flexShrink: 0 }}>
            <Link href="/">
              <Image
                src={logo}
                height={isMobile ? 50 : 50}
                width={isMobile ? 150 : 200}
                alt="Logo"
                priority
              />
            </Link>
          </Box>

          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                gap: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {["Explore"].map(
                (item, index) => (
                  <Typography
                    key={index}
                    variant="body1"
                    sx={{
                      cursor: "pointer",
                      position: "relative",
                      "&:hover::after": {
                        content: '""',
                        position: "absolute",
                        bottom: "-5px",
                        left: 0,
                        width: "100%",
                        height: "2px",
                        backgroundColor: "orange",
                        transform: "scaleX(1)",
                        transition: "transform 0.3s ease",
                      },
                    }}
                  >
                    <Link
                      href={
                        item === "Explore"
                          ? "/productListing/explore"
                          : `/${item.toLowerCase()}`
                      }
                      style={{ textDecoration: "none", color: "#333" }}
                    >
                      {item}
                    </Link>
                  </Typography>
                )
              )}
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="inherit" onClick={handleSearchToggle}>
              <Tooltip title="Search products">
                <SearchIcon sx={{ fontSize: "30px", color: "#333" }} />
              </Tooltip>
            </IconButton>
            {isLoggedIn ? (
              <>
                <IconButton size="large" sx={{ color: "black" }}>
                  <Link
                    href="/cart/cartpage"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Badge badgeContent={cartLength} color="error">
                      <ShoppingCartIcon sx={{ fontSize: "30px" }} />
                    </Badge>
                  </Link>
                </IconButton>

                <IconButton size="large" sx={{ color: "black" }}>
                  <Link
                    href="/whishlist/whishlistPage"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Badge badgeContent={wishlistLength} color="error">
                      <HeartIcon sx={{ fontSize: "30px" }} />
                    </Badge>
                  </Link>
                </IconButton>

                <IconButton
                  size="large"
                  color="inherit"
                  onClick={handleMenuClick}
                  sx={{
                    "&:hover": {
                      transform: "scale(1.1)",
                      transition: "transform 0.3s ease",
                    },
                  }}
                >
                  <Avatar
                    alt="User Avatar"
                    src={userProfile || "/default-avatar.png"}
                  />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleProfileClick}>My Profile</MenuItem>
                  <Link
                    href="/orders/orders"
                    style={{ textDecoration: "none", color: "black" }}
                  >
                    <MenuItem>Orders</MenuItem>
                  </Link>
                  <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                sx={{
                  borderColor: "orange",
                  color: "orange",
                  "&:hover": {
                    backgroundColor: "orange",
                    color: "white",
                  },
                }}
                onClick={() => router.push("/authentication/loginSignup")}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>

        {!isMobile && (
          <Box
            sx={{
              borderBottom: "1px solid #eee",
              bgcolor: "#fff",
              py: 1,
            }}
          >
            <Container maxWidth="xl">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                  overflowX: "auto",
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
              >
                {categories.map((category) => (
                  <Button
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    sx={{
                      color: "#333",
                      textTransform: "none",
                      minWidth: "auto",
                      px: 2,
                      "&:hover": {
                        color: "#ff6f61",
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </Box>
            </Container>
          </Box>
        )}

        <Slide direction="down" in={isSearchOpen} mountOnEnter unmountOnExit>
          <Box
            sx={{
              width: "100%",
              p: 2,
              backgroundColor: "#ffffff",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              position: "absolute",
              top: 64,
              zIndex: 1100,
            }}
          >
            <TextField
              fullWidth
              placeholder="Search products..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                backgroundColor: "#f8f8f8",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#bdbdbd",
                  },
                  "&:hover fieldset": {
                    borderColor: "#757575",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#000",
                  },
                },
              }}
            />
            {searchResults.length > 0 && (
              <List
                sx={{
                  backgroundColor: "#ffffff",
                  mt: 1,
                  borderRadius: "8px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                {searchResults.map((product) => (
                  <ListItem
                    key={product._id}
                    button
                    sx={{ borderBottom: "1px solid #f0f0f0" }}
                    onClick={handleSearchItemClick}
                  >
                    <SearchIcon sx={{ color: "gray", marginRight: "10px" }} />
                    <ListItemText primary={product.name}  sx={{ color: "gray"}}/>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Slide>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: 280 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Categories
          </Typography>
          <List>
            {categories.map((category) => (
              <ListItem
                button
                key={category._id}
                onClick={() => {
                  handleCategoryClick(category);
                  handleDrawerToggle();
                }}
              >
                <ListItemText primary={category.name} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  item.category
                    ? handleCategoryClick(item.category)
                    : router.push(item.path);
                  handleDrawerToggle();
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        sx={{
          backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <Grid
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
          }}
        >
          <DialogTitle sx={{ color: "#ffcc00", fontWeight: "bold" }}>
            Confirm Logout
          </DialogTitle>
          <DialogContent sx={{ color: "gray" }}>
            Are you sure you want to logout?
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button
              onClick={handleLogoutCancel}
              sx={{
                color: "black",
                border: "1px solid #777",
                borderRadius: "20px",
                backgroundColor: "rgba(134, 209, 241, 0.2)",
                backdropFilter: "blur(3px)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              No
            </Button>
            <Button
              onClick={handleLogoutConfirm}
              sx={{
                color: "black",
                border: "1px solid #ff4d4d",
                borderRadius: "20px",
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                backdropFilter: "blur(3px)",
                textTransform: "none",
                marginLeft: "10px",
                "&:hover": {
                  backgroundColor: "rgba(255, 0, 0, 0.3)",
                },
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Grid>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage || "You are logged out"}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          backgroundColor: "black",
          color: "white",
        }}
      />

      <ProfileModal
        open={isProfileModalOpen}
        handleClose={() => setIsProfileModalOpen(false)}
        user={user}
        profileImage={userProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </Box>
  );
};

export default Header;
