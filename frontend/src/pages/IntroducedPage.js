import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Container,
  Button,
  CssBaseline,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Box,
  Link,
  Accordion, // Importing Accordion
  AccordionSummary, // Importing AccordionSummary
  AccordionDetails // Importing AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Importing ExpandMoreIcon
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';


function IntroducedPage() {

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchResults, setSearchResults] = useState('');

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(0);

  //const legiScanService = new LegiScan(process.env.REACT_APP_LEGISCAN_API_KEY);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:3001/getBillsByStatus/submitted')
      .then(response => {
        console.log("API Response:", response.data);  // Log to see what you receive from the API
        setBills(response.data);  // Assuming response.data is the array of bills
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching bills:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);
  


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
      <Container maxWidth="false" sx={{ bgcolor: '#E1D6CB', height: '100vh', padding: '1px' }}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
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
            Search Introduced Legislation
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
        <Container>
                    {/* Displaying fetched bills */}
                    {bills.map((bill, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{bill.name}</Typography> {/* Assuming 'name' is a property of the bill */}
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {bill.description} {/* Assuming 'description' is a property of the bill */}
                </Typography>
                <Link href={bill.pdf_url}>PDF Link</Link> {/* Assuming 'pdf_url' is a property */}
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
        </Container>
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

export default IntroducedPage;