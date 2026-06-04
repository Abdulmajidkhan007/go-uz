/**
 * AdminShell — desktop-first operator layout: permanent sidebar + top bar.
 */
import React from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { NavLink, Outlet } from 'react-router-dom';
import { paths } from '../paths';
import { useAdminStore } from '../store';

const DRAWER_WIDTH = 240;

const NAV: ReadonlyArray<{ to: string; label: string; icon: React.ReactNode }> = [
  { to: paths.dashboard, label: 'Dashboard', icon: <DashboardRoundedIcon /> },
  { to: paths.orders, label: 'Orders', icon: <ReceiptLongRoundedIcon /> },
  { to: paths.tickets, label: 'Support', icon: <SupportAgentRoundedIcon /> },
];

export function AdminShell(): React.JSX.Element {
  const toggleScheme = useAdminStore((s) => s.toggleColorScheme);
  const signOut = useAdminStore((s) => s.signOut);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: 1, borderColor: 'divider' },
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={800} color="primary">
            Vroom Admin
          </Typography>
        </Toolbar>
        <List>
          {NAV.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{ '&.active': { bgcolor: 'action.selected', color: 'primary.main' }, mx: 1, borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar sx={{ gap: 1 }}>
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={toggleScheme} aria-label="Toggle theme">
              <DarkModeRoundedIcon />
            </IconButton>
            <IconButton onClick={signOut} aria-label="Sign out">
              <LogoutRoundedIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
