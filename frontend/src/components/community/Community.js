import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Container,
    Snackbar,
    Typography,
} from '@mui/material';

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
    } = useSelector(
        state => state.community
    );
    const [openSnackbar, setOpenSnackbar] =
        useState(false);

    /*
    ------------------------------------------------
    Search & Filter
    ------------------------------------------------
    */
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] =
        useState('All');

    /*
    ------------------------------------------------
    Create Post Form
    ------------------------------------------------
    */
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        image: '',
    });
    useEffect(() => {
        dispatch(fetchTopics());
    }, [dispatch]);

    /*
    ------------------------------------------------
    Form
    ------------------------------------------------
    */
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    const handleSubmit = () => {
        if (
            !formData.title ||
            !formData.content
        ) {
            return;
        }
        dispatch(createTopic(formData));
        setFormData({
            title: '',
            content: '',
            category: 'General',
            image: '',
        });
        setOpenSnackbar(true);
    };

    /*
    ------------------------------------------------
    Categories
    ------------------------------------------------
    */
    const categories = useMemo(() => {
        return [
            'All',
            ...new Set(
                topics
                    .map(post => post.category)
                    .filter(Boolean)
            ),
        ];
    }, [topics]);

    /*
    ------------------------------------------------
    Filtered Topics
    ------------------------------------------------
    */
    const filteredTopics = useMemo(() => {
        return topics.filter(post => {
            const keyword = search.toLowerCase();
            const matchesSearch =
                (post.title || '')
                    .toLowerCase()
                    .includes(keyword)
                ||
                (post.content || '')
                    .toLowerCase()
                    .includes(keyword);
            const matchesCategory =
                selectedCategory === 'All'
                ||
                post.category === selectedCategory;
            return (
                matchesSearch &&
                matchesCategory
            );
        });
    }, [
        topics,
        search,
        selectedCategory,
    ]);

    /*
    ------------------------------------------------
    Featured
    ------------------------------------------------
    */
    const featuredPosts = useMemo(() => {
        return filteredTopics.filter(
            post => post.featured
        );
    }, [filteredTopics]);

    /*
    ------------------------------------------------
    Feed
    ------------------------------------------------
    */
    const communityFeed = useMemo(() => {
        return filteredTopics.filter(
            post => !post.featured
        );
    }, [filteredTopics]);

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
                {t('Community')}
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                mb={4}
            >
                {t(
                    'Share experiences, ask questions and learn from fellow farmers.'
                )}
            </Typography>
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>
            )}
            <Box mb={3}>
                <CommunitySummaryCards
                    posts={filteredTopics}
                />
            </Box>
            <Box mb={3}>
                <TrendingCategories
                    posts={filteredTopics}
                />
            </Box>
            <Box mb={3}>
                <RecentActivity
                    posts={filteredTopics}
                />
            </Box>
            <Box mb={3}>
                <CommunitySearchBar
                    search={search}
                    onSearchChange={setSearch}
                />
            </Box>
            <Box mb={3}>
                <CommunityCategoryFilter
                    categories={categories}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                />
            </Box>
            <FeaturedPosts
                posts={featuredPosts}
            />
            <PostComposer
                formData={formData}
                loading={loading}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
            <CommunityFeed
                loading={loading}
                posts={communityFeed}
            />
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