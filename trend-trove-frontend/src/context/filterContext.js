import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [filterState, setFilterState] = useState({
    priceRange: [0, 10000],
    categories: [],
    selectedGenders: [],
    selectedRatings: [],
    selectedDiscounts: [],
    selectedColors: [],
    selectedSizes: [],
    sortBy: "default",
  });

  const updateFilters = (newFilters) => {
    setFilterState((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  return (
    <FilterContext.Provider value={{ filterState, updateFilters }}>
      {children}
    </FilterContext.Provider>
  );
};
