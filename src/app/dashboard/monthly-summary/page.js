"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/supabase"
import { useRouter } from "next/navigation"
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { AttachMoney, MoneyOff, Savings } from "@mui/icons-material"
import styles from "./summary.module.css"
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../../../components/DynamicComponent.js'), {
  loading: () => <CircularProgress size={24} sx={{ color: "white" }} />,
});

export default function MonthlySummary() {
  const [allData, setAllData] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [loading, setLoading] = useState(true)
  const [loader, setLoader]= useState(false)
  const [buttonLoader, setButtonLoader]= useState(true)

  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString()
    const endOfYear = new Date(now.getFullYear(), 11, 31).toISOString()

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startOfYear)
      .lte("date", endOfYear)

    if (error) {
      console.error(error)
      setLoading(false)
      setButtonLoader(false)
      return
    }

    const monthlyData = Array(12)
      .fill()
      .map(() => ({
        income: 0,
        expense: 0,
        savings: 0,
        categorySpending: {},
        transactions: [],
      }))

    transactions.forEach((transaction) => {
      const month = new Date(transaction.date).getMonth()
      const monthData = monthlyData[month]

      if (transaction.type === "income") {
        monthData.income += transaction.amount
      } else {
        monthData.expense += transaction.amount
        monthData.categorySpending[transaction.category] =
          (monthData.categorySpending[transaction.category] || 0) + transaction.amount
      }

      monthData.transactions.push(transaction)
    })

    monthlyData.forEach((month) => {
      month.savings = month.income - month.expense
      month.categorySpending = Object.entries(month.categorySpending)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    })

    setAllData(monthlyData)
    setLoading(false)
    setButtonLoader(false)
  }

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value)
  }

  const exportCSV = () => {
    setLoader(true)
    const data = allData[selectedMonth]
    const csv = [["Category", "Amount"], ...data.categorySpending.map(({ name, value }) => [name, value])]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `monthly_summary_${selectedMonth + 1}.csv`
    link.click()
    setLoader(false)
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]
  const months = ["January","February","March","April","May","June","July","August","September","October","November", "December"]

  if (buttonLoader) {
    return <DynamicComponent />  
  }
  const data = allData[selectedMonth]

  return (
    <Box className={styles.monthlyContainer}>
      <Typography variant="h4" className={styles.monthlyHeading}>
        Monthly Summary
      </Typography>

      <FormControl fullWidth className={styles.monthSelector}>
        <InputLabel id="month-select-label">Select Month</InputLabel>
        <Select
          labelId="month-select-label"
          id="month-select"
          value={selectedMonth}
          label="Select Month"
          onChange={handleMonthChange}
        >
          {months.map((month, index) => (
            <MenuItem key={month} value={index}>
              {month}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper className={styles.summaryPaper}>
            <Box className={styles.summaryItem}>
              <AttachMoney className={styles.summaryIcon} />
              <Box>
                <Typography variant="h6" sx={{ fontFamily: "kanit, serif", fontSize: "1.6rem" }}>
                  Income
                </Typography>
                <Typography variant="h4" className={styles.incomeText}>
                  ${data.income.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={styles.summaryPaper1}>
            <Box className={styles.summaryItem1}>
              <MoneyOff className={styles.summaryIcon1} />
              <Box>
                <Typography variant="h6" sx={{ fontFamily: "kanit, serif", fontSize: "1.6rem" }}>
                  Expenses
                </Typography>
                <Typography variant="h4" className={styles.expensesText}>
                  ${data.expense.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={styles.summaryPaper2}>
            <Box className={styles.summaryItem2}>
              <Savings className={styles.summaryIcon2} />
              <Box>
                <Typography variant="h6" sx={{ fontFamily: "kanit, serif", fontSize: "1.6rem" }}>
                  Savings
                </Typography>
                <Typography variant="h4" className={styles.savingsText}>
                  ${data.savings.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} className={styles.chartsContainer}>
        <Grid item xs={12} md={6}>
          <Paper className={styles.chartPaper}>
            <Typography variant="h5" className={styles.sectionHeading}>
              Category Spending
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.categorySpending.slice(0, 5)}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {data.categorySpending.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className={styles.chartPaper}>
            <Typography variant="h5" className={styles.sectionHeading}>
              Expense Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categorySpending.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.categorySpending.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Box className={styles.exportButtonContainer}>
        <Button 
          variant="contained" 
          className={styles.exportButton} 
          onClick={exportCSV} 
          sx={{ fontFamily: "raleway, serif" }}
          disabled={loader}
        >
          {loader ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Export CSV"}
        </Button>
      </Box>
    </Box>
  )
}
