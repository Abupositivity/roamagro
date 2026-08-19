import React from'react';

import{
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Stack,
    Typography
}from'@mui/material';

import EditIcon from'@mui/icons-material/Edit';
import DeleteIcon from'@mui/icons-material/Delete';
import PhoneIcon from'@mui/icons-material/Phone';
import WhatsAppIcon from'@mui/icons-material/WhatsApp';
import PersonOutlineIcon from'@mui/icons-material/PersonOutline';

import {useSelector}from'react-redux';
import {useTranslation}from'react-i18next';

import MarketplaceImage from'./MarketplaceImage';

const formatPrice=value=>
    `₦${Number(value||0).toLocaleString()}`;

const getInitials=name=>
    name
        ?.split(' ')
        .filter(Boolean)
        .slice(0,2)
        .map(
            part=>
                part
                    .charAt(0)
                    .toUpperCase()
        )
        .join('')||
    'U';

const MarketplaceCard=({
    listing,
    onEdit,
    onDelete,
    onToggleAvailability,
    onOpenProfile
})=>{
    const{t}=useTranslation();

    const currentUser=useSelector(
        state=>state.auth?.user
    );

    const currentUserId=
        currentUser?._id||
        currentUser?.id;

    const listingOwnerId=
        listing?.user?._id||
        listing?.user?.id;

    const isOwner=Boolean(
        currentUserId&&
        listingOwnerId&&
        String(currentUserId)===
        String(listingOwnerId)
    );

    const sellerPhone=
        listing?.user?.phone||
        '';

    const sellerName=
        listing?.user?.name||
        t('Seller');

    const sellerPhoto=
        listing?.user?.profilePhoto||
        '';

    const whatsappLink=sellerPhone
        ?`https://wa.me/${sellerPhone.replace(/\D/g,'')}`
        :null;

    const handleOpenProfile=()=>{
        if(
            listingOwnerId&&
            onOpenProfile
        ){
            onOpenProfile(
                String(listingOwnerId)
            );
        }
    };

    return(
        <Card
            sx={{
                height:'100%',
                display:'flex',
                flexDirection:'column',
                borderRadius:3,
                overflow:'hidden'
            }}
        >
            <MarketplaceImage
                images={listing?.images||[]}
            />

            <CardContent
                sx={{
                    flexGrow:1,
                    display:'flex',
                    flexDirection:'column'
                }}
            >
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
                            wordBreak:'break-word'
                        }}
                    >
                        {listing?.title}
                    </Typography>

                    <Chip
                        size="small"
                        label={
                            listing?.available
                                ?t('Available')
                                :t('Sold')
                        }
                        color={
                            listing?.available
                                ?'success'
                                :'default'
                        }
                    />
                </Stack>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={2}
                    sx={{
                        display:'-webkit-box',
                        WebkitLineClamp:3,
                        WebkitBoxOrient:'vertical',
                        overflow:'hidden'
                    }}
                >
                    {listing?.description}
                </Typography>

                <Typography
                    fontWeight={700}
                    fontSize={20}
                    color="primary.main"
                >
                    {formatPrice(
                        listing?.price
                    )}
                </Typography>

                <Typography
                    variant="body2"
                    mb={1}
                >
                    {listing?.quantity||0}{' '}
                    {listing?.unit||''}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    📍{' '}
                    {listing?.location||
                        t('Unknown Location')}
                </Typography>

                {listing?.category&&(
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

                {listing?.user&&(
                    <Box mt={2}>
                        <Stack
                            direction="row"
                            spacing={1.25}
                            alignItems="center"
                        >
                            <Avatar
                                src={
                                    sellerPhoto||
                                    undefined
                                }
                                alt={sellerName}
                                onClick={
                                    handleOpenProfile
                                }
                                sx={{
                                    width:42,
                                    height:42,
                                    bgcolor:'primary.main',
                                    fontWeight:700,
                                    cursor:
                                        listingOwnerId&&
                                        onOpenProfile
                                            ?'pointer'
                                            :'default'
                                }}
                            >
                                {!sellerPhoto&&
                                    getInitials(
                                        sellerName
                                    )}
                            </Avatar>

                            <Box
                                sx={{
                                    minWidth:0,
                                    flex:1
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                >
                                    {t('Seller')}
                                </Typography>

                                <Typography
                                    fontWeight={700}
                                    onClick={
                                        handleOpenProfile
                                    }
                                    sx={{
                                        overflow:'hidden',
                                        textOverflow:'ellipsis',
                                        whiteSpace:'nowrap',
                                        cursor:
                                            listingOwnerId&&
                                            onOpenProfile
                                                ?'pointer'
                                                :'default',
                                        '&:hover':
                                            listingOwnerId&&
                                            onOpenProfile
                                                ?{
                                                    color:
                                                        'primary.main'
                                                }
                                                :{}
                                    }}
                                >
                                    {sellerName}
                                </Typography>

                                {listing.user.location&&(
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            overflow:'hidden',
                                            textOverflow:'ellipsis',
                                            whiteSpace:'nowrap'
                                        }}
                                    >
                                        📍{' '}
                                        {
                                            listing
                                                .user
                                                .location
                                        }
                                    </Typography>
                                )}
                            </Box>

                            {listingOwnerId&&
                                onOpenProfile&&(
                                    <IconButton
                                        size="small"
                                        onClick={
                                            handleOpenProfile
                                        }
                                        aria-label={t(
                                            'View seller profile'
                                        )}
                                    >
                                        <PersonOutlineIcon/>
                                    </IconButton>
                                )}
                        </Stack>
                    </Box>
                )}

                <Box
                    sx={{
                        flexGrow:1
                    }}
                />

                <Divider sx={{my:2}}/>

                <Stack spacing={1}>
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={
                            <PhoneIcon/>
                        }
                        href={
                            sellerPhone
                                ?`tel:${sellerPhone}`
                                :undefined
                        }
                        disabled={!sellerPhone}
                    >
                        {t('Call Seller')}
                    </Button>

                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={
                            <WhatsAppIcon/>
                        }
                        href={
                            whatsappLink||
                            undefined
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        disabled={
                            !whatsappLink
                        }
                    >
                        {t('WhatsApp Seller')}
                    </Button>

                    {!sellerPhone&&(
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

                {isOwner&&(
                    <>
                        <Button
                            fullWidth
                            variant="outlined"
                            color={
                                listing?.available
                                    ?'warning'
                                    :'success'
                            }
                            sx={{
                                mt:1.5
                            }}
                            onClick={()=>
                                onToggleAvailability?.(
                                    listing
                                )
                            }
                        >
                            {listing?.available
                                ?t('Mark as Sold')
                                :t('Mark Available')}
                        </Button>

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
                                onClick={()=>
                                    onEdit?.(
                                        listing
                                    )
                                }
                            >
                                <EditIcon fontSize="small"/>
                            </IconButton>

                            <IconButton
                                size="small"
                                color="error"
                                aria-label={t(
                                    'Delete listing'
                                )}
                                onClick={()=>
                                    onDelete?.(
                                        listing
                                    )
                                }
                            >
                                <DeleteIcon fontSize="small"/>
                            </IconButton>
                        </Stack>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default MarketplaceCard;