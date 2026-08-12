import React from 'react';

import {
    Paper,
    Typography,
    Chip,
    Stack,
    Box,
    IconButton,
    Divider,
    CircularProgress,
    Tooltip,
} from '@mui/material';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StorefrontIcon from '@mui/icons-material/Storefront';

import { useTranslation } from 'react-i18next';

import PriceTrendBadge from './PriceTrendBadge';

const PriceCard = ({
    entry,
    bestPrice = false,
    trend = 'stable',
    currentUser,
    onDelete,
    deleting = false,
}) => {

    const { t } = useTranslation();

    const isOwner =
        currentUser?._id === entry.user?._id;

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: '0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                },
            }}
        >
            <Box>

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                >
                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        {entry.product}
                    </Typography>

                    <Stack spacing={1}>
                        {bestPrice && (
                            <Chip
                                label={t('Best')}
                                color="success"
                                size="small"
                            />
                        )}

                        <PriceTrendBadge
                            trend={trend}
                        />
                    </Stack>
                </Stack>

                {entry.category && (
                    <Chip
                        label={entry.category}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                )}

                <Typography
                    variant="h5"
                    color="primary.main"
                    fontWeight={700}
                    mb={1}
                >
                    ₦
                    {Number(
                        entry.price
                    ).toLocaleString()}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                >
                    {entry.unit}
                </Typography>

                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mt={2}
                >
                    <StorefrontIcon
                        fontSize="small"
                        color="action"
                    />
                    <Typography variant="body2">
                        {entry.market}
                    </Typography>
                </Stack>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={1}
                >
                    {entry.location}
                </Typography>
            </Box>

            <Box mt={3}>
                <Divider sx={{ mb: 2 }} />

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box>
                        <Typography
                            variant="caption"
                            display="block"
                            fontWeight={600}
                        >
                            {entry.user?.name ||
                                t('Farmer')}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {new Date(
                                entry.createdAt
                            ).toLocaleDateString()}
                        </Typography>
                    </Box>

                    {isOwner && (
                        <Tooltip
                            title={t(
                                'Delete my price'
                            )}
                        >
                            <IconButton
                                color="error"
                                size="small"
                                onClick={() =>
                                    onDelete(
                                        entry._id
                                    )
                                }
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <CircularProgress
                                        size={18}
                                    />
                                ) : (
                                    <DeleteOutlineIcon />
                                )}
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </Box>
        </Paper>
    );
};

export default PriceCard;