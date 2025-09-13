import React, { useEffect, useState } from "react";
import { Box, useMediaQuery, useTheme as useMuiTheme } from "@mui/material";
import { useTheme as useCustomTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const GeminiWave = ({ children }) => {
  const muiTheme = useMuiTheme();
  const { theme } = useCustomTheme();
  // Use ThemeContext directly for dark mode
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const isMd = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Define gradients for light and dark mode
  const lightGradient = "linear-gradient(135deg, #92EFFD, #4E65FF)";
  const darkGradient = "linear-gradient(135deg, #0F111A, #2E3A6F)";


  return (
    <Box
      sx={{
        width: "100%",
        minHeight: isMd ? "60vh" : "100vh",
  background: isDark ? darkGradient : lightGradient,
        position: "relative",
        overflow: "hidden",
        transition: "background 0.5s ease",
      }}
    >
      {/* Waves in background */}
      <Box
        sx={{
          position: "absolute",
          width: isMd ? "200%" : "150%",
          height: "100%",
          left: isMd ? "-50%" : "-25%",
          top: 0,
        }}
      >
        {[...Array(3)].map((_, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: isMd ? -100 : -145,
              opacity: 0.7 - index * 0.2,
            }}
          >
            <svg
              viewBox="0 0 1440 320"
              style={{ position: "absolute", width: "100%", height: "100%" }}
            >
              <motion.path
                d="M0,160 C320,300,420,240,640,160 C880,80,1200,220,1440,200 V320 H0 Z"
                fill={
                  isDark
                    ? `rgba(173, 216, 230, ${0.2 - index * 0.05})` // darker bluish waves
                    : `rgba(255,255,255,${0.3 - index * 0.1})` // lighter waves
                }
                animate={{
                  d: [
                    "M0,160 C320,300,420,240,640,160 C880,80,1200,220,1440,200 V320 H0 Z",
                    "M0,200 C320,100,420,260,640,200 C880,140,1200,180,1440,240 V320 H0 Z",
                    "M0,160 C320,300,420,240,640,160 C880,80,1200,220,1440,200 V320 H0 Z",
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: isMd ? 8 - index * 1.5 : 10 - index * 2,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </Box>
        ))}
      </Box>

      {/* Actual content */}
      <div style={{ position: "relative", zIndex: 10, color: isDark ? "#fff" : "#222" }}>
        {children}
      </div>
    </Box>
  );
};

export default GeminiWave;
