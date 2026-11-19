import React from 'react';

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Typography,
} from '@mui/material';

import InstallMobileOutlinedIcon from
    '@mui/icons-material/InstallMobileOutlined';

import ShareOutlinedIcon from
    '@mui/icons-material/ShareOutlined';

import MoreVertIcon from
    '@mui/icons-material/MoreVert';

import AddToHomeScreenIcon from
    '@mui/icons-material/AddToHomeScreen';

import DesktopWindowsOutlinedIcon from
    '@mui/icons-material/DesktopWindowsOutlined';

import { useTranslation } from 'react-i18next';

import { usePWAInstall } from
    '../../context/PWAInstallContext';
    
const InstallAppDialog = ({
    open,
    onClose,
    platform,
    installationError = false,
}) => {
    const { t } = useTranslation();

    const renderStep = (number, description, icon) => (
        <Stack
            direction="row"
            spacing={1.5}
            alignItems="flex-start"
            key={number}
        >
            <Box
                sx={{
                    width: 30,
                    height: 30,
                    flexShrink: 0,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                }}
            >
                {number}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="body2"
                    sx={{
                        lineHeight: 1.7,
                        overflowWrap: 'anywhere',
                    }}
                >
                    {t(description)}
                </Typography>
            </Box>

            {icon && (
                <Box
                    sx={{
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </Box>
            )}
        </Stack>
    );

    const renderInstructions = () => {
        switch (platform) {
            case 'ios':
                return (
                    <Stack spacing={2.5}>
                        {renderStep(
                            1,
                            'Open RoamAgro in Safari.'
                        )}

                        {renderStep(
                            2,
                            'Tap the Share button.',
                            <ShareOutlinedIcon fontSize="small" />
                        )}

                        {renderStep(
                            3,
                            'Select Add to Home Screen.',
                            <AddToHomeScreenIcon fontSize="small" />
                        )}

                        {renderStep(
                            4,
                            'Tap Add to complete the installation.'
                        )}

                        <Alert severity="info">
                            {t(
                                'If Open as Web App is available, make sure it is enabled.'
                            )}
                        </Alert>
                    </Stack>
                );

            case 'android':
                return (
                    <Stack spacing={2.5}>
                        {renderStep(
                            1,
                            'Open RoamAgro in Chrome or another supported browser.'
                        )}

                        {renderStep(
                            2,
                            'Open the browser menu.',
                            <MoreVertIcon fontSize="small" />
                        )}

                        {renderStep(
                            3,
                            'Select Install app or Add to Home screen.',
                            <AddToHomeScreenIcon fontSize="small" />
                        )}

                        {renderStep(
                            4,
                            'Follow the instructions to complete the installation.'
                        )}
                    </Stack>
                );

            case 'desktop':
                return (
                    <Stack spacing={2.5}>
                        {renderStep(
                            1,
                            'Open RoamAgro in Chrome or Microsoft Edge.'
                        )}

                        {renderStep(
                            2,
                            'Look for the install icon in the address bar or open the browser menu.',
                            <DesktopWindowsOutlinedIcon
                                fontSize="small"
                            />
                        )}

                        {renderStep(
                            3,
                            'Select the option to install RoamAgro.'
                        )}

                        {renderStep(
                            4,
                            'Follow the instructions to complete the installation.'
                        )}
                    </Stack>
                );

            default:
                return (
                    <Alert severity="info">
                        {t(
                            'Your browser may not support app installation. You can continue using RoamAgro in your browser.'
                        )}
                    </Alert>
                );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            aria-labelledby="roamagro-install-dialog-title"
            slotProps={{
                paper: {
                    sx: {
                        width: {
                            xs: 'calc(100% - 32px)',
                            sm: '100%',
                        },
                        m: {
                            xs: 2,
                            sm: 3,
                        },
                        borderRadius: 3,
                    },
                },
            }}
        >
            <DialogTitle
                id="roamagro-install-dialog-title"
                sx={{ fontWeight: 700 }}
            >
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                >
                    <InstallMobileOutlinedIcon color="primary" />

                    <Typography
                        component="span"
                        variant="h6"
                        fontWeight={700}
                    >
                        {t('Install RoamAgro')}
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2.5}>
                    {installationError && (
                        <Alert severity="warning">
                            {t(
                                'The installation prompt could not be opened. Please follow the instructions below.'
                            )}
                        </Alert>
                    )}

                    <Typography
                        color="text.secondary"
                        variant="body2"
                        lineHeight={1.7}
                    >
                        {t(
                            'Install RoamAgro on your device for quick and easy access without opening your browser each time.'
                        )}
                    </Typography>

                    {renderInstructions()}

                    {platform !== 'other' && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            lineHeight={1.6}
                        >
                            {t(
                                'If the installation option is unavailable, you can continue using RoamAgro in your browser.'
                            )}
                        </Typography>
                    )}

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        lineHeight={1.6}
                    >
                        {t(
                            'An internet connection is required to access live information and manage your records.'
                        )}
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    fullWidth
                >
                    {t('Done')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const PWAInstallDialogHost = () => {
    const {
        dialogOpen,
        closeInstallDialog,
        platform,
        installationError,
        isInstalled,
    } = usePWAInstall();

    return (
        <InstallAppDialog
            open={dialogOpen && !isInstalled}
            onClose={closeInstallDialog}
            platform={platform}
            installationError={installationError}
        />
    );
};

export default InstallAppDialog;