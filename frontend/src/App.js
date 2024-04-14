import React, { useState } from 'react';
import axios from 'axios';
import {
  Container, AppBar, Tabs, Tab, Toolbar, Button, Box, Typography, CssBaseline, ThemeProvider, createTheme
} from '@mui/material';

function App() {
  const [data, setData] = useState(null); // Holds the response or loading message
  const [loading, setLoading] = useState(false); // Tracks whether the request is loading
  const [error, setError] = useState(null); // Tracks errors
  const [value, setValue] = useState(0); // Used for handling tab changes

  const populateDatabase = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    setData('Loading data...'); // Set a loading message in the same box as the success message
    try {
      const response = await axios.post("http://localhost:3001/populateData");
      setData(response.data.message); // Set the success message
    } catch (err) {
      console.error('Error while populating database:', err);
      setError(err.response?.data?.message || 'An unexpected error occurred');
      setData(null); // Clear the loading message
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#424242'
      }
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ bgcolor: 'background.default', height: '100vh', padding: '20px' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Legislative Tracker
            </Typography>
            <Tabs value={value} onChange={handleChange} aria-label="navigation tabs">
              <Tab label="Introduced" />
              <Tab label="In Discussion" />
              <Tab label="Submitted" />
              <Tab label="Passed" />
              <Tab label="Failed" />
              <Tab label="Vetoed" />
              <Tab label="Search" />
            </Tabs>
            <Button color="inherit" onClick={populateDatabase} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ marginTop: 2, padding: 2, border: '1px solid #ffffff26', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : 'No data fetched yet'}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
