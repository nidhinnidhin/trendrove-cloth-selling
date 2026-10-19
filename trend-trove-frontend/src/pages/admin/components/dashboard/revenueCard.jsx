import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

const RevenueCard = ({
  title = '',
  amount = 0,
  percent = null,
  icon: IconComponent,
  color = "#FF9800",
  isCurrency = null,
}) => {
  const isMoney =
    isCurrency !== null
      ? isCurrency
      : /revenue|profit|discount|sales|cost|fee|refund|amount|mrp/i.test(title);

  const formattedAmount =
    typeof amount === "number"
      ? isMoney
        ? `₹${amount.toLocaleString("en-IN")}`
        : amount.toLocaleString("en-IN")
      : amount;

  const isPositiveTrend = percent && percent.includes("+");
  const isNegativeTrend = percent && percent.includes("-");

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color}35 0%, ${color}80 100%)`,
        height: "100%",
        borderRadius: 2.5,
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${color}40`,
        transition: "transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 10px 24px ${color}30`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: "rgba(255,255,255,0.85)", fontSize: "0.95rem" }}
          >
            {title}
          </Typography>
          {IconComponent && (
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.18)",
                borderRadius: "50%",
                p: 0.8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconComponent sx={{ fontSize: 20, color: "#FFFFFF" }} />
            </Box>
          )}
        </Box>

        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
          {formattedAmount}
        </Typography>

        {percent && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
            {isPositiveTrend ? (
              <TrendingUp sx={{ color: "#81C784", fontSize: 18 }} />
            ) : isNegativeTrend ? (
              <TrendingDown sx={{ color: "#EF5350", fontSize: 18 }} />
            ) : null}
            <Typography
              variant="caption"
              sx={{
                color: isPositiveTrend
                  ? "#81C784"
                  : isNegativeTrend
                  ? "#EF5350"
                  : "rgba(255,255,255,0.75)",
                fontWeight: 600,
                fontSize: "0.8rem",
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
