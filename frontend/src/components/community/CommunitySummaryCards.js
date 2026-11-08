import React from "react";

import {
    Grid,
} from "@mui/material";

import ForumIcon from "@mui/icons-material/Forum";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import CategoryIcon from "@mui/icons-material/Category";

import CommunityStatsCard from "./CommunityStatsCard";
import { useTranslation } from "react-i18next";

const CommunitySummaryCards = ({
    posts = [],
}) => {
    const { t } = useTranslation();

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

    const totalCategories = new Set(
        posts.map((post) => post.category)
    ).size;

    return (
        <Grid
            container
            spacing={{
                xs: 1.5,
                sm: 2,
            }}
            sx={{ mb: 3 }}
        >
            <Grid item xs={6} sm={3}>
                <CommunityStatsCard
                    title={t("Posts")}
                    value={totalPosts}
                    icon={
                        <ForumIcon color="primary" />
                    }
                />
            </Grid>

            <Grid item xs={6} sm={3}>
                <CommunityStatsCard
                    title={t("Comments")}
                    value={totalComments}
                    icon={
                        <CommentIcon color="success" />
                    }
                />
            </Grid>

            <Grid item xs={6} sm={3}>
                <CommunityStatsCard
                    title={t("Likes")}
                    value={totalLikes}
                    icon={
                        <FavoriteIcon color="error" />
                    }
                />
            </Grid>

            <Grid item xs={6} sm={3}>
                <CommunityStatsCard
                    title={t("Categories")}
                    value={totalCategories}
                    icon={
                        <CategoryIcon color="warning" />
                    }
                />
            </Grid>
        </Grid>
    );
};

export default CommunitySummaryCards;