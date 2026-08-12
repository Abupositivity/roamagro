import React, {
    useEffect,
    useState,
} from 'react';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Container,
    Grid,
    Snackbar,
    Typography,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import PublicIcon from '@mui/icons-material/Public';

import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
    fetchTopics,
    createTopic,
} from '../../redux/actions/communityActions';

import FeaturedPosts from './FeaturedPosts';
import PostComposer from './PostComposer';
import CommunityFeed from './CommunityFeed';
import CommunitySummaryCards from './CommunitySummaryCards';
import TrendingCategories from './TrendingCategories';
import RecentActivity from './RecentActivity';
import CommunitySearchBar from './CommunitySearchBar';
import CommunityCategoryFilter from './CommunityCategoryFilter';

const Community = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        topics,
        loading,
        error,
        page,
        limit,
        hasMore,
        loadingMore,
    } = useSelector(
        (state) => state.community
    );

    const [openSnackbar, setOpenSnackbar] =
        useState(false);

    const [search, setSearch] =
        useState('');

    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState('All');

    const [showMyPosts, setShowMyPosts] =
        useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        image: '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(
                fetchTopics({
                    page: 1,
                    limit,
                    search,
                    category: selectedCategory,
                    mine: showMyPosts,
                })
            );
        }, 400);

        return () => clearTimeout(timer);
    }, [
        dispatch,
        search,
        selectedCategory,
        showMyPosts,
        limit,
    ]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]:
                e.target.value,
        }));
    };

    const handleSubmit = async () => {
        if (
            !formData.title.trim() ||
            !formData.content.trim()
        ) {
            return;
        }

        const result = await dispatch(
            createTopic(formData)
        );

        if (result?.success) {
            setFormData({
                title: '',
                content: '',
                category: 'General',
                image: '',
            });

            setOpenSnackbar(true);
        }
    };

    const featuredPosts = topics.filter(
        (post) => post.featured
    );

    const communityFeed = topics.filter(
        (post) => !post.featured
    );

    const handleLoadMore = () => {
        if (!hasMore || loadingMore) {
            return;
        }

        dispatch(
            fetchTopics({
                page: page + 1,
                limit,
                search,
                category: selectedCategory,
                mine: showMyPosts,
                append: true,
            })
        );
    };

    const handleToggleMyPosts = () => {
        setShowMyPosts(
            (previous) => !previous
        );
    };

    return (
        <Container
            maxWidth="md"
            sx={{
                py: 3,
                pb: 12,
            }}
        >
            <Box>
                <Typography
                    variant="h4"
                    fontWeight={700}
                    gutterBottom
                >
                    {t('Community')}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                >
                    {t(
                        'Share experiences, ask questions and learn from fellow farmers.'
                    )}
                </Typography>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>
            )}

            <PostComposer
                formData={formData}
                loading={loading}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />

            <Grid
                container
                spacing={2}
                mb={3}
            >
                <Grid item xs={12} sm={7}>
                    <CommunitySearchBar
                        search={search}
                        onSearchChange={setSearch}
                    />
                </Grid>

                <Grid item xs={12} sm={5}>
                    <CommunityCategoryFilter
                        value={selectedCategory}
                        onChange={
                            setSelectedCategory
                        }
                    />
                </Grid>
            </Grid>

            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    mb: 3,
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    variant={
                        !showMyPosts
                            ? 'contained'
                            : 'outlined'
                    }
                    startIcon={
                        <PublicIcon />
                    }
                    onClick={() => {
                        if (showMyPosts) {
                            handleToggleMyPosts();
                        }
                    }}
                >
                    {t('All Posts')}
                </Button>

                <Button
                    variant={
                        showMyPosts
                            ? 'contained'
                            : 'outlined'
                    }
                    startIcon={
                        <ArticleOutlinedIcon />
                    }
                    onClick={() => {
                        if (!showMyPosts) {
                            handleToggleMyPosts();
                        }
                    }}
                >
                    {t('My Posts')}
                </Button>
            </Box>

            <Box mb={3}>
                <CommunitySummaryCards
                    posts={topics}
                />
            </Box>

            {!showMyPosts && (
                <FeaturedPosts
                    posts={featuredPosts}
                />
            )}

            <CommunityFeed
                loading={loading}
                posts={communityFeed}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={handleLoadMore}
            />

            <Accordion
                disableGutters
                elevation={1}
                sx={{
                    mt: 4,
                    borderRadius: 3,
                    overflow: 'hidden',
                    '&:before': {
                        display: 'none',
                    },
                }}
            >
                <AccordionSummary
                    expandIcon={
                        <ExpandMoreIcon />
                    }
                    sx={{
                        px: 2,
                        minHeight: 56,
                        '& .MuiAccordionSummary-content':
                            {
                                alignItems:
                                    'center',
                            },
                    }}
                >
                    <InsightsOutlinedIcon
                        sx={{
                            mr: 1.5,
                            color: 'success.main',
                        }}
                    />

                    <Typography
                        fontWeight={700}
                    >
                        {t('Community Insights')}
                    </Typography>
                </AccordionSummary>

                <AccordionDetails
                    sx={{
                        px: 2,
                        pb: 2,
                    }}
                >
                    <Box mb={3}>
                        <TrendingCategories
                            posts={topics}
                        />
                    </Box>

                    <RecentActivity
                        posts={topics}
                    />
                </AccordionDetails>
            </Accordion>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() =>
                    setOpenSnackbar(false)
                }
            >
                <Alert
                    severity="success"
                    variant="filled"
                >
                    {t(
                        'Community post created successfully!'
                    )}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Community;