import React from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    Grid,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import ProjectProfitCard from './ProjectProfitCard';

const ProjectProfitability = ({
    projects = [],
    loading = false,
    error = null
}) => {

    const { t } = useTranslation();

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                py={4}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert
                severity="error"
                sx={{ mt: 3 }}
            >
                {error}
            </Alert>
        );
    }

    if (!projects.length) {
        return (
            <Alert severity="info">
                {t('No project profitability data available.')}
            </Alert>
        );
    }

    return (
        <Box mt={5}>

            <Typography
                variant="h5"
                fontWeight={700}
                mb={3}
            >
                {t('Project Profitability')}
            </Typography>

            <Grid
                container
                spacing={3}
            >
                {projects.map(project => (
                    <Grid
                        item
                        xs={12}
                        md={6}
                        lg={4}
                        key={project._id}
                    >
                        <ProjectProfitCard
                            project={project}
                        />
                    </Grid>
                ))}
            </Grid>

        </Box>
    );
};

export default ProjectProfitability;