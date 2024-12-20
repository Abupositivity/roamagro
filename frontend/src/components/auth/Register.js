import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../../redux/actions/authActions';
import { Button, TextField, Typography, Container, Snackbar, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    dispatch(register({ name, email, password }, navigate));
    console.log(t("Registration successful"));
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5">{t('Register New User')}</Typography>
      <form onSubmit={handleRegister}>
        <TextField
          fullWidth
          label={t("Name")}
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          label={t("Email Address")}
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label={t("Password")}
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" color="primary" variant="contained" fullWidth>
          {t("Register New User")}
        </Button>
      </form>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {t("Registration successful!")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;