import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
    fetchTopics,
    createTopic,
} from '../../redux/actions/communityActions';

const Community = () => {
    const { t } = useTranslation();

    const dispatch = useDispatch();

    const {
        topics,
        loading,
        error,
    } = useSelector((state) => state.community);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general',
    });

    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        dispatch(fetchTopics());
    }, [dispatch]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.content) {
            return;
        }

        dispatch(createTopic(formData));

        setFormData({
            title: '',
            content: '',
            category: 'general',
        });

        setOpenSnackbar(true);
    };

    return (
        <Container
            maxWidth="md"
            sx={{
                py: 3,
                pb: 12,
            }}
        >
            <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
            >
                {t('Community Interaction')}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
            >
                {t(
                    'Share farming experiences, ask questions and learn from other farmers.'
                )}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card
                elevation={2}
                sx={{
                    mb: 4,
                    borderRadius: 3,
                }}
            >
                <CardContent>

                    <Typography
                        variant="h6"
                        gutterBottom
                    >
                        {t('Create New Post')}
                    </Typography>

                    <Stack spacing={2}>

                        <TextField
                            fullWidth
                            label={t('Topic Title')}
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label={t('Content')}
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                        />

                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading
                                ? t('Posting...')
                                : t('CREATE TOPIC')}
                        </Button>

                    </Stack>

                </CardContent>
            </Card>

            {loading ? (

                <Box
                    display="flex"
                    justifyContent="center"
                    py={6}
                >
                    <CircularProgress />
                </Box>

            ) : topics.length === 0 ? (

                <Typography align="center">
                    {t('No community posts yet.')}
                </Typography>

            ) : (

                <Stack spacing={2}>

                    {topics.map((topic) => (

                        <Card
                            key={topic._id}
                            elevation={1}
                            sx={{
                                borderRadius: 3,
                            }}
                        >
                            <CardContent>

                                <Typography
                                    variant="h6"
                                    fontWeight={600}
                                >
                                    {topic.title}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={1}
                                >
                                    {topic.content}
                                </Typography>

                                <Box
                                    mt={2}
                                    display="flex"
                                    justifyContent="space-between"
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        👤 {topic.user?.name || t('Anonymous')}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        💬 {topic.comments?.length || 0}
                                    </Typography>
                                </Box>

                            </CardContent>
                        </Card>

                    ))}

                </Stack>

            )}

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert
                    severity="success"
                    variant="filled"
                >
                    {t('Topic created successfully!')}
                </Alert>
            </Snackbar>

        </Container>
    );
};

export default Community;