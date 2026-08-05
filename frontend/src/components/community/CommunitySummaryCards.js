import React from 'react';

import {
    Grid,
} from '@mui/material';

import ForumIcon from '@mui/icons-material/Forum';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import CategoryIcon from '@mui/icons-material/Category';

import CommunityStatsCard from './CommunityStatsCard';

const CommunitySummaryCards = ({
    posts = [],
}) => {

    const totalPosts = posts.length;

    const totalComments = posts.reduce(

        (sum, post) =>

            sum + (post.comments?.length || 0),

        0

    );

    const totalLikes = posts.reduce(

        (sum, post) =>

            sum + (post.likes?.length || 0),

        0

    );

    const totalCategories =

        new Set(

            posts.map(

                post => post.category

            )

        ).size;

    return (

        <Grid
            container
            spacing={2}
            mb={4}
        >

            <Grid
                item
                xs={6}
                md={3}
            >

                <CommunityStatsCard
                    title="Posts"
                    value={totalPosts}
                    icon={<ForumIcon />}
                />

            </Grid>

            <Grid
                item
                xs={6}
                md={3}
            >

                <CommunityStatsCard
                    title="Comments"
                    value={totalComments}
                    icon={<CommentIcon />}
                    color="success.main"
                />

            </Grid>

            <Grid
                item
                xs={6}
                md={3}
            >

                <CommunityStatsCard
                    title="Likes"
                    value={totalLikes}
                    icon={<FavoriteIcon />}
                    color="error.main"
                />

            </Grid>

            <Grid
                item
                xs={6}
                md={3}
            >

                <CommunityStatsCard
                    title="Categories"
                    value={totalCategories}
                    icon={<CategoryIcon />}
                    color="warning.main"
                />

            </Grid>

        </Grid>

    );

};

export default CommunitySummaryCards;