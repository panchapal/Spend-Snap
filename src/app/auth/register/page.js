"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/supabase";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmailIcon from "@mui/icons-material/Email";
import HttpsIcon from "@mui/icons-material/Https";
import styles from "./Register.module.css";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    setLoading(true);
    const { email, password } = data;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoading(false);
      toast.error("Invalid email address");
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      toast.error("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registration successful. Check your email to confirm.");
      setTimeout(() => router.replace("/auth/login"), 3000);
    }
  };

  return (
    <Box className={styles.registerPage}>
      <Grid className={styles.registerContainer}>
        <Box className={styles.registerImage} />

        <Container maxWidth="sm" className={styles.registerForm}>
          <Box className={styles.registerFormBox}>
            <Typography variant="h4" gutterBottom>
              Register
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    sx={inputStyles(errors.email)}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    error={!!errors.password}
                    sx={inputStyles(errors.password)}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
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
                    type="submit"
                    variant="contained"
                    fullWidth
                    className={styles.registerButton}
                    disabled={loading}
                    sx={{
                      backgroundColor: loading ? "#f4f0fb" : "#843ffb",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "#fff" }} />
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", fontFamily: "raleway, serif" }}
                  >
                    Already have an account?{" "}
                    <Link href="/auth/login" className={styles.loginLink}>
                      Log in
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Container>
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


