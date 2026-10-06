import React from 'react';
import { Box, Typography, Card, CardMedia } from '@mui/material';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

const FilterCard = styled(Card)`
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    
    .overlay {
      background-color: rgba(0, 0, 0, 0.3);
    }
    
    .title {
      transform: translateY(-5px);
    }
  }
`;

const Overlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
`;

const GenderFilter = () => {
  const router = useRouter();

  const genderCategories = [
    {
      id: 1,
      title: "All Men's",
      image: "https://cdn.shopify.com/s/files/1/0807/2298/5274/files/All_Men_s_2.jpg?v=1739310814",
      gender: "Men"
    },
    {
      id: 2,
      title: "All Women's",
      image: "https://cdn.shopify.com/s/files/1/0807/2298/5274/files/All_Women_s_1.jpg?v=1739310811",
      gender: "Women"
    },
    {
      id: 3,
      title: "All Kids'",
      image: "https://qikify-cdn.nyc3.cdn.digitaloceanspaces.com/production/tmenu/instances/254952/9d70d1e3893847f413746d1c993f52325ed8d67c2cf3e626d685cdac2ef3d315.jpeg",
      gender: "Kids"
    }
  ];

  const handleGenderClick = (gender) => {
    router.push(`/productListing/searchResults?gender=${gender.toLowerCase()}`);
  };

  return (
    <Box sx={{ width: '100%', py: 4, px: { xs: 2, md: 8 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: { xs: 2, md: 4 },
          flexWrap: 'wrap'
        }}
      >
        {genderCategories.map((category) => (
          <FilterCard
            key={category.id}
            onClick={() => handleGenderClick(category.gender)}
            sx={{
              width: { xs: '100%', sm: '300px' },
              height: '400px',
            }}
          >
            <CardMedia
              component="img"
              image={category.image}
              alt={category.title}
              sx={{
                height: '100%',
                width: '100%',
                objectFit: 'cover'
              }}
            />
            <Overlay className="overlay">
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: 0,
                  right: 0,
                  textAlign: 'center'
                }}
              >
                <Typography
                  className="title"
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    transition: 'transform 0.3s ease',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.4)'
                  }}
                >
                  {category.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'white',
                    mt: 1,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.4)'
                  }}
                >
                  Shop Now
                </Typography>
              </Box>
            </Overlay>
          </FilterCard>
        ))}
      </Box>
    </Box>
  );
};

export default GenderFilter;
