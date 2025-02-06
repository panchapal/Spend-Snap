"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { supabase } from '@/supabase';
import Image from 'next/image';

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transaction', path: '/dashboard/add-transaction' },
    { label: 'History', path: '/dashboard/transHistory' },
    { label: 'Budget', path: '/dashboard/budget-setting' },
    { label: 'Monthly', path: '/dashboard/monthly-summary' },
  ];

  const handleNavigate = async (path) => {
    setLoadingButton(path);
    await new Promise(resolve => setTimeout(resolve, 500));  
    router.push(path);
    setDrawerOpen(false);
    setLoadingButton(null);
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setLoadingButton('logout');
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    router.push("/auth/login");
    setLoadingButton(null);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundImage: "linear-gradient(90deg, rgba(244,240,251,1) 0%, rgba(242,239,233,1) 93%)", boxShadow: "none" }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ flexShrink: 0, fontFamily: "kanit, serif", fontWeight: "bold", color: "black" }}>
          Spend<span style={{ fontStyle: "italic", color: "rgb(89, 64, 250)" }}>Snap</span>
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            {isAuthenticated &&
              menuItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => handleNavigate(item.path)}
                  sx={{ color: 'black', fontFamily: 'kanit, serif', fontSize: '1rem', textTransform: 'none', '&:hover': { backgroundColor: '#bfbebd' } }}
                >
                  {item.label}              
                </Button>
              ))}
          </Box>

          {isAuthenticated ? (
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ display: { xs: "none", md: "inline-flex" }, color: 'white', fontFamily: "raleway, serif", fontWeight: "bold", backgroundColor: 'rgb(89, 64, 250)', textTransform: 'none', '&:hover': { backgroundColor: 'rgb(72, 50, 200)' } }}
            >
              {loadingButton === 'logout' ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Logout'}
            </Button>
          ) : (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button
                onClick={() => handleNavigate('/auth/register')}
                sx={{ color: 'white', fontFamily: "raleway, serif", fontWeight: "bold", backgroundColor: 'rgb(89, 64, 250)', textTransform: 'none', '&:hover': { backgroundColor: 'rgb(72, 50, 200)' } }}
                variant="contained"
              >
                {loadingButton === '/auth/register' ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Register'}
              </Button>
              <Button
                onClick={() => handleNavigate('/auth/login')}
                sx={{ color: 'white', fontFamily: "raleway, serif", fontWeight: "bold", backgroundColor: 'rgb(89, 64, 250)', textTransform: 'none', '&:hover': { backgroundColor: 'rgb(72, 50, 200)' } }}
                variant="contained"
              >
                {loadingButton === '/auth/login' ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Login'}
              </Button>
            </Box>
          )}

          <Box sx={{ display: { xs: 'flex', md: 'none' }, color: "black" }}>
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, padding: 2, backgroundImage: "linear-gradient(90deg, rgba(244,240,251,1) 0%, rgba(220,216,228,1) 100%)", height: "100%" }}>
          <List>
            {isAuthenticated &&
              menuItems.map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton onClick={() => handleNavigate(item.path)}>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontFamily: 'raleway, serif', fontWeight: 'bold', fontSize: '1rem' }} />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                sx={{ color: 'white', fontFamily: "kanit, serif", fontWeight: "bold", backgroundColor: 'rgb(89, 64, 250)', textTransform: 'none', '&:hover': { backgroundColor: 'rgb(72, 50, 200)' } }}
              >
                {loadingButton === 'logout' ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Logout'}
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => handleNavigate('/auth/register')}
                  sx={{ color: 'white', fontFamily: "kanit, serif", fontWeight: "bold", backgroundColor: 'rgb(89, 64, 250)', textTransform: 'none', '&:hover': { backgroundColor: 'rgb(72, 50, 200)' } }}
                  variant="contained"
                >
                  {loadingButton === '/auth/register' ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Register'}
                </Button>
                <Button
                  onClick={() => handleNavigate('/auth/login')}
                  sx={{ color: 'white', fontFamily: "kanit, serif", fontWeight: "bold", backgroundColor: 'rgb(89, 64, 250)', textTransform: 'none', '&:hover': { backgroundColor: 'rgb(72, 50, 200)' } }}
                  variant="contained"
                >
                  {loadingButton === '/auth/login' ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Login'}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}