import React from'react';
import{
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography
}from'@mui/material';
import LocationOnOutlinedIcon from'@mui/icons-material/LocationOnOutlined';
import BadgeOutlinedIcon from'@mui/icons-material/BadgeOutlined';
import ConnectionButton from'./ConnectionButton';

const getInitials=name=>
    name
        ?.split(' ')
        .filter(Boolean)
        .slice(0,2)
        .map(
            part=>
                part.charAt(0).toUpperCase()
        )
        .join('')||
    'U';

const getRoleLabel=role=>{
    const labels={
        farmer:'Farmer',
        buyer:'Buyer',
        extension_officer:'Extension Officer',
        admin:'Administrator'
    };

    return labels[role]||'User';
};

const UserCard=({
    user,
    connectionStatus='none',
    onOpenProfile,
    onConnectionChange
})=>{
    const openProfile=()=>{
        if(onOpenProfile){
            onOpenProfile(user._id);
        }
    };

    return(
        <Card
            elevation={1}
            sx={{
                borderRadius:3,
                height:'100%'
            }}
        >
            <CardContent>
                <Stack spacing={2}>
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                    >
                        <Avatar
                            src={
                                user.profilePhoto||
                                undefined
                            }
                            sx={{
                                width:58,
                                height:58,
                                bgcolor:'primary.main',
                                fontWeight:700,
                                cursor:onOpenProfile?
                                    'pointer':
                                    'default'
                            }}
                            onClick={openProfile}
                        >
                            {!user.profilePhoto&&
                                getInitials(user.name)}
                        </Avatar>

                        <Box
                            sx={{
                                minWidth:0,
                                flex:1
                            }}
                        >
                            <Typography
                                fontWeight={800}
                                onClick={openProfile}
                                sx={{
                                    overflow:'hidden',
                                    textOverflow:'ellipsis',
                                    whiteSpace:'nowrap',
                                    cursor:onOpenProfile?
                                        'pointer':
                                        'default',
                                    '&:hover':onOpenProfile?
                                        {
                                            color:'primary.main'
                                        }:
                                        {}
                                }}
                            >
                                {user.name}
                            </Typography>

                            <Chip
                                size="small"
                                icon={
                                    <BadgeOutlinedIcon/>
                                }
                                label={
                                    getRoleLabel(
                                        user.role
                                    )
                                }
                                color="success"
                                variant="outlined"
                                sx={{mt:.5}}
                            />
                        </Box>
                    </Stack>

                    {user.bio&&(
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                display:'-webkit-box',
                                WebkitLineClamp:3,
                                WebkitBoxOrient:'vertical',
                                overflow:'hidden'
                            }}
                        >
                            {user.bio}
                        </Typography>
                    )}

                    {(user.state||user.location)&&(
                        <Stack
                            direction="row"
                            spacing={.7}
                            alignItems="center"
                        >
                            <LocationOnOutlinedIcon
                                fontSize="small"
                                color="action"
                            />

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {[
                                    user.location,
                                    user.state
                                ]
                                    .filter(Boolean)
                                    .join(', ')}
                            </Typography>
                        </Stack>
                    )}

                    <Stack
                        direction={{
                            xs:'column',
                            sm:'row'
                        }}
                        spacing={1}
                    >
                        <ConnectionButton
                            userId={user._id}
                            userName={user.name}
                            status={connectionStatus}
                            fullWidth
                            onChange={
                                onConnectionChange
                            }
                        />
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default UserCard;