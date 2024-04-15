import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const CustomSnackbar = ({ open, message, severity="success", duration=5000, onClose=()=>{}}) => {
  const [openSnackbar, setOpenSnackbar] = useState(open);

  useEffect(() => {
    setOpenSnackbar(open);
  }, [open]);

  useEffect(() => {
    let timer;
    if (openSnackbar) {
      timer = setTimeout(() => {
        setOpenSnackbar(false);
        onClose();
      }, duration);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [openSnackbar, duration, onClose]);

  const handleClose = () => {
    setOpenSnackbar(false);
    onClose();
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      open={openSnackbar}
      autoHideDuration={null}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
