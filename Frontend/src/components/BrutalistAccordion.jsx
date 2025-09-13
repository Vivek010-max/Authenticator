import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { RxChevronDown } from "react-icons/rx";
import { useTheme as useCustomTheme } from "../context/ThemeContext";

// Motion-enhanced MUI Accordion
const MotionAccordion = motion.create(Accordion);

const accordionData = [
  {
    id: "panel1",
    title: "Getting Started",
    content: "Quick introduction to our platform with essential setup steps.",
  },
  {
    id: "panel2",
    title: "Key Features",
    content: "Explore powerful tools designed to enhance your workflow.",
  },
  {
    id: "panel3",
    title: "Best Practices",
    content: "Learn proven strategies for optimal performance and results.",
  },
];

export default function BrutalistAccordion() {
  const muiTheme = useMuiTheme();
  const { theme } = useCustomTheme();
  const isMd = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Determine dark mode based on context or system preference
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [expandedPanels, setExpandedPanels] = useState({});

  const handleChange = (panel) => (event, isExpanded) => {
    setExpandedPanels((prev) => ({ ...prev, [panel]: isExpanded }));
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 700, mx: "auto" }}>
      {accordionData.map((item, index) => (
        <MotionAccordion
          key={item.id}
          expanded={expandedPanels[item.id] || false}
          onChange={handleChange(item.id)}
          disableGutters
          elevation={0}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          sx={{
            backgroundColor: isDark ? "#111" : "#FFF",
            border: "2px solid",
            borderColor: isDark ? "#FFF" : "#111",
            color: isDark ? "#FFF" : "#111",
            boxShadow: `4px 4px 0 ${isDark ? "#FFF" : "#111"}`,
            borderRadius: 0,
            mb: 2,
            transition: "all 0.3s",
            "&:hover": { boxShadow: `6px 6px 0 ${isDark ? "#FFF" : "#111"}` },
            "&::before": { display: "none" },
            "&.Mui-expanded": {
              margin: "0 0 16px 0",
              boxShadow: `2px 2px 0 ${isDark ? "#FFF" : "#111"}`,
            },
          }}
        >
          <AccordionSummary
            expandIcon={
              <motion.div
                initial={false}
                animate={{ rotate: expandedPanels[item.id] ? 180 : 0 }}
                transition={{ type: "tween", duration: 0.25 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isDark ? "#FFF" : "#111",
                }}
              >
                <RxChevronDown size={22} />
              </motion.div>
            }
            sx={{
              backgroundColor: "transparent",
              minHeight: 56,
              color: isDark ? "#FFF" : "#111",
              "& .MuiAccordionSummary-content": { margin: "12px 0" },
            }}
          >
            <Typography variant="h6" fontWeight={500}>
              {item.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              borderTop: "1px solid",
              borderColor: isDark ? "#FFF" : "#111",
              backgroundColor: "transparent",
              color: isDark ? "#FFF" : "#111",
            }}
          >
            <Typography variant="body2">{item.content}</Typography>
          </AccordionDetails>
        </MotionAccordion>
      ))}
    </Box>
  );
}
