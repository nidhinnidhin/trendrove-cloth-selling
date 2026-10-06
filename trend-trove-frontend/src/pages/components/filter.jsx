import React, { useCallback, useEffect, useState, useRef } from "react";
import { useFilter } from "@/context/filterContext";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  MenuItem,
  Select,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";
import GenderFilter from "../components/genderFilter";

// Custom Range Slider Component
const RangeSlider = ({ min, max, value, onChange, step = 100 }) => {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(null); // 'min' or 'max' or null
  const sliderRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const calculateValueFromPosition = (clientX) => {
    if (!sliderRef.current) return 0;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = (clientX - rect.left) / rect.width;
    let newValue = Math.round((percentage * (max - min) + min) / step) * step;
    
    // Ensure the value is within bounds
    newValue = Math.max(min, Math.min(max, newValue));
    return newValue;
  };

  const handleMouseDown = (e, handle) => {
    e.preventDefault();
    setIsDragging(handle);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const newValue = calculateValueFromPosition(e.clientX);
    const updatedValue = [...localValue];
    
    if (isDragging === 'min') {
      updatedValue[0] = Math.min(newValue, localValue[1] - step);
    } else if (isDragging === 'max') {
      updatedValue[1] = Math.max(newValue, localValue[0] + step);
    }
    
    setLocalValue(updatedValue);
  }, [isDragging, localValue, min, max, step]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onChange(localValue);
      setIsDragging(null);
    }
  }, [isDragging, localValue, onChange]);

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX });
  }, [isDragging, handleMouseMove]);

  // Calculate percentages for positioning
  const minPosition = ((localValue[0] - min) / (max - min)) * 100;
  const maxPosition = ((localValue[1] - min) / (max - min)) * 100;
  const trackWidth = maxPosition - minPosition;

  return (
    <Box sx={{ padding: 2, position: 'relative', height: '40px' }}>
      {/* Rail */}
      <Box
        ref={sliderRef}
        sx={{
          position: 'absolute',
          height: '6px',
          width: '100%',
          backgroundColor: '#e0e0e0',
          borderRadius: '3px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          const newValue = calculateValueFromPosition(e.clientX);
          // Determine which handle to move based on which one is closer
          const distToMin = Math.abs(newValue - localValue[0]);
          const distToMax = Math.abs(newValue - localValue[1]);
          const newLocalValue = [...localValue];
          
          if (distToMin <= distToMax) {
            newLocalValue[0] = newValue;
          } else {
            newLocalValue[1] = newValue;
          }
          
          setLocalValue(newLocalValue);
          onChange(newLocalValue);
        }}
      />
      
      {/* Track (colored part) */}
      <Box
        sx={{
          position: 'absolute',
          height: '6px',
          left: `${minPosition}%`,
          width: `${trackWidth}%`,
          backgroundColor: '#ff6f61',
          borderRadius: '3px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      
      {/* Min handle */}
      <Box
        sx={{
          position: 'absolute',
          height: '24px',
          width: '24px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          border: '2px solid #ff6f61',
          left: `${minPosition}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
          boxShadow: '0px 2px 3px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 0 0 8px rgba(255, 111, 97, 0.16)',
          },
          zIndex: 2,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'min')}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleMouseDown({ preventDefault: () => {}, clientX: touch.clientX }, 'min');
        }}
      />
      
      {/* Max handle */}
      <Box
        sx={{
          position: 'absolute',
          height: '24px',
          width: '24px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          border: '2px solid #ff6f61',
          left: `${maxPosition}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
          boxShadow: '0px 2px 3px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 0 0 8px rgba(255, 111, 97, 0.16)',
          },
          zIndex: 2,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'max')}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleMouseDown({ preventDefault: () => {}, clientX: touch.clientX }, 'max');
        }}
      />
    </Box>
  );
};

