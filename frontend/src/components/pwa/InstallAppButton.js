import React from 'react';

import { Button } from '@mui/material';

import InstallMobileOutlinedIcon from
    '@mui/icons-material/InstallMobileOutlined';

import { useTranslation } from 'react-i18next';

import { usePWAInstall } from
    '../../context/PWAInstallContext';

const InstallAppButton = ({
    variant = 'outlined',
    size = 'large',
    fullWidth = false,
    sx,
}) => {
    const { t } = useTranslation();

    const {
        showInstallOption,
        isInstalling,
        requestInstall,
    } = usePWAInstall();

    if (!showInstallOption) {
        return null;
    }

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            disabled={isInstalling}
            onClick={requestInstall}
            startIcon={<InstallMobileOutlinedIcon />}
            sx={sx}
        >
            {isInstalling
                ? t('Installing...')
                : t('Install RoamAgro')}
        </Button>
    );
};

export default InstallAppButton;