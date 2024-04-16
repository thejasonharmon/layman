import React, { useState, useEffect, useRef } from 'react';
import { Container, AppBar, Tabs, Tab, Toolbar, Button, Typography, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

function App() {

  let lastUpdateDate = useRef('Initial setting');

  useEffect(() => {
    async function getLastUpdated() {
      try {
        axios.get('http://localhost:3001/last-updated')
          .then(response => {
            lastUpdateDate.current = response.data.message;
            setBottomBarText('Last data refresh: ' + lastUpdateDate.current)

          })
          .catch(error => {
            setBottomBarText('(2)Error')
            setErrorJson(error.message);
          });
      } catch (error) {
        setErrorJson(error.message);
      }
    }
    getLastUpdated();
  }, []);

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled"  {...props} />;
  }

  const [detailedStatus, setDetailedStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorJson, setErrorJson] = useState(null);
  const [value, setValue] = useState(0);

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [bottomBarText, setBottomBarText] = useState('Last data refresh: ' + lastUpdateDate.current);

  //const legiScanService = new LegiScan(process.env.REACT_APP_LEGISCAN_API_KEY);

  const refreshData = async () => {
    setLoading(true);
    setDetailedStatus(null);
    setErrorJson(null);
    setAlertMessage('Loading data...');
    setSeverity("info");
    setOpen(true);
    try {
      axios.get('http://localhost:3001/refreshData')
        .then(response => {
          lastUpdateDate.current = response.data.message
          setSeverity("success");
          setAlertMessage("Data loaded successfully!")
          setBottomBarText('Last data refresh: ' + lastUpdateDate.current);
          setDetailedStatus('Data was successfully pulled from the LegiScan API ' + lastUpdateDate.current);
          setErrorJson(null);
        })
        .catch(error => {
          // const errorMessage = error.response.data;
          setErrorJson(error.response.data);
          setDetailedStatus(null);
          setSeverity("error");
          setAlertMessage('Data failed to load ');
          setBottomBarText(`Failed to refresh data. Expand for details`);
        }).finally(() => {
          setLoading(false);
        });
    } catch (error) {
      setErrorJson({ error: error.message });
      setDetailedStatus(null);
    }
  };

  const handleClose = () => {
    setAlertMessage('');
    setOpen(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const testError = () => {
    if (!errorJson) {
      setDetailedStatus(null);
      setErrorJson({ message: 'This is a test error message from testError', error: 'The error details would go here' });
      setBottomBarText('Error. Expand for details');
    } else {
      setErrorJson(null);
      setBottomBarText('Last data refresh: ' + lastUpdateDate.current)
    }
  }

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
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              LAYMAN
            </Typography>
            <Tabs value={value} onChange={handleChange} sx={{ flexGrow: 1 }} aria-label="legislation tabs" variant="scrollable" scrollButtons="auto">
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
        <br></br>
        <Button variant='contained' onClick={testError}>{errorJson ? 'Clear Error' : 'Test Error'}</Button>
        <Snackbar anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }} open={open} autoHideDuration={6000} onClose={handleClose}>
          <div>
            <Alert onClose={handleClose} severity={severity}>
              {alertMessage}
            </Alert>
          </div>
        </Snackbar>
      </Container>
      <Accordion
        style={{
          position: 'fixed',
          bottom: 0,
          width: '100%', // Adjust width as needed
          zIndex: 1000, // Ensure Accordion stays on top
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ fontSize: "small" }}>
          <Typography variant='caption'>{bottomBarText}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant='caption' display={errorJson ? "block" : "none"}>
            💩 Error details:
          </Typography>
          <Typography variant="caption" component="pre" sx={{ color: "red" }} display={errorJson ? "block" : "none"}>
            {errorJson ? JSON.stringify(errorJson, null, 2) : ''}
          </Typography>
          <Typography variant='caption' display={(errorJson === null || errorJson === '') ? "block" : "none"}>
            {detailedStatus ? detailedStatus : 'No status details 👍'}
          </Typography>
        </AccordionDetails>
      </Accordion>

    </ThemeProvider>
  );
}

export default App;