const Filter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { filterState, updateFilters } = useFilter();
  const [categories, setCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  const handlePriceChange = (newValue) => {
    updateFilters({ priceRange: newValue });
  };

  const handleSortChange = (event) => {
    updateFilters({ sortBy: event.target.value });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories");
        setCategories(response.data.categories.map((cat) => cat.name));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch available colors and sizes
    const fetchFilters = async () => {
      try {
        const response = await axiosInstance.get("/products/filters");
        setAvailableColors(response.data.colors);
        setAvailableSizes(response.data.sizes);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };
    fetchFilters();
  }, []);

  const handleCategoryChange = (category) => {
    const newCategories = filterState.categories.includes(category)
      ? filterState.categories.filter((c) => c !== category)
      : [...filterState.categories, category];
    updateFilters({ categories: newCategories });
  };

  const handleGenderChange = (gender) => {
    const newGenders = filterState.selectedGenders.includes(gender)
      ? filterState.selectedGenders.filter((g) => g !== gender)
      : [...filterState.selectedGenders, gender];
    updateFilters({ selectedGenders: newGenders });
  };

  const handleRatingChange = (rating) => {
    const newRatings = filterState.selectedRatings.includes(rating)
      ? filterState.selectedRatings.filter((r) => r !== rating)
      : [...filterState.selectedRatings, rating];
    updateFilters({ selectedRatings: newRatings });
  };

  const handleDiscountChange = (discount) => {
    const newDiscounts = filterState.selectedDiscounts.includes(discount)
      ? filterState.selectedDiscounts.filter((d) => d !== discount)
      : [...filterState.selectedDiscounts, discount];
    updateFilters({ selectedDiscounts: newDiscounts });
  };

  const handleColorChange = (color) => {
    const newColors = filterState.selectedColors.includes(color)
      ? filterState.selectedColors.filter((c) => c !== color)
      : [...filterState.selectedColors, color];
    updateFilters({ selectedColors: newColors });
  };

  const handleSizeChange = (size) => {
    const newSizes = filterState.selectedSizes.includes(size)
      ? filterState.selectedSizes.filter((s) => s !== size)
      : [...filterState.selectedSizes, size];
    updateFilters({ selectedSizes: newSizes });
  };

  const genders = ["Men", "Women", "Unisex"];
  const ratings = [5, 4, 3, 2, 1];
  const discounts = ["10", "20", "30", "40", "50"];

  const FilterContent = () => (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ marginBottom: 4 }}>
        {isMobile && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setIsDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        {/* Color Filter */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h6">Colors</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {availableColors.map((color) => (
              <Box
                key={color}
                onClick={() => handleColorChange(color)}
                sx={{
                  width: 25,
                  height: 25,
                  backgroundColor: color,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border: filterState.selectedColors.includes(color)
                    ? "2px solid #ff6f61"
                    : "1px solid #ddd",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
        {/* Size Filter */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Sizes</Typography>
          <FormGroup>
            {availableSizes.map((size) => (
              <FormControlLabel
                key={size}
                control={
                  <Checkbox
                    checked={filterState.selectedSizes.includes(size)}
                    onChange={() => handleSizeChange(size)}
                    sx={{
                      "&.Mui-checked": {
                        color: "#ff6f61",
                      },
                    }}
                  />
                }
                label={size}
              />
            ))}
          </FormGroup>
        </Box>
        
      </Box>
      <Typography variant="h6" gutterBottom sx={{mt:2}}>
        Price Range
      </Typography>
      
      {/* Custom Range Slider */}
      <RangeSlider
        min={0}
        max={10000}
        step={100}
        value={filterState.priceRange}
        onChange={handlePriceChange}
      />
      
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Typography>₹{filterState.priceRange[0]}</Typography>
        <Typography>₹{filterState.priceRange[1]}</Typography>
      </Box>
      
      <Box sx={{ width: "100%", bgcolor: "background.paper", mb: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sort By
        </Typography>
        <Select
          value={filterState.sortBy}
          onChange={handleSortChange}
          fullWidth
          size="small"
        >
          <MenuItem value="default">Default</MenuItem>
          <MenuItem value="asc">Name (A-Z)</MenuItem>
          <MenuItem value="desc">Name (Z-A)</MenuItem>
          <MenuItem value="popularity">Popularity</MenuItem>
        </Select>
      </Box>

      {[
        {
          title: "Categories",
          items: categories,
          handler: handleCategoryChange,
          state: filterState.categories,
        },
        {
          title: "Gender",
          items: ["Men", "Women", "Unisex"],
          handler: handleGenderChange,
          state: filterState.selectedGenders,
        },
        {
          title: "Rating",
          items: [5, 4, 3, 2, 1],
          handler: handleRatingChange,
          state: filterState.selectedRatings,
        },
        {
          title: "Discount",
          items: ["10", "20", "30", "40", "50"],
          handler: handleDiscountChange,
          state: filterState.selectedDiscounts,
        },
      ].map((section) => (
        <Accordion
          key={section.title}
          defaultExpanded={!isMobile}
          sx={{
            "&.MuiAccordion-root": {
              backgroundColor: "transparent",
              boxShadow: "none",
              "&:before": {
                display: "none",
              },
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              mb: 1,
              "&.Mui-expanded": {
                minHeight: "48px",
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            }}
          >
            <Typography variant="subtitle1">{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {section.items.map((item) => (
                <FormControlLabel
                  key={item}
                  control={
                    <Checkbox
                      checked={section.state.includes(item)}
                      onChange={() => section.handler(item)}
                      sx={{
                        color: "#ff6f61",
                        "&.Mui-checked": {
                          color: "#ff6f61",
                        },
                      }}
                    />
                  }
                  label={
                    section.title === "Rating"
                      ? `${item} Star${item === 1 ? "" : "s"}`
                      : section.title === "Discount"
                      ? `${item}% or more`
                      : item
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      ))}

      {isMobile && (
        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: "#ff6f61",
            "&:hover": {
              backgroundColor: "#ff5c4d",
            },
          }}
          onClick={() => setIsDrawerOpen(false)}
        >
          Apply Filters
        </Button>
      )}
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          <IconButton
            onClick={() => setIsDrawerOpen(true)}
            sx={{
              position: "fixed",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "#ff6f61",
              color: "white",
              "&:hover": {
                backgroundColor: "#ff5c4d",
              },
              zIndex: 1000,
            }}
          >
            <FilterListIcon />
          </IconButton>

          <Drawer
            anchor="left"
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: "85%",
                maxWidth: "360px",
                backgroundColor: "#fff",
              },
            }}
          >
            <FilterContent />
          </Drawer>
        </>
      ) : (
        <Box
          sx={{
            width: "25%",
            minWidth: "250px",
            maxWidth: "300px",
            backgroundColor: "#fff",
            borderRight: "1px solid #e0e0e0",
            height: "100vh",
            position: "sticky",
            top: 0,
            overflowY: "auto",
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f5f5f5',
              borderRadius: '4px',
              '&:hover': {
                background: '#eeeeee',
              },
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#FF9800',
              borderRadius: '4px',
              '&:hover': {
                background: '#F57C00',
              },
            },
            scrollbarColor: '#FF9800 #f5f5f5',
            scrollbarWidth: 'thin',
          }}
        >
          <FilterContent />
        </Box>
      )}
    </>
  );
};

export default Filter;
