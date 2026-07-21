import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchFarmProjects,
    createFarmProject,
} from '../../redux/actions/farmProjectsActions';

import { useTranslation } from 'react-i18next';

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

const FarmProject = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        projects,
        loading,
        error,
    } = useSelector((state) => state.farmProjects);

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [project, setProject] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        budget: '',
    });

    useEffect(() => {
        dispatch(fetchFarmProjects());
    }, [dispatch]);

    const handleChange = (e) => {
        setProject({
            ...project,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = () => {

        if (
            !project.name ||
            !project.description ||
            !project.startDate ||
            !project.endDate
        ) {
            return;
        }

        dispatch(createFarmProject(project));

        setProject({
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            budget: '',
        });

        setSnackbarOpen(true);
    };

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: 3,
                pb: 12, // Prevent BottomNavigation overlap
            }}
        >
            <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
            >
                {t('Farm Projects')}
            </Typography>

            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 3,
                }}
            >
                <Typography
                    variant="h6"
                    gutterBottom
                >
                    {t('Create New Project')}
                </Typography>

                <Stack spacing={2}>

                    <TextField
                        label={t('Project Name')}
                        name="name"
                        value={project.name}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label={t('Description')}
                        name="description"
                        value={project.description}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        fullWidth
                    />

                    <Grid container spacing={2}>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                name="startDate"
                                label={t('Start Date')}
                                value={project.startDate}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                name="endDate"
                                label={t('End Date')}
                                value={project.endDate}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                    </Grid>

                    <TextField
                        label={t('Budget')}
                        name="budget"
                        type="number"
                        value={project.budget}
                        onChange={handleChange}
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress
                                color="inherit"
                                size={22}
                            />
                        ) : (
                            t('CREATE PROJECT')
                        )}
                    </Button>

                </Stack>
            </Paper>

            {loading && projects.length === 0 ? (
                <Box
                    display="flex"
                    justifyContent="center"
                    mt={5}
                >
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">
                    {error}
                </Alert>
            ) : projects.length === 0 ? (
                <Alert severity="info">
                    {t('No farm projects yet.')}
                </Alert>
            ) : (
                <Grid container spacing={3}>

                    {projects.map((item) => (

                        <Grid
                            item
                            xs={12}
                            md={6}
                            key={item._id}
                        >

                            <Card
                                sx={{
                                    borderRadius: 3,
                                    height: '100%',
                                }}
                            >

                                <CardContent>

                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                    >
                                        {item.name}
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{ mb: 2 }}
                                    >
                                        {item.description}
                                    </Typography>

                                    <Typography variant="body2">
                                        <strong>{t('Start Date')}:</strong>{' '}
                                        {new Date(
                                            item.startDate
                                        ).toLocaleDateString()}
                                    </Typography>

                                    <Typography variant="body2">
                                        <strong>{t('End Date')}:</strong>{' '}
                                        {new Date(
                                            item.endDate
                                        ).toLocaleDateString()}
                                    </Typography>

                                    <Typography
                                        sx={{ mt: 1 }}
                                        fontWeight="bold"
                                    >
                                        {t('Budget')}:{' '}
                                        ₦
                                        {Number(
                                            item.budget || 0
                                        ).toLocaleString()}
                                    </Typography>

                                </CardContent>

                            </Card>

                        </Grid>

                    ))}

                </Grid>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert
                    severity="success"
                    onClose={() => setSnackbarOpen(false)}
                >
                    {t('Project created successfully!')}
                </Alert>
            </Snackbar>

        </Container>
    );
};

export default FarmProject;