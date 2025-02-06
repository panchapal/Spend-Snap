"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/supabase"
import { useRouter } from "next/navigation"
import { Typography, Button, Paper, Card, CardContent, Box, Grid, CircularProgress } from "@mui/material"
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import styles from "./dashboard.module.css"
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../../components/DynamicComponent.js'), {
  loading: () => <CircularProgress size={24} sx={{ color: "white" }} />,
});

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 })
  const [user, setUser] = useState(null)
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [buttonLoader, setButtonLoader] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const fetchUser = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
        } else {
          router.push('/login');
        }
      };
      setUser(user)

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (!error && data) {
        setTransactions(data)
        calculateSummary(data)
        generateMonthlyData(data)
        generateCategoryData(data)
        setLoading(false)  
      }
    }

    fetchData()
  }, [router])

  const calculateSummary = (transactions) => {
    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    setSummary({ income, expense, balance: income - expense })
  }

  const generateMonthlyData = (transactions) => {
    const monthlySum = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!acc[monthYear]) {
        acc[monthYear] = { income: 0, expense: 0 }
      }

      if (transaction.type === "income") {
        acc[monthYear].income += transaction.amount
      } else {
        acc[monthYear].expense += transaction.amount
      }

      return acc
    }, {})

    const data = Object.entries(monthlySum).map(([monthYear, data]) => ({
      name: monthYear,
      income: data.income,
      expense: data.expense,
    }))

    setMonthlyData(data)
  }

  const generateCategoryData = (transactions) => {
    const categorySum = transactions.reduce((acc, transaction) => {
      if (transaction.type === "expense") {
        if (!acc[transaction.category]) {
          acc[transaction.category] = 0
        }
        acc[transaction.category] += transaction.amount
      }
      return acc
    }, {})

    const data = Object.entries(categorySum).map(([category, amount]) => ({
      name: category,
      value: amount,
    }))

    setCategoryData(data)
  }

  const handleAddTransaction = () => {
    setButtonLoader(true)
    setTimeout(() => {
      router.push("/dashboard/add-transaction")
      setButtonLoader(false)
    }, 1000)
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  if (loading) {
    return <DynamicComponent />  
  }

  return (
    <Box className={styles.dashboard}>
      <Typography variant="h4" gutterBottom className={styles.dashboardTitle}>
        Financial Dashboard
      </Typography>
      {user && (
        <Typography variant="subtitle1" gutterBottom className={styles.welcomeMessage}>
          Welcome, {user.email}
        </Typography>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card className={`${styles.summaryCard} ${styles.income}`}>
            <CardContent>
              <div className={styles.cardHeader}>
                <TrendingUp size={24} />
                <Typography variant="h6" className={styles.cardTitle}>
                  Total Income
                </Typography>
              </div>
              <Typography variant="h4" sx={{ fontFamily: "raleway, serif", fontSize: "1.6rem" }}>
                ${summary.income ? summary.income.toFixed(2) : "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className={`${styles.summaryCard} ${styles.expense}`}>
            <CardContent>
              <div className={styles.cardHeader}>
                <TrendingDown size={24} />
                <Typography variant="h6" className={styles.cardTitle}>
                  Total Expenses
                </Typography>
              </div>
              <Typography variant="h4" sx={{ fontFamily: "raleway, serif", fontSize: "1.6rem" }}>
                ${summary.expense ? summary.expense.toFixed(2) : "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className={`${styles.summaryCard} ${styles.balance}`}>
            <CardContent>
              <div className={styles.cardHeader}>
                <Wallet size={24} />
                <Typography variant="h6" className={styles.cardTitle}>
                  Balance
                </Typography>
              </div>
              <Typography variant="h4" sx={{ fontFamily: "raleway, serif", fontSize: "1.6rem" }}>
                ${summary.balance ? summary.balance.toFixed(2) : "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Income vs Expense Section */}
        <Grid item xs={12} md={6}>
          <Paper className={styles.chartContainer}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontFamily: "raleway, serif",
                fontSize: "1.3rem",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              Income vs Expenses
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => value.split("-")[1]}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "4px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                />
                <Area type="monotone" dataKey="income" stroke="#4caf50" fill="#4caf50" fillOpacity={0.3} />
                <Area type="monotone" dataKey="expense" stroke="#f44336" fill="#f44336" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Expense Categories Section*/}
        <Grid item xs={12} md={6}>
          <Paper className={styles.chartContainer}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontFamily: "raleway, serif",
                fontSize: "1.3rem",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              Expense Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Transactions Section */}
        <Grid item xs={12}>
          <Paper className={styles.transactionsContainer}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontFamily: "raleway, serif",
                fontSize: "1.6rem",
                fontWeight: "bold",
              }}
            >
              Recent Transactions
            </Typography>
            {transactions.length > 0 ? (
              <Grid container spacing={2} className={styles.recentTransactions}>
                {transactions.slice(0, 3).map((transaction) => (
                  <Grid item xs={12} sm={4} key={transaction.id}>
                    <Box className={styles.transaction}>
                      <div className={styles.transactionInfo}>
                        <Typography variant="body1" className={styles.transactionDate}>
                          {transaction.date}
                        </Typography>
                        <Typography variant="body2" className={styles.transactionCategory}>
                          {transaction.category}
                        </Typography>
                      </div>
                      <div className={styles.transactionAmount}>
                        {transaction.type === "income" ? (
                          <ArrowUpCircle size={20} className={styles.incomeIcon} />
                        ) : (
                          <ArrowDownCircle size={20} className={styles.expenseIcon} />
                        )}
                        <Typography
                          variant="body2"
                          className={transaction.type === "income" ? styles.incomeAmount : styles.expenseAmount}
                          sx={{ fontFamily: "kanit, serif" }}
                        >
                          ${transaction.amount ? transaction.amount.toFixed(2) : "0.00"}
                        </Typography>
                      </div>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" className={styles.noTransaction}>
                No transactions found.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box textAlign="center" marginTop={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddTransaction}
          className={styles.addTransactionButton}
          disabled={buttonLoader}
        >
          {buttonLoader ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Add New Transaction"}
        </Button>
      </Box>
    </Box>
  )
}
