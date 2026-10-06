import React, { useEffect, useState, useCallback, Suspense } from "react";
import Head from "next/head";
import { FilterProvider, useFilter } from "@/context/filterContext";
import Products from "../components/products";
import Filter from "../components/filter";
import Header from "../components/header";
import Footer from "../components/footer";
import Slider from "../components/slider";
import { Box, colors, CircularProgress } from "@mui/material";
import axiosInstance from "@/utils/axiosInstance";

// Lazy load ListProducts component
const ListProducts = React.lazy(() => import("./listProducts"));

export default function Explore() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { filterState } = useFilter();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/products/get`, {
          params: {
            page: currentPage,
            limit: 12,
            colors: filterState.selectedColors,
            sizes: filterState.selectedSizes,
            minPrice: filterState.priceRange[0],
            maxPrice: filterState.priceRange[1],
          },
        });

        console.log("res", response);

        const data = response.data;
        const products = response.data.products;
        const transformedProducts = data.products.map((product) => {
          const firstVariant = product.variants?.[0] || {};
          let originalPrice = 0;
          let discountedPrice = 0;
          let discountPercentage = 0;
          let isOfferActive = false;
          let colorImages = [];
          let availableColors = [];
          let availableSizes = [];
          let rating = 0;

          if (product.variants && product.variants.length > 0) {
            // Extract all colors and sizes
            product.variants.forEach((variant) => {
              availableColors.push({
                color: variant.color,
                colorImage: variant.colorImage,
              });
              variant.sizes.forEach((size) => {
                availableSizes.push(size.size);
              });
            });

            // Get default variant and size
            const variant = product.variants[0];
            if (variant.sizes && variant.sizes.length > 0) {
              const firstSize = variant.sizes[0];
              originalPrice = firstSize.price || 0;
              discountedPrice = firstSize.discountPrice || originalPrice;

              if (product.activeOffer && product.activeOffer._id.isActive) {
                discountPercentage =
                  product.activeOffer._id.discountPercentage || 0;
                isOfferActive = true;
                if (!firstSize.discountPrice) {
                  discountedPrice =
                    originalPrice * (1 - discountPercentage / 100);
                }
              }
            }
            colorImages = availableColors;
          }

          return {
            id: product._id,
            image: product.variants?.[0]?.mainImage || "",
            subImage: product.variants?.[0]?.subImages[1],
            title: product.name || "Unknown Product",
            description: product.description || "",
            reviewCount: firstVariant.reviewCount || 0,
            averageRating: firstVariant.averageRating || 0,
            price: discountedPrice,
            originalPrice: originalPrice,
            discountPercentage: isOfferActive ? discountPercentage : 0,
            variantsCount: product.variants?.length || 0,
            colorImages: colorImages,
            availableSizes: [...new Set(availableSizes)],
            category: product.category?.name || "Uncategorized",
            gender: product.gender || "Unisex",
            isDeleted: product.isDeleted || false,
            isOfferActive,
          };
        });

        setProducts(transformedProducts);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Show error to user
        alert("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, filterState]);

  console.log("products", products);

  // Memoize handlePageChange function
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <Head>
        <title>E-Commerce Store</title>
        <meta name="description" content="Shop the latest products" />
      </Head>

      <FilterProvider>
        <Header />
        <Box
          sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            <Filter />
            <Suspense
              fallback={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <CircularProgress />
                </Box>
              }
            >
              <ListProducts
                products={products}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </Suspense>
          </Box>
          <Footer />
        </Box>
      </FilterProvider>
    </>
  );
}
