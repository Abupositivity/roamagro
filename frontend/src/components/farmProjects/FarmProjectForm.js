import React, { useEffect, useState } from 'react';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useTranslation } from 'react-i18next';

// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
    name: '',
    description: '',
    crop: '',
    farmType: 'Crop Farming',
    category: '',
    season: 'Rainy Season',
    farmSize: '',
    measurementUnit: 'Hectares',
    location: '',
    budget: '',
    priority: 'Medium',
    status: 'Planning',
    startDate: '',
    endDate: '',
    weatherNotes: '',
    tags: '',
};

// ============================================================
// OPTIONS
// ============================================================

const farmTypes = [
    'Crop Farming',
    'Livestock',
    'Poultry',
    'Fishery',
    'Mixed Farming',
    'Other',
];

const seasons = [
    'Dry Season',
    'Rainy Season',
    'All Season',
];

const units = [
    'Hectares',
    'Acres',
];

const priorities = [
    'Low',
    'Medium',
    'High',
];

const statuses = [
    'Planning',
    'Active',
    'Paused',
    'Completed',
];

// ============================================================
// DATE FORMATTER
// ============================================================

const formatDateForInput = (date) => {

    if (!date) {
        return '';
    }

    const value = String(date);

    // Already in HTML date format
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return '';
    }

    const year = parsedDate.getFullYear();

    const month = String(
        parsedDate.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
        parsedDate.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// ============================================================
// COMPONENT
// ============================================================

const FarmProjectForm = ({
    initialValues = null,
    loading = false,
    onSubmit,
    onCancel,
    submitLabel = 'Create Project',
    readOnly = false,
}) => {

    const { t } = useTranslation();

    const [project, setProject] = useState(
        initialState
    );

    const [errors, setErrors] = useState({});

    const [moreOptionsOpen, setMoreOptionsOpen] =
        useState(false);


    // ========================================================
    // LOAD INITIAL VALUES
    // ========================================================

    useEffect(() => {

        if (initialValues) {

            setProject({
                ...initialState,
                ...initialValues,

                startDate: formatDateForInput(
                    initialValues.startDate
                ),

                endDate: formatDateForInput(
                    initialValues.endDate
                ),

                tags: Array.isArray(
                    initialValues.tags
                )
                    ? initialValues.tags.join(', ')
                    : initialValues.tags || '',
            });

        } else {

            setProject(initialState);

        }

        setErrors({});

        // Keep More Options closed when opening
        // a new project or editing an existing one.
        setMoreOptionsOpen(false);

    }, [initialValues]);


    // ========================================================
    // CHANGE HANDLER
    // ========================================================

    const handleChange = (event) => {

        if (readOnly) {
            return;
        }

        const {
            name,
            value,
        } = event.target;


        setProject((previous) => ({
            ...previous,
            [name]: value,
        }));


        // Clear field error when user edits it
        if (errors[name]) {

            setErrors((previous) => ({
                ...previous,
                [name]: '',
            }));

        }
    };


    // ========================================================
    // VALIDATION
    // ========================================================

    const validate = () => {

        const validation = {};


        // Required: Project Name
        if (!project.name.trim()) {

            validation.name = t(
                'Project name is required'
            );

        }


        // Required: Crop / Livestock
        if (!project.crop.trim()) {

            validation.crop = t(
                'Crop or livestock is required'
            );

        }


        // Required: Start Date
        if (!project.startDate) {

            validation.startDate = t(
                'Start date is required'
            );

        }


        // Expected harvest cannot be before start date
        if (
            project.endDate &&
            project.startDate &&
            new Date(project.endDate) <
                new Date(project.startDate)
        ) {

            validation.endDate = t(
                'Expected harvest date must be after start date'
            );

        }


        // Farm size validation
        if (
            project.farmSize !== '' &&
            Number(project.farmSize) < 0
        ) {

            validation.farmSize = t(
                'Farm size cannot be negative'
            );

        }


        // Budget validation
        if (
            project.budget !== '' &&
            Number(project.budget) < 0
        ) {

            validation.budget = t(
                'Budget cannot be negative'
            );

        }


        setErrors(validation);

        return (
            Object.keys(validation).length === 0
        );
    };


    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit = (event) => {

        event.preventDefault();

        // View mode must never submit changes.
        if (readOnly) {
            return;
        }


        if (!validate()) {
            return;
        }


        const payload = {
            ...project,

            farmSize:
                project.farmSize === ''
                    ? 0
                    : Number(project.farmSize),

            budget:
                project.budget === ''
                    ? 0
                    : Number(project.budget),

            tags: project.tags
                ? project.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                : [],
        };


        onSubmit?.(payload);

    };


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                p: {
                    xs: 2,
                    sm: 3,
                },
            }}
        >

            <Stack spacing={3}>


                {/* ==================================================
                    REQUIRED + IMPORTANT FIELDS
                ================================================== */}

                <Box>

                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        mb={2}
                    >
                        {t('Project Information')}
                    </Typography>


                    <Grid
                        container
                        spacing={2}
                    >

                        {/* Project Name */}

                        <Grid
                            item
                            xs={12}
                        >

                            <TextField
                                label={t('Project Name')}
                                name="name"
                                value={project.name}
                                onChange={handleChange}
                                error={Boolean(errors.name)}
                                helperText={errors.name}
                                required
                                fullWidth
                                autoFocus={!readOnly}
                                disabled={readOnly}
                            />

                        </Grid>


                        {/* Farm Type */}

                        <Grid
                            item
                            xs={12}
                            sm={6}
                        >

                            <TextField
                                select
                                fullWidth
                                label={t('Farm Type')}
                                name="farmType"
                                value={project.farmType}
                                onChange={handleChange}
                                required
                                disabled={readOnly}
                            >

                                {farmTypes.map((type) => (

                                    <MenuItem
                                        key={type}
                                        value={type}
                                    >
                                        {t(type)}
                                    </MenuItem>

                                ))}

                            </TextField>

                        </Grid>


                        {/* Crop / Livestock */}

                        <Grid
                            item
                            xs={12}
                            sm={6}
                        >

                            <TextField
                                label={t(
                                    'Crop / Livestock'
                                )}
                                name="crop"
                                value={project.crop}
                                onChange={handleChange}
                                required
                                error={Boolean(
                                    errors.crop
                                )}
                                helperText={
                                    errors.crop
                                }
                                fullWidth
                                disabled={readOnly}
                            />

                        </Grid>


                        {/* Start Date */}

                        <Grid
                            item
                            xs={12}
                            sm={6}
                        >

                            <TextField
                                type="date"
                                label={t('Start Date')}
                                name="startDate"
                                value={
                                    project.startDate
                                }
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                required
                                error={Boolean(
                                    errors.startDate
                                )}
                                helperText={
                                    errors.startDate
                                }
                                fullWidth
                                disabled={readOnly}
                            />

                        </Grid>


                        {/* Location */}

                        <Grid
                            item
                            xs={12}
                            sm={6}
                        >

                            <TextField
                                label={t('Location')}
                                name="location"
                                value={
                                    project.location
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder={t(
                                    'Farm location or area'
                                )}
                                fullWidth
                                disabled={readOnly}
                            />

                        </Grid>


                        {/* Budget */}

                        <Grid
                            item
                            xs={12}
                            sm={6}
                        >

                            <TextField
                                label={t('Budget')}
                                name="budget"
                                type="number"
                                value={
                                    project.budget
                                }
                                onChange={
                                    handleChange
                                }
                                error={Boolean(
                                    errors.budget
                                )}
                                helperText={
                                    errors.budget
                                }
                                inputProps={{
                                    min: 0,
                                }}
                                fullWidth
                                disabled={readOnly}
                            />

                        </Grid>

                    </Grid>

                </Box>


                {/* ==================================================
                    MORE OPTIONS
                ================================================== */}

                <Accordion
                    expanded={moreOptionsOpen}
                    onChange={() => {

                        if (readOnly) {
                            setMoreOptionsOpen(
                                (previous) => !previous
                            );
                            return;
                        }

                        setMoreOptionsOpen(
                            (previous) => !previous
                        );
                    }}
                    disableGutters
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        '&:before': {
                            display: 'none',
                        },
                    }}
                >

                    <AccordionSummary
                        expandIcon={
                            <ExpandMoreIcon />
                        }
                    >

                        <Box>

                            <Typography
                                fontWeight={700}
                            >
                                {t('More Options')}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {t(
                                    'Add optional details about this project'
                                )}
                            </Typography>

                        </Box>

                    </AccordionSummary>


                    <AccordionDetails>

                        <Grid
                            container
                            spacing={2}
                        >

                            {/* Farm Size */}

                            <Grid
                                item
                                xs={12}
                                sm={6}
                            >

                                <TextField
                                    label={t(
                                        'Farm Size'
                                    )}
                                    name="farmSize"
                                    type="number"
                                    value={
                                        project.farmSize
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    error={Boolean(
                                        errors.farmSize
                                    )}
                                    helperText={
                                        errors.farmSize
                                    }
                                    inputProps={{
                                        min: 0,
                                    }}
                                    fullWidth
                                    disabled={readOnly}
                                />

                            </Grid>


                            {/* Measurement Unit */}

                            <Grid
                                item
                                xs={12}
                                sm={6}
                            >

                                <TextField
                                    select
                                    label={t(
                                        'Measurement Unit'
                                    )}
                                    name="measurementUnit"
                                    value={
                                        project.measurementUnit
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    fullWidth
                                    disabled={readOnly}
                                >

                                    {units.map(
                                        (unit) => (

                                            <MenuItem
                                                key={unit}
                                                value={unit}
                                            >
                                                {t(unit)}
                                            </MenuItem>

                                        )
                                    )}

                                </TextField>

                            </Grid>


                            {/* Season */}

                            <Grid
                                item
                                xs={12}
                                sm={6}
                            >

                                <TextField
                                    select
                                    label={t('Season')}
                                    name="season"
                                    value={
                                        project.season
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    fullWidth
                                    disabled={readOnly}
                                >

                                    {seasons.map(
                                        (season) => (

                                            <MenuItem
                                                key={season}
                                                value={season}
                                            >
                                                {t(season)}
                                            </MenuItem>

                                        )
                                    )}

                                </TextField>

                            </Grid>


                            {/* Expected Harvest */}

                            <Grid
                                item
                                xs={12}
                                sm={6}
                            >

                                <TextField
                                    type="date"
                                    label={t(
                                        'Expected Harvest'
                                    )}
                                    name="endDate"
                                    value={
                                        project.endDate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={Boolean(
                                        errors.endDate
                                    )}
                                    helperText={
                                        errors.endDate
                                    }
                                    fullWidth
                                    disabled={readOnly}
                                />

                            </Grid>


                            {/* Priority */}

                            <Grid
                                item
                                xs={12}
                                sm={6}
                            >

                                <TextField
                                    select
                                    label={t(
                                        'Priority'
                                    )}
                                    name="priority"
                                    value={
                                        project.priority
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    fullWidth
                                    disabled={readOnly}
                                >

                                    {priorities.map(
                                        (priority) => (

                                            <MenuItem
                                                key={
                                                    priority
                                                }
                                                value={
                                                    priority
                                                }
                                            >
                                                {t(
                                                    priority
                                                )}
                                            </MenuItem>

                                        )
                                    )}

                                </TextField>

                            </Grid>


                            {/* Status */}

                            <Grid
                                item
                                xs={12}
                                sm={6}
                            >

                                <TextField
                                    select
                                    label={t('Status')}
                                    name="status"
                                    value={
                                        project.status
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    fullWidth
                                    disabled={readOnly}
                                >

                                    {statuses.map(
                                        (status) => (

                                            <MenuItem
                                                key={
                                                    status
                                                }
                                                value={
                                                    status
                                                }
                                            >
                                                {t(
                                                    status
                                                )}
                                            </MenuItem>

                                        )
                                    )}

                                </TextField>

                            </Grid>


                            {/* Category */}

                            <Grid
                                item
                                xs={12}
                                sm={6}
                            >

                                <TextField
                                    label={t(
                                        'Category'
                                    )}
                                    name="category"
                                    value={
                                        project.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder={t(
                                        'e.g. Maize production'
                                    )}
                                    fullWidth
                                    disabled={readOnly}
                                />

                            </Grid>


                            {/* Tags */}

                            <Grid
                                item
                                xs={12}
                                sm={6}
                            >

                                <TextField
                                    label={t('Tags')}
                                    name="tags"
                                    value={
                                        project.tags
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    helperText={t(
                                        'Separate with commas'
                                    )}
                                    fullWidth
                                    disabled={readOnly}
                                />

                            </Grid>


                            {/* Description */}

                            <Grid
                                item
                                xs={12}
                            >

                                <TextField
                                    label={t(
                                        'Description'
                                    )}
                                    name="description"
                                    value={
                                        project.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    multiline
                                    rows={3}
                                    placeholder={t(
                                        'Briefly describe this farm project'
                                    )}
                                    fullWidth
                                    disabled={readOnly}
                                />

                            </Grid>


                            {/* Weather Notes */}

                            <Grid
                                item
                                xs={12}
                            >

                                <TextField
                                    label={t(
                                        'Weather Notes'
                                    )}
                                    name="weatherNotes"
                                    value={
                                        project.weatherNotes
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    multiline
                                    rows={2}
                                    placeholder={t(
                                        'Optional weather or environmental notes'
                                    )}
                                    fullWidth
                                    disabled={readOnly}
                                />

                            </Grid>

                        </Grid>

                    </AccordionDetails>

                </Accordion>


                {/* ==================================================
                    VALIDATION MESSAGE
                ================================================== */}

                {!readOnly &&
                    Object.keys(errors).length > 0 && (

                        <Alert severity="warning">
                            {t(
                                'Please complete the required fields.'
                            )}
                        </Alert>

                    )}


                {/* ==================================================
                    ACTIONS
                ================================================== */}

                {!readOnly && (
                    <Stack
                        direction={{
                            xs: 'column-reverse',
                            sm: 'row',
                        }}
                        justifyContent="flex-end"
                        spacing={2}
                        pt={1}
                    >

                        <Button
                            variant="outlined"
                            onClick={onCancel}
                            disabled={loading}
                            fullWidth
                            sx={{
                                width: {
                                    xs: '100%',
                                    sm: 'auto',
                                },
                            }}
                        >
                            {t('Cancel')}
                        </Button>


                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            fullWidth
                            sx={{
                                width: {
                                    xs: '100%',
                                    sm: 'auto',
                                },
                            }}
                        >
                            {loading
                                ? t('Saving...')
                                : t(submitLabel)}
                        </Button>

                    </Stack>
                )}

            </Stack>

        </Box>
    );
};

export default FarmProjectForm;