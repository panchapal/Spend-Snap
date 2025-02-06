import React, { useEffect, useState } from "react";
import { CircularProgress, Box, Typography } from "@mui/material";
const DynamicComponent = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setMessage("Content Loaded!");
    }, 3000);  

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      {loading ? (
        <>
          <CircularProgress size={50} sx={{ marginBottom: 2 }} />
          <Typography variant="h6" color="textSecondary">
            {message}
          </Typography>
        </>
      ) : (
        <Typography variant="h4" color="primary">
          Dynamic Content has been loaded successfully!
        </Typography>
      )}
    </Box>
  );
};

export default DynamicComponent;
