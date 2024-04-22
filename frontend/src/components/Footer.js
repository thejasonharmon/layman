// Footer.js
import React from 'react';
import { Container, Box, Typography, Link } from '@mui/material';

function Footer() {
    return (
        <Container maxWidth="false" component="footer" sx={{ bgcolor: '#333333', padding: '20px 0', marginTop: 'auto' }}>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" color="text.primary" sx={{ color: 'white' }}>
                    Quick Links:
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: '10px 0', display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <li><Link href="/" color="inherit" sx={{ textDecoration: 'none', color:'#979797' }}>Homepage</Link></li>
                    <li><Link color="inherit" sx={{ textDecoration: 'none', color:'#979797' }}>Contact Us</Link></li>
                    <li><Link  color="inherit" sx={{ textDecoration: 'none', color:'#979797' }}>Privacy Policy</Link></li>
                    <li><Link  color="inherit" sx={{ textDecoration: 'none', color:'#979797' }}>Terms of Use</Link></li>
                </Box>
                <Typography variant="body2" color="#979797">
                    &copy; {new Date().getFullYear()} Layman. All rights reserved.
                </Typography>
            </Box>
        </Container>
    );
}

export default Footer;
