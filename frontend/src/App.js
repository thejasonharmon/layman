import React, { useState } from 'react';
import { Container, AppBar, Tabs, Tab, Toolbar, Button, Box, Typography, CssBaseline, ThemeProvider, createTheme} from '@mui/material';
import CustomSnackbar from './components/Snackbar';
//import LegiScan from './LegiScan'; // Adjust if your export method is different

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(0);
  const [tempMessage,setTempMessage] = useState(null);

  //const legiScanService = new LegiScan(process.env.REACT_APP_LEGISCAN_API_KEY);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    setData('Loading data...')
    setTempMessage('Loading data...');
    try {
      //await legiScanService.getSessionList('UT', setData, setLoading, setError);
      const response = await fetch('http://localhost:3001/refreshData');
      const jsonData = await response.json();
      setData(jsonData);
      setLoading(false);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setError(error.message);
      setTempMessage('Error loading data.');
      setLoading(false);
    }
  };

  const clearTempMessage = () => {
    setTempMessage(null);
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#424242' // a light gray color suitable for dark themes
      }
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ bgcolor: 'background.default', height: '100vh', padding: '20px' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              LAYMAN
            </Typography>
            <Tabs value={value} onChange={handleChange} sx={{ flexGrow: 1 }} aria-label="legislation tabs">
              <Tab label="Introduced" />
              <Tab label="In Discussion" />
              <Tab label="Submitted" />
              <Tab label="Passed" />
              <Tab label="Failed" />
              <Tab label="Vetoed" />
            </Tabs>
            <Tab label="Search" /> {/* Additional Tab for Search to the right */}
            <Button color="inherit" onClick={refreshData} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </Toolbar>
        </AppBar>
        <Box 
          sx={{ 
            marginTop: 2, 
            padding: 2, 
            border: '1px solid #ffffff26',
            borderRadius: '4px',
            maxHeight: '300px', 
            overflowY: 'auto' 
          }}
        >
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          {data ? (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          ) : (
            'No data fetched yet'
          )}
        </Box>
        <CustomSnackbar open={tempMessage?true:false} message={tempMessage} onClose={clearTempMessage}></CustomSnackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
