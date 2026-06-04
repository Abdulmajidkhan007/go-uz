/**
 * AppShell — the authenticated layout. Permanent sidebar on desktop,
 * temporary drawer + top bar on mobile. Renders the routed page via <Outlet/>.
 */
import React, { useState } from 'react';
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
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { NavLink, Outlet } from 'react-router-dom';
import { paths } from '../router/paths';
import { useUiStore } from '../stores/uiStore';

const DRAWER_WIDTH = 248;

const NAV: ReadonlyArray<{ to: string; label: string; icon: React.ReactNode }> = [
  { to: paths.app.home, label: 'Home', icon: <HomeRoundedIcon /> },
  { to: paths.app.activity, label: 'Activity', icon: <ReceiptLongRoundedIcon /> },
  { to: paths.app.payments.root, label: 'Payments', icon: <PaymentsRoundedIcon /> },
  { to: paths.app.support.tickets, label: 'Support', icon: <SupportAgentRoundedIcon /> },
  { to: paths.app.profile.root, label: 'Profile', icon: <PersonRoundedIcon /> },
];

function NavList({ onNavigate }: { onNavigate?: () => void }): React.JSX.Element {
  return (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Toolbar>
        <Typography variant="h5" fontWeight={800} color="primary">
          Vroom
        </Typography>
      </Toolbar>
      <List>
        {NAV.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={onNavigate}
            sx={{
              '&.active': { bgcolor: 'action.selected', color: 'primary.main' },
              mx: 1,
              borderRadius: 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export function AppShell(): React.JSX.Element {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleScheme = useUiStore((s) => s.toggleColorScheme);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: 1, borderColor: 'divider' },
          }}
        >
          <NavList />
        </Drawer>
      ) : (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <NavList onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!isDesktop ? (
          <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar>
              <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={800} color="primary" sx={{ flex: 1 }}>
                Vroom
              </Typography>
              <IconButton onClick={toggleScheme} aria-label="Toggle theme">
                <DarkModeRoundedIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        ) : null}

        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
