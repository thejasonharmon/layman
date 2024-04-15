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
            setData(error.message);
          });
      } catch (error) {
        setData(error.message);
      }
    }
    getLastUpdated();
  }, []);

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled"  {...props} />;
  }

  const [data, setData] = useState({ 'message': 'nothing to show' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(0);

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [bottomBarText, setBottomBarText] = useState('Last data refresh: ' + lastUpdateDate.current);

  //const legiScanService = new LegiScan(process.env.REACT_APP_LEGISCAN_API_KEY);

  const refreshData = async () => {
    setLoading(true);
    setData(null);
    setError(null);
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
          setData('Data was successfully pulled from the LegiScan API ' + lastUpdateDate.current);
          setError(null);
        })
        .catch(error => {
          const errorMessage = error.response.data.message + ' ' + error.response.data.error;
          setError({ error: errorMessage });
          setData(null);
          setSeverity("error");
          setAlertMessage('Data failed to load ');
          setBottomBarText(`Failed to load data. Expand for more details`);
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
          <Typography variant='caption'>
            {error ? (
              <pre style={{ fontColor: "red" }}>{JSON.stringify(error, null, 2)}</pre>
            ) : ''}
            {data ? (
              <pre>{JSON.stringify(data, null, 2)}</pre>
            ) : ''}
          </Typography>
        </AccordionDetails>
      </Accordion>

    </ThemeProvider>
  );
}

export default App;
