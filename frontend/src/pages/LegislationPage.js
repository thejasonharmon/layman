import React, { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  CssBaseline,
  Box,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

function LegislationPage({ statusType }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simplified API call without selectedOptions
        const response = await axios.get(`http://localhost:3001/getBillsByStatus/${statusType}`);
        setBills(response.data);
      } catch (error) {
        setError(error);
        setBills([]); // Clear bills if there is an error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusType]); // Dependency array only includes statusType

  return (
    <>
      <CssBaseline />
      <Container maxWidth="false" sx={{ bgcolor: '#E1D6CB', height: '100vh', padding: '1px' }}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Container>
          <Box sx={{ height: 'calc(100vh - 100px)', overflowY: 'auto', mt: 4 }}>
            {bills.length > 0 ? (
              bills.map((bill, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{bill.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Link href={bill.pdf_url} target="_blank" rel="noopener noreferrer">
                      View Full Text
                    </Link>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography sx={{ textAlign: 'center', my: 2 }}>
                {error ? `Failed to load data: ${error.message}` : 'No legislation to display.'}
              </Typography>
            )}
          </Box>
        </Container>
      </Container>
    </>
  );
}

export default LegislationPage;