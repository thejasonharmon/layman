import React from 'react';
import { Box, Container, CssBaseline,Typography } from '@mui/material';

function HomePage() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="false" sx={{ bgcolor: '#E1D6CB', height: '100vh', padding: '1px' }}>
        <Box sx={{ display: 'flex', height: 'calc(100vh - 1px)' }}>
          <Box sx={{ width: '50%', bgcolor: '#E1D6CB', display: 'flex', flexDirection: 'column', padding: 3, paddingTop: '150px' }}>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="h5" component="div" sx={{ textAlign: 'left',fontFamily: 'Gelasio' }}>
                Welcome to Layman!
              </Typography>
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', fontSize: '2.5rem', textAlign: 'left', wordWrap: 'break-word' }}>
                The Best Way To Be Informed
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontFamily: 'Gelasio', textAlign: 'left' }}>
                Explore the efficiency and clarity of our platform as we simplify the legislative process. Our tool is designed to make it easier for everyone to stay informed and understand the implications of legislative actions without the need to navigate through dense and often confusing legal text
              </Typography>
            </Box>
          </Box>
          <Box sx={{
              width: '50%',
              bgcolor: '#E1D6CB',
              display: 'flex',
              flexDirection: 'column',  // Ensures vertical stacking and more control over vertical sizing
              alignItems: 'center',     // Horizontally centers the child components
              paddingTop: '90px'        // Adds top padding to push the content down
          }}>
          {/* Box to wrap image with border */}
          <Box sx={{
              border: '2px solid black',
              width: 'fit-content',  // Makes the box only as wide as its content (the image)
              alignSelf: 'center'    // Centers this box within its flex container
          }}>
              <img src="/examplepage.png" alt="Example Page" style={{ width: '100%', height: 'auto' }} />
          </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default HomePage;
