import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

const RevenueCard = ({
  title = '',
  amount = 0,
  percent = null,
  icon: IconComponent,
  color = "#FF9800",
}) => {
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color}40 0%, ${color}90 100%)`,
        
        height: "100%",
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: `0 8px 24px ${color}40`,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
          >
            {title}
          </Typography>
          {IconComponent && (
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconComponent sx={{ fontSize: 24 }} />
            </Box>
          )}
        </Box>

        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
          {typeof amount === "number"
            ? amount.toLocaleString("en-IN", {
                style: title.toLowerCase().includes("revenue")
                  ? "currency"
                  : "decimal",
                currency: "INR",
              })
            : amount}
        </Typography>

        {percent && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {percent.includes("+") ? (
              <TrendingUp sx={{ color: "#4caf50" }} />
            ) : (
              <TrendingDown sx={{ color: "#f44336" }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: percent.includes("+") ? "#4caf50" : "#f44336",
                fontWeight: "bold",
              }}
            >
              {percent}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueCard;
