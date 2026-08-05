import React, { useMemo } from 'react';

import {
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText,
    Typography,
} from '@mui/material';

import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { useTranslation } from 'react-i18next';

const RecentActivity = ({
    posts = [],
}) => {

    const { t } = useTranslation();

    const recentPosts = useMemo(() => {
        return [...posts]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 5);
    }, [posts]);
    if (recentPosts.length === 0) {
        return null;
    }
    return (
        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
                mb: 4,
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                >
                    <AccessTimeIcon
                        fontSize="small"
                        sx={{
                            mr: 1,
                            verticalAlign: 'middle',
                        }}
                    />
                    {t('Recent Activity')}
                </Typography>
                <List disablePadding>
                    {recentPosts.map((post, index) => (
                        <React.Fragment
                            key={post._id}
                        >
                            <ListItem
                                disableGutters
                            >
                                <ListItemText
                                    primary={post.title}
                                    secondary={
                                        `${post.user?.name || t('Farmer')} • ${new Date(
                                            post.createdAt
                                        ).toLocaleDateString()}`
                                    }
                                />
                            </ListItem>
                            {index !==
                                recentPosts.length - 1 && (
                                <Divider />
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default RecentActivity;