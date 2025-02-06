"use client";

import { useState } from "react";
import { supabase } from "@/supabase";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import CategorySelector from "@/components/categorySelector/category";
import styles from "./add.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";

const DynamicComponent = dynamic(
  () => import("../../../components/DynamicComponent.js"),
  {
    loading: () => <CircularProgress size={24} sx={{ color: "white" }} />,
  }
);

export default function AddTransaction() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("income");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [showDynamicComponent, setShowDynamicComponent] = useState(false);

  const router = useRouter();

  const handleAddTransaction = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You need to be logged in to add a transaction.");
      return;
    }

    setLoading(true);
    setButtonLoader(true);

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      amount: parseFloat(amount),
      category,
      type,
      notes,
      date,
    });

    setTimeout(() => {
      setButtonLoader(false);
      setShowDynamicComponent(true);
    }, 1500);

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Transaction added successfully!");
      router.push("/dashboard");
    }
  };

  if (showDynamicComponent) {
    return <DynamicComponent />;
  }

  return (
    <Box className={styles.addTransactionPage}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
      <Grid container className={styles.addTransactionContainer}>
        {/* Left Side - Information */}
        <Grid item xs={12} md={6} className={styles.infoSection}>
          <Box className={styles.infoBox}>
            <Typography variant="h4" component="h4" gutterBottom>
              Manage Your Finances Effectively
            </Typography>
            <Typography variant="body1" paragraph>
              Adding your transactions helps you keep track of your income and
              expenses. By regularly updating your records, you can monitor your
              spending habits, stay within your budget, and achieve your
              financial goals more efficiently.
            </Typography>
            <Typography variant="body1" paragraph>
              Make sure to categorize your transactions correctly and add any
              relevant notes for better clarity in the future. This will make it
              easier to analyze your financial data and plan accordingly.
            </Typography>
          </Box>
        </Grid>

        {/* Right Side - Form */}
        <Grid item xs={12} md={6}>
          <Container maxWidth="sm" className={styles.addTransactionForm}>
            <Box className={styles.formBox}>
              <Typography variant="h4" component="h4">
                Add Transaction
              </Typography>

              <Grid container spacing={2}>
                {/* Amount */}
                <Grid item xs={12}>
                  <TextField
                    label="Amount"
                    type="number"
                    fullWidth
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    variant="outlined"
                    sx={inputStyles(amount)}
                  />
                </Grid>

                {/* Category Selector */}
                <Grid item xs={12} sx={inputStyles(category)}>
                  <CategorySelector
                    onSelectCategory={(selectedCategory) =>
                      setCategory(selectedCategory)
                    }
                  />
                </Grid>

                {/* Type Selector */}
                <Grid item xs={12} sx={inputStyles(category)}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="income">Income</MenuItem>
                      <MenuItem value="expense">Expense</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Notes */}
                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    multiline
                    rows={4}
                    fullWidth
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    variant="outlined"
                    sx={inputStyles(notes)}
                  />
                </Grid>

                {/* Date */}
                <Grid item xs={12}>
                  <TextField
                    label="Date"
                    type="date"
                    fullWidth
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    variant="outlined"
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={inputStyles(date)}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleAddTransaction}
                    className={styles.addButton}
                    disabled={loading}
                  >
                    {buttonLoader ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      "Add Transaction"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Grid>
      </Grid>
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
