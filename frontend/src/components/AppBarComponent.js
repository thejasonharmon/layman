import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Tabs, 
  Tab, 
  CircularProgress,
  Backdrop,
  Snackbar,
  Alert,
  Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function AppBarComponent() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [error, setError] = useState(null); // not currently shown to user, but handled in code
  const [data, setData] = useState({ 'message': 'nothing to show' }); // not currently shown to user, but handled in code
  let autoHideDuration = 10000 //default to 10 seconds before snackbar disappears

  const tabStyle = {
    color: 'white',
    fontFamily: 'Gelasio',
    '&:hover': {
      color: '#99675f',
    },
    '&.Mui-selected': {
      color: '#99675f',
      '&:hover': {
        color: '#99675f'
      },
      '&:focus': {
        color: '#99675f'
      }
    },
    '&:focus': {
      color: 'white',
    }
  };

  const getTabValue = () => {
    switch (location.pathname) {
      case '/introduced':
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
      default:
        return false;
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    setData(null);
    setError(null);
    setAlertMessage('Loading data...');
    setSeverity("info");
    setOpen(true);
    try {
      axios.get('http://localhost:3001/refreshData')
        .then(response => {
          setSeverity("success");
          setAlertMessage("Data loaded successfully!")
          setData('Data was successfully pulled from the LegiScan API ');
          setError(null);
          setOpen(true)
          autoHideDuration = 3000 // hide quickly after success
        })
        .catch(error => {
          const errorMessage = error.response.data.message + ' ' + error.response.data.error;
          setError({ error: errorMessage });
          setData(null);
          setSeverity("error");
          setAlertMessage('Data failed to load ');
          setOpen(true)
        }).finally( () => {
          setLoading(false);
        });
    } catch (error) {
      setError({error:error.message});
      setData(null);
    }
  };

  const handleClose = () => {
    setAlertMessage('');
    setOpen(false);
  };

  return (
<Box sx={{ padding: '20px', bgcolor: '#E1D6CB' }}>
  <AppBar position="static" sx={{ backgroundColor: '#510000', borderRadius: '10px'}}>
    <Toolbar>
      <Typography variant="h4" component="div" sx={{ flexGrow: 1, fontFamily: 'Gelasio' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>LAYMAN</Link>
      </Typography>
      <Tabs value={getTabValue()} onChange={() => {}} sx={{ flexGrow: 1, '.MuiTabs-indicator': { backgroundColor: '#99675f' }}} aria-label="legislation tabs" variant="scrollable" scrollButtons="auto">
        <Tab label="Introduced" component={Link} to="/introduced" sx={tabStyle}/>
        <Tab label="In Discussion" component={Link} to="/in-discussion" sx={tabStyle}/>
        <Tab label="Submitted" component={Link} to="/submitted" sx={tabStyle}/>
        <Tab label="Passed" component={Link} to="/passed" sx={tabStyle}/>
        <Tab label="Failed" component={Link} to="/failed" sx={tabStyle}/>
        <Tab label="Vetoed" component={Link} to="/vetoed" sx={tabStyle}/>
      </Tabs>
      <Tab label="Refresh All Data" onClick={refreshAllData} />
    </Toolbar>
  </AppBar>
  <Snackbar anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }} autoHideDuration={autoHideDuration} open={open} onClose={handleClose}>
    <Alert onClose={handleClose} severity={severity}>
      {alertMessage}
    </Alert>
  </Snackbar>
  <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
    <CircularProgress color="inherit" />
  </Backdrop>
</Box>

  );
}

export default AppBarComponent;
