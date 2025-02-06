"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase";
import { useForm } from "react-hook-form";
import {
  Grid,
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CircularProgress from "@mui/material/CircularProgress";
import styles from "./password.module.css";

export default function ForgotPassword() {
  const [message, setMessage] = useState("");
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleForgotPassword = async (data) => {
    const { email } = data;
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);

    if (error) {
      setMessage(error.message);
      toast.error(error.message);
    } else {
      setMessage(
        "Password reset email sent. Please check your inbox to set a new password."
      );
      setIsResetSuccessful(true);
      toast.success("Password reset email sent!");
      setTimeout(() => {
        router.push("/auth/new-password");
      }, 3000);
    }
  };

  return (
    <Box className={styles.forgotPage}>
      <Grid container className={styles.forgotContainer}>
        <Grid item xs={6} className={styles.leftSide}>
          <Box className={styles.paragraphBox}>
            <Typography variant="h5" className={styles.paragraphText}>
              Don&apos;t worry! If you&apos;ve forgotten your password, you can
              reset it quickly by entering your email below. You will receive an
              email with a link to set a new password.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} className={styles.rightSide}>
          <Container maxWidth="xs" className={styles.forgotForm}>
            <Box className={styles.forgotFormBox}>
              <Typography variant="h4" component="h4" gutterBottom>
                Forgot Password
              </Typography>
              <form onSubmit={handleSubmit(handleForgotPassword)}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email ? errors.email.message : ""}
                  sx={inputStyles(errors.email)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    ),
                  }}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  className={styles.forgotButton}
                  disabled={loading}
                  sx={{
                    backgroundColor: loading ? "#f4f0fb" : "#843ffb",
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>

              {message && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity={isResetSuccessful ? "success" : "error"}>
                    {message}
                  </Alert>
                </Box>
              )}
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
