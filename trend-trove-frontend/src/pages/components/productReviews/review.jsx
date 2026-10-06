import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Rating,
  Divider,
  CircularProgress,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

const ProductReviews = ({
  productId,
  selectedVariantId,
  selectedSizeVariantId,
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(
          `/user/review/get/${productId}`
        );

        const filteredReviews = response.data.reviews.filter(
          (review) =>
            review.variant._id === selectedVariantId &&
            review.sizeVariant._id === selectedSizeVariantId
        );
        console.log("Reviewwww", filteredReviews);

        setReviews(filteredReviews);
        setLoading(false);
      } catch (err) {
        setError("Failed to load reviews");
        setLoading(false);
      }
    };

    if (productId && selectedVariantId && selectedSizeVariantId) {
      fetchReviews();
    }
  }, [productId, selectedVariantId, selectedSizeVariantId]);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const RatingBar = ({ rating, count, total }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography sx={{ minWidth: 45 }}>{rating} stars</Typography>
      <LinearProgress
        variant="determinate"
        value={(count / total) * 100}
        sx={{
          mx: 2,
          height: 8,
          borderRadius: 4,
          bgcolor: '#edf2f7',
          flex: 1,
          '& .MuiLinearProgress-bar': {
            bgcolor: '#ffd700'
          }
        }}
      />
      <Typography sx={{ minWidth: 30 }}>{count}</Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Accordion 
      defaultExpanded 
      elevation={0}
      sx={{
        mt: 4,
        background: 'transparent',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          '&:hover': { backgroundColor: '#f1f5f9' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Reviews & Ratings
          </Typography>
          {reviews.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              backgroundColor: '#fff',
              px: 2,
              py: 0.5,
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <StarIcon sx={{ color: '#ffd700' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {calculateAverageRating()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({reviews.length} reviews)
              </Typography>
            </Box>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 4 }}>
        {reviews.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1e293b' }}>
              Rating Distribution
            </Typography>
            {[5,4,3,2,1].map(rating => {
              const count = reviews.filter(r => Math.floor(r.rating) === rating).length;
              return (
                <RatingBar 
                  key={rating} 
                  rating={rating} 
                  count={count} 
                  total={reviews.length} 
                />
              );
            })}
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.length === 0 ? (
            <Paper elevation={0} sx={{
              p: 4,
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <Typography color="text.secondary">
                Be the first to review this variant!
              </Typography>
            </Paper>
          ) : (
            reviews.map((review) => (
              <Paper
                key={review._id}
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={review.user?.image}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {review.user?.username}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={review.rating} size="small" readOnly />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  {review.isVerified && (
                    <Box sx={{ 
                      ml: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'success.main'
                    }}>
                      <VerifiedIcon fontSize="small" />
                      <Typography variant="caption">Verified Purchase</Typography>
                    </Box>
                  )}
                </Box>
                <Typography sx={{ color: '#475569', lineHeight: 1.7 }}>
                  {review.comment}
                </Typography>
              </Paper>
            ))
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ProductReviews;
