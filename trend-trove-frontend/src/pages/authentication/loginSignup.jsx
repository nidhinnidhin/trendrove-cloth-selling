import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import SignupDrawer from "@/components/drawers/signupDrawer";
import LoginDrawer from "@/components/drawers/loginDrawer";
import logo from '../../media/logo.png';
import Image from "next/image";
import { useRouter } from "next/router";
import styled, { keyframes } from 'styled-components';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
`;

const MainWrapper = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  gap: 4rem;

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 1rem;
    gap: 2rem;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  animation: ${fadeIn} 1s ease-out;

  @media (max-width: 768px) {
    gap: 2rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const LogoContainer = styled.div`
  max-width: 180px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const LoginButton = styled(Button)`
  background: transparent;
  border: 2px solid #1a1a1a;
  color: #1a1a1a;

  &:hover {
    background: #1a1a1a;
    color: white;
  }
`;

const SignupButton = styled(Button)`
  background: #ff3366;
  border: 2px solid #ff3366;
  color: white;

  &:hover {
    background: #e62e5c;
    border-color: #e62e5c;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 51, 102, 0.2);
  }
`;

const HeroSection = styled.div`
  margin-top: 2rem;
`;

const MainHeading = styled.h1`
  font-size: 4rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #ff3366 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${fadeIn} 1s ease-out;

  @media (max-width: 1024px) {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const LocationText = styled.p`
  font-size: 1.5rem;
  opacity: ${props => props.fade ? 1 : 0};
  transition: opacity 0.5s ease;
  color: #666;

  span {
    color: #ff3366;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const SearchSection = styled.div`
  margin-top: 2rem;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  flex: 1;
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 4px 20px rgba(255, 51, 102, 0.15);
  }

  input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    outline: none;
  }

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #ff3366;
  }
`;

const ExploreButton = styled(Button)`
  background: #ff3366;
  color: white;
  border: none;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
  justify-content: center;

  &:hover {
    background: #e62e5c;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 51, 102, 0.2);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PopularCities = styled.p`
  color: #666;
  font-size: 0.9rem;

  span {
    color: #ff3366;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.3s ease;

    &:hover {
      color: #e62e5c;
    }
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${float} 3s ease-in-out infinite;

  @media (max-width: 1024px) {
    order: -1;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  @media (max-width: 1024px) {
    max-height: 400px;
  }
`;

const LoginSignup = () => {
  const [state, setState] = useState({
    right: false,
    login: false, 
  });

  const router = useRouter();
    
    useEffect(() => {
      let token = localStorage.getItem('usertoken');
      if(token){
        router.push('/')
      }
      else{
        router.push('/authentication/loginSignup')
      }
    },[])

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  const onCloseLoginDrawer = () => {
    setState({ ...state, login: false }); 
  };

  const onCloseSignupDrawer = () => {
    setState({ ...state, right: false });
  };

  const items = [
    "Thiruvananthapuram",
    "Kochi",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Kannur",
    "Alappuzha",
    "Palakkad",
    "Malappuram",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFade(false); 
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        setFade(true); 
      }, 500);
    }, 3000); 

    return () => clearInterval(intervalId); 
  }, [currentIndex]);

  return (
    <PageContainer>
      <MainWrapper>
        <LeftSection>
          <Header>
            <LogoContainer>
              <Image
                src={logo}
                height={75}
                width={180}
                alt="Company Logo"
                priority
                style={{ width: '100%', height: 'auto' }}
              />
            </LogoContainer>
            
            <ButtonGroup>
              <LoginButton onClick={toggleDrawer("login", true)}>
                Sign In
              </LoginButton>
              <SignupButton onClick={toggleDrawer("right", true)}>
                Get Started
              </SignupButton>
            </ButtonGroup>
          </Header>

          <HeroSection>
            <MainHeading>
              Your Fashion Journey Starts Here
            </MainHeading>
            <LocationText fade={fade}>
              Discover local fashion in <span>{items[currentIndex]}</span>
            </LocationText>
          </HeroSection>

          <SearchSection>
            <SearchContainer>
              <SearchInput>
                <LocationOnIcon />
                <input
                  type="text"
                  placeholder="Enter your delivery location"
                />
              </SearchInput>
              <ExploreButton>
                Explore Stores
                <ArrowForwardIcon />
              </ExploreButton>
            </SearchContainer>
            <PopularCities>
              Popular cities: <span>Kochi</span> • <span>Thiruvananthapuram</span> • <span>Kozhikode</span>
            </PopularCities>
          </SearchSection>
        </LeftSection>

        <RightSection>
          <ImageContainer>
            <img
              src="https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Fashion Banner"
            />
          </ImageContainer>
        </RightSection>
      </MainWrapper>

      <Drawer
        anchor="right"
        open={state["right"]}
        onClose={onCloseSignupDrawer}
      >
        <SignupDrawer open={state["right"]} onClose={onCloseSignupDrawer} />
      </Drawer>

      <Drawer
        anchor="right"
        open={state["login"]}
        onClose={onCloseLoginDrawer}
      >
        <LoginDrawer onClose={onCloseLoginDrawer} />
      </Drawer>
    </PageContainer>
  );
};

export default LoginSignup;
