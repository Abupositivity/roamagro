import React from 'react';
import {
    Alert,
    Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import ActivityCard from './ActivityCard';

const ActivityList = ({
    activities = [],
    loading = false,
    onEdit,
    onDelete,
}) => {
    const { t } = useTranslation();

    if (!activities.length) {
        return (
            <Alert severity="info">
                {t('No activities yet.')}
            </Alert>
        );
    }

    const sortedActivities = [...activities].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return (
            new Date(a.dueDate) -
            new Date(b.dueDate)
        );
    });

    return (
        <Grid container spacing={2}>
            {sortedActivities.map((activity) => (
                <Grid
                    item
                    xs={12}
                    key={activity._id}
                >
                    <ActivityCard
                        activity={activity}
                        loading={loading}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default ActivityList;