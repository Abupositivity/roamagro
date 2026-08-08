import React from 'react';
import {
    Card,
    CardContent,
    Chip,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useTranslation } from 'react-i18next';

const statusColors = {
    Pending: 'default',
    'In Progress': 'info',
    Completed: 'success',
};

const ActivityCard = ({
    activity,
    loading = false,
    onEdit,
    onDelete,
}) => {
    const { t } = useTranslation();

    const completed = activity.status === 'Completed';

    const overdue =
        !completed &&
        activity.dueDate &&
        new Date(activity.dueDate) < new Date();

    return (
        <Card
            sx={{
                borderRadius: 3,
                borderLeft: overdue
                    ? '4px solid #d32f2f'
                    : '4px solid transparent',
            }}
        >
            <CardContent>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                >
                    <Stack spacing={1} flex={1}>
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                                textDecoration: completed
                                    ? 'line-through'
                                    : 'none',
                            }}
                        >
                            {activity.title}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                        >
                            <Chip
                                size="small"
                                label={t(activity.status || 'Pending')}
                                color={
                                    statusColors[
                                        activity.status
                                    ] || 'default'
                                }
                            />

                            {activity.dueDate && (
                                <Chip
                                    size="small"
                                    icon={<CalendarMonthIcon />}
                                    label={new Date(
                                        activity.dueDate
                                    ).toLocaleDateString()}
                                    color={
                                        overdue
                                            ? 'error'
                                            : 'default'
                                    }
                                />
                            )}
                        </Stack>

                        {overdue && (
                            <Typography
                                variant="caption"
                                color="error"
                            >
                                {t('This activity is overdue.')}
                            </Typography>
                        )}
                    </Stack>

                    <Stack direction="row">
                        <IconButton
                            size="small"
                            onClick={() => onEdit?.(activity)}
                            disabled={loading}
                            aria-label={t('Edit activity')}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete?.(activity)}
                            disabled={loading}
                            aria-label={t('Delete activity')}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default ActivityCard;