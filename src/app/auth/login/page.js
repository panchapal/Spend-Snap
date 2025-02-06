"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/supabase";
import { useRouter } from "next/navigation";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  Box,
  Link,
  InputAdornment,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import HttpsIcon from "@mui/icons-material/Https";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CircularProgress from "@mui/material/CircularProgress";
import styles from "./login.module.css";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    const { email, password } = data;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (
        error.message.includes("invalid password") ||
        error.message.includes("invalid credentials")
      ) {
        setMessage(
          "The password you entered is incorrect. Please try again or reset your password."
        );
        toast.error("Invalid credentials, please try again!");
      } else {
        setMessage(error.message);
        toast.error(error.message);
      }
    } else {
      setMessage("");
      toast.success("Login successful!");
      router.replace("/dashboard");
    }
  };
  const handleForgotPassword = () => {
    router.replace("/auth/forgot-password");
  };

  return (
    <Box className={styles.loginPage}>
      <Grid container className={styles.loginContainer}>
        <Box className={styles.loginImage}></Box>

        <Container maxWidth="xs" className={styles.loginFormContainer}>
          <Box className={styles.formBox}>
            <Typography
              variant="h4"
              component="h1"
              className={styles.loginHeading}
            >
              Login
            </Typography>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={styles.loginForm}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    error={!!errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HttpsIcon sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                    }}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters long",
                      },
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    className={styles.loginButton}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "#fff" }} />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </Grid>
                {message && (
                  <Grid item xs={12}>
                    <Alert severity="error">{message}</Alert>
                  </Grid>
                )}
              </Grid>
            </form>
            <Grid item xs={12} textAlign="center">
              <Link
                component="button"
                variant="body2"
                onClick={handleForgotPassword}
                underline="hover"
                sx={{
                  fontFamily: "Raleway, serif",
                  fontWeight: "bold",
                  mt: 2,
                  mb: 1,
                }}
              >
                Forgot Password?
              </Link>
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Typography variant="body2" sx={{ fontFamily: "Raleway, serif" }}>
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className={styles.registerLink}>
                  Register
                </Link>
              </Typography>
            </Grid>
          </Box>
        </Container>
      </Grid>
      <ToastContainer position="top-center" autoClose={2000} />
    </Box>
  );
}
