import React, { useState } from 'react';
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


function FailedPage() {

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(0);

  const handleSelectChange = (event) => {
    setSelectedOptions(event.target.value);
  };

  const handleSearch = async () => {
    // Start by indicating that a search is in progress, which could, for instance, trigger a loading indicator.
    setLoading(true);
    setSearchResults(''); // Clear previous search results.
    setError(null); // Clear any previous errors.
  
    try {
      // Replace 'your-api-endpoint' with the actual endpoint you want to hit.
      const response = await axios.get('http://localhost:3001/getBillsByStatus/failed', {
        params: {
          // Include any parameters your API might need for the search.
          options: selectedOptions.join(','),
        },
      });
  
      // Process and update state with the response data.
      setSearchResults(response.data);
      // You can format or process your data here before setting it to state.
    } catch (error) {
      // Handle any errors here.
      setError(error);
      setSearchResults(`Error: ${error.message}`);
    } finally {
      // In any case, indicate that the search/loading has completed.
      setLoading(false);
    }
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
              variant="h4"
              component="h2"
              sx={{
                fontFamily: 'Gelasio',
                marginTop: 7,
                textAlign: 'center',
                color: '#510000',
                fontSize: '2rem'
              }}
            >
              Search Introduced Legislation
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4, alignItems: 'center' }}>
              <FormControl sx={{ width: 300 }}>
                <InputLabel sx={{ color: '#510000', '&.Mui-focused': { color: '#510000' } }}>
                  Select Options
                </InputLabel>
                <Select
                  multiple
                  value={selectedOptions}
                  onChange={handleSelectChange}
                  input={
                    <OutlinedInput label="Select Options" sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'inherit'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#510000'
                      }
                    }}/>
                  }
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
                height: 56
              }}>
                Search
              </Button>
            </Box>
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <Box key={index} sx={{ mt: 6, textAlign: 'center', fontSize: '1.3rem', fontFamily: 'Gelasio' }}>
                  <Typography variant="h6" component="h3">
                    {result.name}
                  </Typography>
                  <Link href={result.pdf_url} target="_blank" rel="noopener noreferrer" sx={{ color: '#510000', textDecoration: 'none' }}>
                    Download PDF
                  </Link>
                </Box>
              ))
            ) : (
              <Typography sx={{ mt: 6, textAlign: 'center', fontSize: '1.3rem', fontFamily: 'Gelasio' }}>
                No results to display.
              </Typography>
            )}
            <Container>
              {bills.map((bill, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{bill.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Link href={bill.pdf_url}>PDF Link</Link>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Container>
          </Container>
        </Container>
        <Container maxWidth="false" component="footer" sx={{ bgcolor: '#333333', padding: '20px 0', marginTop: 'auto' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" color="text.primary" sx={{ color: 'white' }}>
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

export default FailedPage;