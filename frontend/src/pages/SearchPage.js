import React, { useState, useEffect, useRef } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Tabs, 
  Tab, 
  Button, 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  OutlinedInput, 
  Chip,
  Box,
  Link
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

function SearchPage() {

  let lastUpdateDate = useRef('Initial setting');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchResults, setSearchResults] = useState('');


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
  const handleSelectChange = (event) => {
    setSelectedOptions(event.target.value);
  };

  const handleSearch = () => {
    setSearchResults(`Searches with ${selectedOptions.join(', ')}`);
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="false" sx={{ bgcolor: '#E1D6CB', height: '100vh', padding: '20px' }}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <AppBar position="static" sx={{ backgroundColor: '#510000' ,borderRadius:'10px'}}>
          <Toolbar>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1, fontFamily: 'Gelasio'}}>
              LAYMAN
            </Typography>
            <Tabs value={value} onChange={handleChange} sx={{ flexGrow: 1, color: 'white', '.MuiTabs-indicator': { backgroundColor: '#99675f' }, '.Mui-selected': { color: '#99675f' }}} aria-label="legislation tabs" variant="scrollable" scrollButtons="auto">
              <Tab label="Introduced" sx = {{color: 'white', fontFamily: 'Gelasio'}}/>
              <Tab label="In Discussion" sx = {{color: 'white', fontFamily: 'Gelasio'}}/>
              <Tab label="Submitted" sx = {{color: 'white', fontFamily: 'Gelasio'}} />
              <Tab label="Passed" sx = {{color: 'white', fontFamily: 'Gelasio'}}/>
              <Tab label="Failed" sx = {{color: 'white', fontFamily: 'Gelasio'}}/>
              <Tab label="Vetoed" sx = {{color: 'white', fontFamily: 'Gelasio'}}/>
            </Tabs>
            <Tab label="Search" /> {/* Additional Tab for Search to the right */}
            <Button color="inherit" onClick={refreshData} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </Toolbar>
        </AppBar>
        <Container>
          <Typography 
            variant="h4" // Makes the text larger, adjust variant for different sizes
            component="h2" 
            sx={{
              fontFamily: 'Gelasio',
              marginTop: 7,
              textAlign: 'center', // Centers the text horizontally
              color: '#510000', // Changes the color to blue, use any valid CSS color
              fontSize: '2rem' // Increases the font size, adjustable to your preference
            }}
          >
            Search Our Website
          </Typography>
        {/* Further content or components can go here */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4, alignItems: 'center' }}>
          <FormControl sx={{ width: 300 }}>
            <InputLabel sx={{ color: '#510000', '&.Mui-focused': { color: '#510000' } }}>Select Options</InputLabel>
            <Select
              multiple
              value={selectedOptions}
              onChange={handleSelectChange}
              input={<OutlinedInput label="Select Options" sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'inherit'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#510000' // Change border color on focus here
                }
              }}/>}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {['Healthcare', 'Economy and Finance', 'Education', 'Environment', 'National Security', 'Immigration', 'Civil Rights', 'Transportation', 'Labor and Employment', 'Technology and Communication'].map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSearch} sx={{
            backgroundColor: '#510000',
            color: 'white',
            '&:hover': { backgroundColor: '#730000' },
            height: 56 // Assuming the default height for buttons, adjust accordingly
          }}>Search</Button>
        </Box>
        {searchResults && (
          <Typography sx={{ mt: 6, textAlign: 'center', fontSize: '1.3rem', fontFamily:'Gelasio' }}>
            {searchResults}
          </Typography>
        )}
        </Container>
        <Snackbar anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }} open={open} autoHideDuration={6000} onClose={handleClose}>
          <div>
            <Alert onClose={handleClose} severity={severity}>
              {alertMessage}
            </Alert>
          </div>
        </Snackbar>
      </Container>
      <Container maxWidth="false" component="footer" sx={{ bgcolor: '#333333', padding: '20px 0', marginTop: 'auto' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1" color="text.primary" sx={{color:'white'}}>
          Quick Links:
        </Typography>
        <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: '10px 0', display: 'flex', justifyContent: 'center', gap: 2 }}>
          <li><Link href="/" color="inherit" sx={{ textDecoration: 'none', color:'#979797' }}>Homepage</Link></li>
          <li><Link href="/contact" color="inherit" sx={{ textDecoration: 'none', color:'#979797' }}>Contact Us</Link></li>
          <li><Link href="/privacy" color="inherit" sx={{ textDecoration: 'none', color:'#979797' }}>Privacy Policy</Link></li>
          <li><Link href="/terms" color="inherit" sx={{ textDecoration: 'none', color:'#979797' }}>Terms of Use</Link></li>
        </Box>
        <Typography variant="body2" color="#979797">
          &copy; {new Date().getFullYear()} Layman. All rights reserved.
        </Typography>
      </Box>
    </Container>

    </>
  );
}

export default SearchPage;