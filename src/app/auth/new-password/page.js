"use client";

import { useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  InputAdornment,
} from "@mui/material";
import { supabase } from "@/supabase";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HttpsIcon from "@mui/icons-material/Https";
import CircularProgress from "@mui/material/CircularProgress";
import styles from "./newpass.module.css";

export default function NewPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSetNewPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("Please fill in both password fields.");
      toast.error("Please fill in both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      toast.error("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      setLoading(false);

      if (error) {
        setMessage(error.message);
        toast.error(error.message);
      } else {
        setMessage("Password has been updated successfully.");
        toast.success("Password updated successfully!");
        router.push("/auth/login");
      }
    } catch (error) {
      setLoading(false);
      setMessage(error.message);
      toast.error(error.message);
    }
  };

  return (
    <Box className={styles.newPasswordPage}>
      <Grid container className={styles.newPasswordContainer}>
        <Grid item xs={12} md={6} className={styles.leftSide}>
          <Box className={styles.paragraphBox}>
            <Typography variant="h5" className={styles.paragraphText}>
              Reset your password to regain access to your account.
              <br />
              Please ensure that your new password is at least 6 characters long
              and matches the confirmation.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} className={styles.rightSide}>
          <Container maxWidth="xs" className={styles.newPasswordForm}>
            <Box className={styles.newPasswordFormBox}>
              <Typography variant="h4" component="h4" gutterBottom>
                Reset Password
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={inputStyles(newPassword)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HttpsIcon sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Retype new password"
                    type="password"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={inputStyles(confirmPassword)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HttpsIcon sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    onClick={handleSetNewPassword}
                    variant="contained"
                    color="primary"
                    fullWidth
                    className={styles.newPasswordButton}
                    disabled={loading}
                    sx={{
                      backgroundColor: loading ? "#f4f0fb" : "#843ffb",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "#fff" }} />
                    ) : (
                      "Set New Password"
                    )}
                  </Button>
                </Grid>
                {message && (
                  <Box sx={{ mt: 2 }}>
                    <Alert
                      severity={
                        message === "Password has been updated successfully."
                          ? "success"
                          : "error"
                      }
                    >
                      {message}
                    </Alert>
                  </Box>
                )}
              </Grid>
            </Box>
          </Container>
        </Grid>
      </Grid>
      <ToastContainer position="top-center" autoClose={2000} />
    </Box>
  );
}

const inputStyles = (error) => ({
  "& .MuiInputBase-input": {
    color: "black",
  },
  "& .MuiInputLabel-root": {
    color: "#141413",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#3f51b5",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#141413",
    },
    "&:hover fieldset": {
      borderColor: "#141413",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#3f51b5",
    },
  },
  "& .MuiFormHelperText-root": {
    color: error ? "#d32f2f" : "white",
  },
});
