"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { useRouter } from "next/navigation";
import CategorySelector from "@/components/categorySelector/category";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import styles from "./history.module.css";
import dynamic from "next/dynamic";

const DynamicComponent = dynamic(
  () => import("../../../components/DynamicComponent.js"),
  {
    loading: () => <CircularProgress size={24} sx={{ color: "white" }} />,
  }
);

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    startDate: "",
    search: "",
    month: "",
  });
  const [message, setMessage] = useState("");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id);

      if (filters.category) query = query.eq("category", filters.category);
      if (filters.type) query = query.eq("type", filters.type);
      if (filters.startDate) query = query.gte("date", filters.startDate);
      if (filters.search) query = query.ilike("notes", `%${filters.search}%`);

      const { data, error } = await query;

      if (error) setMessage(error.message);
      else {
        setTransactions(data);
        filterAndPrepareData(data);
        setButtonLoader(false);
      }
    };

    fetchTransactions();
  }, [filters, router]);

  const filterAndPrepareData = (data) => {
    const filteredData = data.filter((item) => {
      if (!filters.month) return true;
      const transactionMonth = new Date(item.date).getMonth() + 1;
      return transactionMonth === parseInt(filters.month);
    });

    const groupedData = filteredData.reduce((acc, transaction) => {
      const date = transaction.date.split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (transaction.type === "income") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }
      return acc;
    }, {});

    setChartData(
      Object.values(groupedData).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      )
    );
    setFilteredTransactions(filteredData);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (buttonLoader) {
    return <DynamicComponent />;
  }

  return (
    <Box className={styles.historyContainer}>
      <Typography variant="h4" gutterBottom className={styles.historyHeading}>
        Transaction History
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card className={styles.filtersCard}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontFamily: "raleway, serif",
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: "1.6rem",
                }}
              >
                Filters
              </Typography>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={filters.startDate || ""}
                onChange={handleFilterChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
              <TextField
                label="Search Notes"
                name="search"
                value={filters.search || ""}
                onChange={handleFilterChange}
                fullWidth
                margin="normal"
              />
              <CategorySelector
                value={filters.category || ""}
                onSelectCategory={(category) =>
                  setFilters({ ...filters, category })
                }
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={filters.type || ""}
                  onChange={handleFilterChange}
                  label="type"
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
              {/* Month Dropdown */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Month</InputLabel>
                <Select
                  name="month"
                  value={filters.month || ""}
                  onChange={handleFilterChange}
                  label="month"
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="1">January</MenuItem>
                  <MenuItem value="2">February</MenuItem>
                  <MenuItem value="3">March</MenuItem>
                  <MenuItem value="4">April</MenuItem>
                  <MenuItem value="5">May</MenuItem>
                  <MenuItem value="6">June</MenuItem>
                  <MenuItem value="7">July</MenuItem>
                  <MenuItem value="8">August</MenuItem>
                  <MenuItem value="9">September</MenuItem>
                  <MenuItem value="10">October</MenuItem>
                  <MenuItem value="11">November</MenuItem>
                  <MenuItem value="12">December</MenuItem>
                </Select>
              </FormControl>
              <Button
                onClick={() => {
                  setLoading(true);
                  setFilters({
                    category: "",
                    type: "",
                    startDate: "",
                    search: "",
                    month: "",
                  });
                  setLoading(false);
                }}
                variant="outlined"
                fullWidth
                className={styles.clearButton}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Clear Filters"
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Overview Section */}
        <Grid item xs={12} md={8}>
          <Card className={styles.chartCard}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontFamily: "raleway, serif", fontWeight: "bold", mb: 4 }}
              >
                Transaction Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#4caf50" name="Income" />
                  <Bar dataKey="expense" fill="#f44336" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* All Transactions Section */}
          <Typography
            variant="h6"
            gutterBottom
            className={styles.transactionsHeading}
            sx={{ fontFamily: "raleway, serif", fontWeight: "bold" }}
          >
            All Transactions
          </Typography>
          <div className={styles.transactionList}>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className={styles.transactionCard}>
                  <CardContent>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: "raleway, serif", fontWeight: "bold" }}
                    >
                      Date: {transaction.date.split("T")[0]}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: "raleway, serif", fontWeight: "bold" }}
                    >
                      Category: {transaction.category}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: "raleway, serif", fontWeight: "bold" }}
                    >
                      Type: {transaction.type}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: "kanit, serif", fontWeight: "bold" }}
                      className={
                        transaction.type === "income"
                          ? styles.incomeAmount
                          : styles.expenseAmount
                      }
                    >
                      Amount: $
                      {transaction.amount && !isNaN(transaction.amount)
                        ? transaction.amount.toFixed(2)
                        : "0.00"}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "raleway, serif", fontWeight: "bold" }}
                    >
                      Notes: {transaction.notes}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                className={styles.noTransactions}
              >
                No transactions found.
              </Typography>
            )}
          </div>
        </Grid>
      </Grid>

      {message && (
        <Typography
          variant="body2"
          color="error"
          className={styles.errorMessage}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
