import React, { useEffect, useState } from "react";
import Head from "next/head";
import { FilterProvider } from "@/context/filterContext";
import Products from "./components/products";
import Filter from "./components/filter";
import Header from "./components/header";
import Footer from "./components/footer";
import Slider from "./components/slider";
import { Box, Container, Grid } from "@mui/material";
import TopBrands from "./components/topBrands";
import Image from "next/image";
import latestProductsBanner from "../media/new arivals banner.png";
import bannerFashion from "../media/bannerfashion.png";
import CategoryCarousel from "./components/categoryCarousal";
import NewArrival from "./components/newArivals";
import TrendingWears from "./components/trendingWears";
import GenderFilter from "./components/genderFilter";
import axiosInstance from "@/utils/axiosInstance";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let token = localStorage.getItem("usertoken");
    if (token) {
      axiosInstance.get("/users/profile").then((res) => {
        localStorage.setItem("userId", res.data.user._id);
      });
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          "products/get?page=1&limit=12"
        );
        const data = response.data;
        const transformedProducts = data.products.map((product) => {
          const variant = product.variants[0];
          const firstSize = variant.sizes[0];
          return {
            id: product._id,
            image: variant.mainImage,
            title: product.name,
            price: firstSize.discountPrice || firstSize.price,
          };
        });
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Grid container maxWidth="xl" sx={{ margin: '0 auto' }}>
      <Head>
        <title>Trend Trove - Your Fashion Destination</title>
        <meta name="description" content="Discover the latest fashion trends and shop premium clothing at Trend Trove" />
      </Head>

      <FilterProvider>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fafafa',
            width: '100%'
          }}
        >
          <Header />
          <Container maxWidth="xl" disableGutters>
            <Box sx={{ backgroundColor: '#f5f5f5', py: 2 }}>
              <Slider />
            </Box>
            
            <Box sx={{ backgroundColor: '#ffffff', py: { xs: 4, md: 6 } }}>
              <NewArrival />
            </Box>
            
            <Box 
              sx={{ 
                backgroundColor: '#f8f9fa',
                py: { xs: 4, md: 6 },
                backgroundImage: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)'
              }}
            >
              <TrendingWears />
            </Box>
            
            <Box 
              sx={{ 
                backgroundColor: '#ffffff',
                py: { xs: 4, md: 6 },
                borderTop: '1px solid #eee',
                borderBottom: '1px solid #eee'
              }}
            >
              <TopBrands />
            </Box>

            <Box 
              sx={{ 
                display: 'flex', 
                flexGrow: 1,
                backgroundColor: '#f8f9fa',
                py: { xs: 4, md: 6 }
              }}
            >
              <Products products={products} loading={loading} />
            </Box>
          </Container>
          <Footer />
        </Box>
      </FilterProvider>
    </Grid>
  );
}
