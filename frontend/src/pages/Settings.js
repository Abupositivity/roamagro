import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import {
  Brightness4,
  Language,
  Person,
  Info,
  Email,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import ThemeSwitcher from '../components/ThemeSwitcher';
import LanguageSwitcher from '../components/LanguageSwitcher';
import PageLayout from '../components/layout/PageLayout';

const Settings = ({ darkMode, setDarkMode }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  return (
    <PageLayout>
      <Box
        sx={{
          maxWidth: 700,
          mx: 'auto',
          pb: 4,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
        >
          {t('Settings')}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {t('Customize your RoamAgro experience')}
        </Typography>

        {/* ========================================= */}
        {/* ACCOUNT */}
        {/* ========================================= */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'R'}
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={600}
                >
                  {user?.name || 'RoamAgro User'}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Email fontSize="small" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {user?.email || 'user@example.com'}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* ========================================= */}
        {/* APPEARANCE */}
        {/* ========================================= */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              mb={2}
            >
              <Brightness4 color="primary" />
              <Typography
                variant="h6"
                fontWeight={600}
              >
                {t('Appearance')}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <ThemeSwitcher
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          </CardContent>
        </Card>

        {/* ========================================= */}
        {/* LANGUAGE */}
        {/* ========================================= */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              mb={2}
            >
              <Language color="primary" />
              <Typography
                variant="h6"
                fontWeight={600}
              >
                {t('Language')}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <LanguageSwitcher />
          </CardContent>
        </Card>

        {/* ========================================= */}
        {/* ACCOUNT INFO */}
        {/* ========================================= */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              mb={2}
            >
              <Person color="primary" />
              <Typography
                variant="h6"
                fontWeight={600}
              >
                {t('Account')}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2">
              {t('Profile management will be available in the next update.')}
            </Typography>
          </CardContent>
        </Card>
        {/* ========================================= */}
        {/* ABOUT */}
        {/* ========================================= */}
        <Card>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              mb={2}
            >
              <Info color="primary" />
              <Typography
                variant="h6"
                fontWeight={600}
              >
                {t('About')}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="body2"
              paragraph
            >
              {t(
                'RoamAgro is a digital agribusiness platform helping farmers manage projects, monitor market prices, connect with buyers and build thriving agricultural communities.'
              )}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
            >
              <Chip
                label="Version 1.0 MVP"
                color="primary"
              />
              <Chip
                label="Northern Nigeria"
                variant="outlined"
              />
              <Chip
                label="English / Hausa"
                variant="outlined"
              />
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </PageLayout>
  );
};

export default Settings;