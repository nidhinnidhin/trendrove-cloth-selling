import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import AttachMoney from "@mui/icons-material/AttachMoney";
import ShoppingBag from "@mui/icons-material/ShoppingBag";
import Person from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOffer from "@mui/icons-material/LocalOffer";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Discount from "@mui/icons-material/Discount";
import Campaign from "@mui/icons-material/Campaign";
import ViewCarousel from "@mui/icons-material/ViewCarousel";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";

const DRAWER_WIDTH = 260;

const colors = {
  bg: "#1E1F23",
  border: "rgba(255,255,255,0.08)",
  text: "#B8BBC2",
  textStrong: "#FFFFFF",
  hover: "rgba(255,255,255,0.06)",
  accent: "#FF9800",
  accentSoft: "rgba(255,152,0,0.14)",
};

// Grouped so related pages sit together and the list is easier to scan
const menuGroups = [
  {
    label: "Overview",
    items: [{ text: "Sales Summary", icon: AttachMoney }],
  },
  {
    label: "Catalog",
    items: [
      { text: "Products", icon: ShoppingBag },
      { text: "Categories", icon: CategoryIcon },
      { text: "Brands", icon: LocalOffer },
    ],
  },
  {
    label: "Sales",
    items: [
      { text: "Orders", icon: LocalShipping },
      { text: "Coupons", icon: Discount },
      { text: "Offers", icon: Campaign },
    ],
  },
  {
    label: "Customers",
    items: [
      { text: "Users", icon: Person },
      { text: "Chats", icon: ChatBubbleOutline },
    ],
  },
  {
    label: "Content",
    items: [{ text: "Banners", icon: ViewCarousel }],
  },
];

export default function SidebarDrawer({ selectedTopic, setSelectedTopic }) {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          backgroundColor: colors.bg,
          borderRight: `1px solid ${colors.border}`,
          color: colors.text,
        },
      }}
    >
      {/* Brand / title area */}
      <Box
        sx={{
          px: 3,
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            backgroundColor: colors.accent,
            color: "#1E1F23",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          A
        </Box>
        <Typography
          variant="subtitle1"
          sx={{ color: colors.textStrong, fontWeight: 600 }}
        >
          Admin Panel
        </Typography>
      </Box>

      {/* Scrollable navigation */}
      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.5,
          py: 2,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 3,
          },
        }}
      >
        {menuGroups.map((group) => (
          <Box key={group.label} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                px: 1.5,
                mb: 0.5,
                color: "rgba(255,255,255,0.45)",
                fontWeight: 500,
                letterSpacing: 0.3,
              }}
            >
              {group.label}
            </Typography>

            <List disablePadding>
              {group.items.map(({ text, icon: Icon }) => {
                const selected = selectedTopic === text;
                return (
                  <ListItemButton
                    key={text}
                    selected={selected}
                    onClick={() => setSelectedTopic(text)}
                    aria-current={selected ? "page" : undefined}
                    sx={{
                      position: "relative",
                      borderRadius: "8px",
                      mb: 0.5,
                      px: 1.5,
                      py: 1,
                      color: selected ? colors.accent : colors.text,
                      transition: "background-color .15s, color .15s",
                      "&:hover": {
                        backgroundColor: colors.hover,
                        color: colors.textStrong,
                      },
                      "&.Mui-selected": {
                        backgroundColor: colors.accentSoft,
                        color: colors.accent,
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: colors.accentSoft,
                        color: colors.accent,
                      },
                      "&.Mui-focusVisible": {
                        outline: `2px solid ${colors.accent}`,
                        outlineOffset: 1,
                      },
                      // Active indicator bar on the left edge
                      "&.Mui-selected::before": {
                        content: '""',
                        position: "absolute",
                        left: -12,
                        top: 8,
                        bottom: 8,
                        width: 3,
                        borderRadius: "0 3px 3px 0",
                        backgroundColor: colors.accent,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{ minWidth: 38, color: "inherit" }}
                    >
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={text}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: selected ? 600 : 500,
                        noWrap: true,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}
