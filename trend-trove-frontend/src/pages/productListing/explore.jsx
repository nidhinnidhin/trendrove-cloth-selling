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
        const validProducts = (data.products || []).filter(
          (product) =>
            Array.isArray(product?.variants) &&
            product.variants.some(
              (variant) =>
                variant?.color &&
                Array.isArray(variant.sizes) &&
                variant.sizes.length > 0
            )
        );

        const transformedProducts = validProducts.map((product) => {
          // Use only variants that have sizes
          const validVariants = product.variants.filter(
            (v) => v?.color && Array.isArray(v.sizes) && v.sizes.length > 0
          );
          const firstVariant = validVariants[0] || {};
          let originalPrice = 0;
          let discountedPrice = 0;
          let discountPercentage = 0;
          let isOfferActive = false;
          let colorImages = [];
          let availableColors = [];
          let availableSizes = [];

          if (validVariants.length > 0) {
            // Extract colors and sizes from complete variants
            validVariants.forEach((variant) => {
              availableColors.push({
                color: variant.color,
                colorImage: variant.colorImage,
              });
              variant.sizes?.forEach((size) => {
                availableSizes.push(size.size);
              });
            });

            // Get default variant and size
            const variant = validVariants[0];
            if (variant?.sizes && variant.sizes.length > 0) {
              const firstSize = variant.sizes[0];
              originalPrice = firstSize.price || 0;
              discountedPrice = firstSize.discountPrice || originalPrice;

              if (product.activeOffer && product.activeOffer._id?.isActive) {
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
            image: firstVariant.mainImage || "",
            subImage: firstVariant.subImages?.[1] || firstVariant.mainImage || "",
            title: product.name || "Unknown Product",
            description: product.description || "",
            reviewCount: firstVariant.reviewCount || 0,
            averageRating: firstVariant.averageRating || 0,
            price: discountedPrice,
            originalPrice: originalPrice,
            discountPercentage: isOfferActive ? discountPercentage : 0,
            variantsCount: validVariants.length,
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
