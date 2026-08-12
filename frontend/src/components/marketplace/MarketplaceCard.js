import React from 'react';

import {
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
    Button,
    IconButton,
    Box,
    Divider,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import MarketplaceImage from './MarketplaceImage';

const formatPrice = (value) =>
    `₦${Number(value || 0).toLocaleString()}`;

const MarketplaceCard = ({
    listing,
    onEdit,
    onDelete,
    onToggleAvailability,
}) => {
    const { t } = useTranslation();

    /*
    |--------------------------------------------------------------------------
    | Current User
    |--------------------------------------------------------------------------
    */
    const currentUser = useSelector(
        (state) => state.auth?.user
    );

    const currentUserId =
        currentUser?._id ||
        currentUser?.id;

    const listingOwnerId =
        listing?.user?._id ||
        listing?.user?.id;

    /*
    |--------------------------------------------------------------------------
    | Ownership
    |--------------------------------------------------------------------------
    |
    | Only the user who created the listing should be able
    | to edit, delete, or change its availability.
    |
    */
    const isOwner =
        Boolean(
            currentUserId &&
                listingOwnerId &&
                String(currentUserId) ===
                    String(listingOwnerId)
        );

    /*
    |--------------------------------------------------------------------------
    | Seller Contact
    |--------------------------------------------------------------------------
    */
    const sellerPhone =
        listing?.user?.phone || '';

    const whatsappLink = sellerPhone
        ? `https://wa.me/${sellerPhone.replace(
              /\D/g,
              ''
          )}`
        : null;

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
            }}
        >
            {/* Listing Image */}
            <MarketplaceImage
                images={listing?.images || []}
            />

            <CardContent
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Title + Availability */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                    mb={1}
                >
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                            wordBreak:
                                'break-word',
                        }}
                    >
                        {listing?.title}
                    </Typography>

                    <Chip
                        size="small"
                        label={
                            listing?.available
                                ? t('Available')
                                : t('Sold')
                        }
                        color={
                            listing?.available
                                ? 'success'
                                : 'default'
                        }
                    />
                </Stack>

                {/* Description */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={2}
                    sx={{
                        display:
                            '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient:
                            'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {listing?.description}
                </Typography>

                {/* Price */}
                <Typography
                    fontWeight={700}
                    fontSize={20}
                    color="primary.main"
                >
                    {formatPrice(
                        listing?.price
                    )}
                </Typography>

                {/* Quantity */}
                <Typography
                    variant="body2"
                    mb={1}
                >
                    {listing?.quantity ||
                        0}{' '}
                    {listing?.unit || ''}
                </Typography>

                {/* Location */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    📍{' '}
                    {listing?.location ||
                        t(
                            'Unknown Location'
                        )}
                </Typography>

                {/* Category */}
                {listing?.category && (
                    <Box mt={1}>
                        <Chip
                            size="small"
                            variant="outlined"
                            label={t(
                                listing.category
                            )}
                        />
                    </Box>
                )}

                {/* Seller Information */}
                {listing?.user && (
                    <Stack
                        spacing={0.5}
                        mt={2}
                    >
                        <Typography fontWeight={600}>
                            👤{' '}
                            {listing.user.name ||
                                t('Seller')}
                        </Typography>

                        {listing.user
                            .location && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                📍{' '}
                                {
                                    listing.user
                                        .location
                                }
                            </Typography>
                        )}
                    </Stack>
                )}

                {/* Push actions to bottom */}
                <Box
                    sx={{
                        flexGrow: 1,
                    }}
                />

                <Divider sx={{ my: 2 }} />

                {/* Seller Contact Actions */}
                <Stack spacing={1}>
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={
                            <PhoneIcon />
                        }
                        href={
                            sellerPhone
                                ? `tel:${sellerPhone}`
                                : undefined
                        }
                        disabled={!sellerPhone}
                    >
                        {t('Call Seller')}
                    </Button>

                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={
                            <WhatsAppIcon />
                        }
                        href={
                            whatsappLink ||
                            undefined
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        disabled={
                            !whatsappLink
                        }
                    >
                        {t(
                            'WhatsApp Seller'
                        )}
                    </Button>

                    {!sellerPhone && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            textAlign="center"
                        >
                            {t(
                                'Seller has not provided a phone number.'
                            )}
                        </Typography>
                    )}
                </Stack>

                {/* Owner-only Controls */}
                {isOwner && (
                    <>
                        {/* Availability */}
                        <Button
                            fullWidth
                            variant="outlined"
                            color={
                                listing?.available
                                    ? 'warning'
                                    : 'success'
                            }
                            sx={{
                                mt: 1.5,
                            }}
                            onClick={() =>
                                onToggleAvailability?.(
                                    listing
                                )
                            }
                        >
                            {listing?.available
                                ? t(
                                      'Mark as Sold'
                                  )
                                : t(
                                      'Mark Available'
                                  )}
                        </Button>

                        {/* Edit / Delete */}
                        <Stack
                            direction="row"
                            justifyContent="flex-end"
                            spacing={0.5}
                            mt={1}
                        >
                            <IconButton
                                size="small"
                                aria-label={t(
                                    'Edit listing'
                                )}
                                onClick={() =>
                                    onEdit?.(
                                        listing
                                    )
                                }
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                                size="small"
                                color="error"
                                aria-label={t(
                                    'Delete listing'
                                )}
                                onClick={() =>
                                    onDelete?.(
                                        listing
                                    )
                                }
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default MarketplaceCard;