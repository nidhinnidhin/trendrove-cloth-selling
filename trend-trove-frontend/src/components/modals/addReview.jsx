import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Rating,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

const AddReviewModal = ({
  openReviewModal,
  handleCloseReviewModal,
  selectedOrder,
  selectedItem,
  orders,
  setOrders,
}) => {
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  console.log("Itemmmm", orders);

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      setReviewError("Please select a rating");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Please provide a review comment");
      return;
    }

    try {
      const selectedOrderItem = orders
        .find((order) => order.orderId === selectedOrder)
        ?.items.find((item) => item.itemId === selectedItem);

      if (!selectedOrderItem) {
        console.error("Selected order item not found");
        return;
      }

      const response = await axiosInstance.post("/user/review/add", {
        productId: selectedOrderItem.productId,
        variantId: selectedOrderItem.variantId,
        sizeVariantId: selectedOrderItem.sizeVariantId,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Review added successfully!",
          severity: "success",
        });

        setReviewRating(0);
        setReviewComment("");
        setReviewError("");

        handleCloseReviewModal();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add review";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      setReviewError(errorMessage);
    }
  };

  return (
    <>
      <Dialog
        open={openReviewModal}
        onClose={handleCloseReviewModal}
        PaperProps={{
          sx: {
            backgroundColor: "#fafafa",
            borderRadius: "12px",
            maxWidth: "400px",
            width: "100%",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f5f5f5",
          }}
        >
          Write a Review
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Rate this product
            </Typography>
            <Rating
              size="large"
              value={reviewRating}
              onChange={(event, newValue) => {
                setReviewRating(newValue);
                setReviewError("");
              }}
              sx={{
                fontSize: "2rem",
                "& .MuiRating-iconFilled": {
                  color: "#ffd700",
                },
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Write your review"
              variant="outlined"
              value={reviewComment}
              onChange={(e) => {
                setReviewComment(e.target.value);
                setReviewError("");
              }}
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fff",
                },
              }}
            />
            {reviewError && (
              <Typography color="error" sx={{ mt: 1 }}>
                {reviewError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            padding: 2,
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Button
            onClick={handleCloseReviewModal}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            sx={{
              backgroundColor: "#333",
              "&:hover": {
                backgroundColor: "#000",
              },
            }}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddReviewModal;
