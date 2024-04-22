import React from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

function AppBarComponent() {
  const location = useLocation(); // Access current location

  const tabStyle = {
    color: 'white', // Default color for all tabs
    fontFamily: 'Gelasio',
    '&:hover': {
      color: '#99675f', // Color when hovered
    },
    '&.Mui-selected': {
      color: '#99675f', // Ensures the selected tab is always #99675f
      '&:hover': {
        color: '#99675f' // Ensures the hover on selected tab remains #99675f
      },
      '&:focus': {
        color: '#99675f' // Ensures the focus on selected tab remains #99675f
      }
    },
    '&:focus': {
      color: 'white', // Color on focus, for non-selected tabs
    }
  };
  
  // Determine which tab is active based on current path
  const getTabValue = () => {
    switch (location.pathname) {
      case '/':
        return 0;
      case '/in-discussion':
        return 1;
      case '/submitted':
        return 2;
      case '/passed':
        return 3;
      case '/failed':
        return 4;
      case '/vetoed':
        return 5;
      case '/search':
        return 6;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ padding: '20px', bgcolor: '#E1D6CB' }}>
      <AppBar position="static" sx={{ backgroundColor: '#510000', borderRadius: '10px'}}>
        <Toolbar>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1, fontFamily: 'Gelasio' }}>
            LAYMAN
          </Typography>
          <Tabs value={getTabValue()} onChange={() => {}} sx={{ flexGrow: 1, '.MuiTabs-indicator': { backgroundColor: '#99675f' }}} aria-label="legislation tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Introduced" component={Link} to="/" sx={tabStyle}/>
            <Tab label="In Discussion" component={Link} to="/in-discussion" sx={tabStyle}/>
            <Tab label="Submitted" component={Link} to="/submitted" sx={tabStyle}/>
            <Tab label="Passed" component={Link} to="/passed" sx={tabStyle}/>
            <Tab label="Failed" component={Link} to="/failed" sx={tabStyle}/>
            <Tab label="Vetoed" component={Link} to="/vetoed" sx={tabStyle}/>
          </Tabs>
          <Tab label="Search" /> {/* Additional Tab for Search to the right */}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default AppBarComponent;
