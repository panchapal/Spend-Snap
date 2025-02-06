"use client"

import { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { useRouter } from "next/navigation";
import {
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  LinearProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import styles from "./budget.module.css";
import dynamic from 'next/dynamic';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DynamicComponent = dynamic(() => import('../../../components/DynamicComponent.js'), {
  loading: () => <CircularProgress size={24} sx={{ color: "white" }} />,
});

export default function BudgetSetting() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState({});
  const [newBudget, setNewBudget] = useState({ category: "", amount: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [Loader, setLoader] = useState(false);
  const [buttonLoader, setButtonLoader]= useState(true)

  const predefinedCategories = ["Food", "Travel", "Utilities", "Shopping"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    try {
      const [customCategories, budgets, transactions] = await Promise.all([
        fetchCategories(user.id),
        fetchBudgets(user.id),
        fetchTransactions(user.id),
      ]);

      setCategories([ ...predefinedCategories.map((name) => ({ name })), ...customCategories ]);
      setBudgets(budgets); 
      setTransactions(groupByCategory(transactions));
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setButtonLoader(false)
    }
  };

  const fetchCategories = async (userId) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data;
  };

  const fetchBudgets = async (userId) => {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });  
    if (error) throw error;
    return data;
  };

  const fetchTransactions = async (userId) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data;
  };

  const groupByCategory = (data) => {
    return data.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = { total: 0, count: 0 };
      acc[item.category].total += item.amount;
      acc[item.category].count += 1;
      return acc;
    }, {});
  };

  const handleSetBudget = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !newBudget.category || !newBudget.amount) {
      setMessage("Please provide valid category and amount.");
      return;
    }
    setLoader(true);
    try {
      const currentTimestamp = new Date().toISOString();

      const latestBudget = budgets.find(b => b.category === newBudget.category);

      const { data, error } = await supabase.from("budgets").upsert({
        user_id: user.id,
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        created_at: currentTimestamp,  
      });

      if (error) throw error;

      setBudgets((prev) => [
        ...prev,
        { user_id: user.id, category: newBudget.category, amount: parseFloat(newBudget.amount), created_at: currentTimestamp, },
      ]);

      setNewBudget({ category: "", amount: "" });

      toast.success("Budget set successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoader(false);
    }
  };

  const chartData = categories.map((category) => ({
    name: category.name,
    budget: budgets.filter(b => b.category === category.name).reduce((sum, b) => sum + b.amount, 0),
    spent: transactions[category.name]?.total || 0,
  }));

  if (buttonLoader) {
    return <DynamicComponent />  
  }
  
  return (
    <div className={styles.budgetContainer}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
      <Typography variant="h4" className={styles.budgetHeader}>
        Budget Settings
      </Typography>
      <Box className={styles.budgetForm}>
        <Select
          value={newBudget.category}
          onChange={(e) =>
            setNewBudget({ ...newBudget, category: e.target.value })
          }
          displayEmpty
          fullWidth
          sx={{ minWidth: 100 }}
        >
          <MenuItem value="">
            <em>Select Category</em>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.name} value={category.name}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
        <TextField
          type="number"
          placeholder="Amount"
          value={newBudget.amount}
          onChange={(e) =>
            setNewBudget({ ...newBudget, amount: e.target.value })
          }
          fullWidth
          sx={{ minWidth: 100 }}
        />
        <Button
          variant="contained"
          onClick={handleSetBudget}
          className={styles.budgetButton}
          disabled={Loader}
          fullWidth
        >
          {Loader ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            "Set Budget"
          )}
        </Button>
      </Box>
      {message && (
        <Typography color="error" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}
      <div className={styles.budgetOverview}>
        {categories.map((category) => {
          const budgetAmount = budgets.filter(b => b.category === category.name).reduce((sum, b) => sum + b.amount, 0);
          const spentAmount = transactions[category.name]?.total || 0;
          const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
          const budgetMessage = budgetAmount > spentAmount ? "You are under budget" : "Your budget is exceeded";

          return (
            <Box key={category.name} className={styles.budgetCard}>
              <Typography className={styles.cardTitle}>
                {category.name}
              </Typography>
              <div className={styles.cardContent}>
                <div>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: "raleway, serif", fontWeight: "bold" }}
                  >
                    Budget
                  </Typography>
                  <Typography className={styles.budgetAmount}>
                    ${budgetAmount}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">Spent</Typography>
                  <Typography className={styles.spentAmount}>
                    ${spentAmount}
                  </Typography>
                </div>
              </div>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: percentage > 100 ? "#f44336" : "#4caf50",
                  },
                }}
              />
              <Typography
                className={styles.transactionCount}
                sx={{
                  fontFamily: "raleway, serif",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#757575",
                }}
              >
                Transactions: {transactions[category.name]?.count || 0}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "raleway, serif",
                  fontWeight: "bold",
                  color: budgetAmount > spentAmount ? "#4caf50" : "#f44336",
                }}
              >
                {budgetMessage}
              </Typography>
            </Box>
          );
        })}
      </div>
      <Box className={styles.budgetChart}>
        <Typography variant="h5" className={styles.chartTitle}>
          Budget vs Spending
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="budget" fill="#4caf50" name="Budget" />
            <Bar dataKey="spent" fill="#f44336" name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </div>
  );
}
