import React from 'react';
import { Box, Modal, Typography, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { LocalShipping, Check } from '@mui/icons-material';

// lkhj
const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const LoaderCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: theme.spacing(4),
  width: '90%',
  maxWidth: '440px',
  outline: 'none',
  boxShadow: theme.shadows[5],
}));

const ProcessStep = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const StepIcon = styled(motion.div)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  color: 'white',
}));

const ProgressTrack = styled(Box)(({ theme }) => ({
  flex: 1,
  height: 4,
  backgroundColor: theme.palette.grey[100],
  borderRadius: 2,
  position: 'relative',
  overflow: 'hidden',
}));

const DeliveryLoader = ({ open }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const steps = [
    { icon: <LocalShipping />, label: 'Processing Order' },
    { icon: <Check />, label: 'Order Confirmed' }
  ];

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setCurrentStep(1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <StyledModal
      open={open}
      BackdropProps={{
        style: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)'
        }
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <LoaderCard>
          <Typography variant="h6" sx={{ mb: 4, textAlign: 'center', fontWeight: 600 }}>
            Placing Your Order
          </Typography>

          {steps.map((step, index) => (
            <ProcessStep key={index}>
              <StepIcon
                variants={iconVariants}
                initial="initial"
                animate={currentStep >= index ? "animate" : "initial"}
                style={{
                  backgroundColor: currentStep >= index ? '#1976d2' : '#e0e0e0'
                }}
              >
                {step.icon}
              </StepIcon>
              
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    color: currentStep >= index ? 'text.primary' : 'text.secondary',
                    fontWeight: currentStep >= index ? 500 : 400
                  }}
                >
                  {step.label}
                </Typography>
                
                {index < steps.length - 1 && (
                  <ProgressTrack>
                    <LinearProgress
                      variant="indeterminate"
                      sx={{
                        height: '100%',
                        visibility: currentStep === index ? 'visible' : 'hidden'
                      }}
                    />
                  </ProgressTrack>
                )}
              </Box>
            </ProcessStep>
          ))}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: 'center' }}
          >
            {currentStep === 0 ? 'Please wait while we process your order...' : 'Redirecting to your orders...'}
          </Typography>
        </LoaderCard>
      </motion.div>
    </StyledModal>
  );
};

export default DeliveryLoader;