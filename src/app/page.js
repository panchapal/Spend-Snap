import { Button, Typography, Grid, Container, Box } from "@mui/material"
import Image from "next/image"
import styles from "./page.module.css"

const Home = () => {
  return (
    <div className={styles.container}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center" className={styles.heroSection}>
          <Grid item xs={12} md={6}>
            <Typography variant="h1" className={styles.title}>
              Track Your Expenses
              <span className={styles.highlight}> Effortlessly</span>
            </Typography>
            <Typography variant="body1" className={styles.description}>
              Gain control of your finances with our intuitive expense tracker. Visualize your spending, set budgets,
              and achieve your financial goals.
            </Typography>
            <Box className={styles.buttonGroup}>
              <Button variant="contained" color="primary" className={styles.button}>
                Get Started
              </Button>
              <Button variant="outlined" color="primary" className={styles.button}>
                Learn More
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <div className={styles.imageWrapper}>
              <Image
                src="/images/banner.png"
                alt="Expense Tracker Illustration"
                width={500}
                height={500}
                className={styles.heroImage}
              />
            </div>
          </Grid>
        </Grid>
      </Container>

      <Box className={styles.features}>
        <Container maxWidth="lg">
          <Typography variant="h2" className={styles.featureTitle}>
            Key Features
          </Typography>
          <Grid container spacing={4}>
            {["Easy Expense Logging", "Budget Planning", "Monthly Updates"].map((feature, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Box className={styles.featureItem}>
                  <Typography variant="h3">{feature}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </div>
  )
}

export default Home

