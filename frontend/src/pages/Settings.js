import React from 'react';
import{
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography
}from'@mui/material';
import{
    Brightness4,
    Language,
    Person,
    Info,
    Email,
    Edit,
    ArrowForward,
    VerifiedUser,
    Badge
}from'@mui/icons-material';
import{useSelector}from'react-redux';
import{useTranslation}from'react-i18next';
import{useNavigate}from'react-router-dom';
import ThemeSwitcher from'../components/ThemeSwitcher';
import LanguageSwitcher from'../components/LanguageSwitcher';
import PageLayout from'../components/layout/PageLayout';

const getRoleLabel=role=>{
    const labels={
        farmer:'Farmer',
        buyer:'Buyer',
        extension_officer:'Extension Officer',
        admin:'Administrator'
    };

    return labels[role]||'Farmer';
};

const Settings=({darkMode,setDarkMode})=>{
    const{t}=useTranslation();
    const navigate=useNavigate();
    const{user}=useSelector(state=>state.auth);

    const initials=user?.name
        ?.split(' ')
        .filter(Boolean)
        .slice(0,2)
        .map(part=>part.charAt(0).toUpperCase())
        .join('')||
        'R';

    const roleLabel=getRoleLabel(user?.role);

    return(
        <PageLayout>
            <Box
                sx={{
                    maxWidth:760,
                    mx:'auto',
                    px:{xs:1.5,sm:2},
                    pb:{xs:8,sm:5}
                }}
            >
                <Stack spacing={3}>
                    <Box>
                        <Typography
                            variant="h4"
                            fontWeight={800}
                            sx={{
                                fontSize:{
                                    xs:'1.8rem',
                                    sm:'2.2rem'
                                }
                            }}
                        >
                            {t('Settings')}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{mt:.5}}
                        >
                            {t(
                                'Customize your RoamAgro experience.'
                            )}
                        </Typography>
                    </Box>

                    <Card
                        elevation={1}
                        sx={{
                            borderRadius:4,
                            overflow:'hidden'
                        }}
                    >
                        <CardContent
                            sx={{
                                p:{xs:2,sm:3}
                            }}
                        >
                            <Stack
                                direction={{
                                    xs:'column',
                                    sm:'row'
                                }}
                                spacing={2}
                                alignItems={{
                                    xs:'stretch',
                                    sm:'center'
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                    sx={{
                                        flexGrow:1,
                                        minWidth:0
                                    }}
                                >
                                    <Avatar
                                        src={
                                            user?.profilePhoto||
                                            undefined
                                        }
                                        sx={{
                                            width:{
                                                xs:58,
                                                sm:68
                                            },
                                            height:{
                                                xs:58,
                                                sm:68
                                            },
                                            bgcolor:
                                                'primary.main',
                                            fontWeight:700,
                                            fontSize:{
                                                xs:22,
                                                sm:26
                                            }
                                        }}
                                    >
                                        {!user?.profilePhoto&&
                                            initials}
                                    </Avatar>

                                    <Box
                                        sx={{
                                            minWidth:0,
                                            flexGrow:1
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            fontWeight={800}
                                            sx={{
                                                wordBreak:
                                                    'break-word'
                                            }}
                                        >
                                            {user?.name||
                                                t('RoamAgro User')}
                                        </Typography>

                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            sx={{
                                                mt:.5,
                                                minWidth:0
                                            }}
                                        >
                                            <Email
                                                fontSize="small"
                                                color="action"
                                            />

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    overflow:
                                                        'hidden',
                                                    textOverflow:
                                                        'ellipsis',
                                                    whiteSpace:
                                                        'nowrap'
                                                }}
                                            >
                                                {user?.email||
                                                    'user@example.com'}
                                            </Typography>
                                        </Stack>

                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            flexWrap="wrap"
                                            useFlexGap
                                            sx={{mt:1}}
                                        >
                                            <Chip
                                                icon={
                                                    <Badge/>
                                                }
                                                label={
                                                    t(
                                                        roleLabel
                                                    )
                                                }
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                            />

                                            {user?.isVerified&&(
                                                <Chip
                                                    icon={
                                                        <VerifiedUser/>
                                                    }
                                                    label={
                                                        t(
                                                            'Verified'
                                                        )
                                                    }
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>

                                <Stack
                                    direction={{
                                        xs:'column',
                                        sm:'row'
                                    }}
                                    spacing={1}
                                    sx={{
                                        width:{
                                            xs:'100%',
                                            sm:'auto'
                                        }
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        startIcon={
                                            <Person/>
                                        }
                                        endIcon={
                                            <ArrowForward/>
                                        }
                                        onClick={()=>
                                            navigate(
                                                '/profile'
                                            )
                                        }
                                        sx={{
                                            borderRadius:2.5,
                                            width:{
                                                xs:'100%',
                                                sm:'auto'
                                            }
                                        }}
                                    >
                                        {t('View Profile')}
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={1}
                        sx={{borderRadius:4}}
                    >
                        <CardContent
                            sx={{
                                p:{xs:2,sm:3}
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                mb={2}
                            >
                                <Brightness4
                                    color="primary"
                                />

                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={800}
                                    >
                                        {t('Appearance')}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{mt:.25}}
                                    >
                                        {t(
                                            'Choose how RoamAgro looks on your device.'
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{mb:2.5}}/>

                            <ThemeSwitcher
                                darkMode={darkMode}
                                setDarkMode={setDarkMode}
                            />
                        </CardContent>
                    </Card>

                    <Card
                        elevation={1}
                        sx={{borderRadius:4}}
                    >
                        <CardContent
                            sx={{
                                p:{xs:2,sm:3}
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                mb={2}
                            >
                                <Language
                                    color="primary"
                                />

                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={800}
                                    >
                                        {t('Language')}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{mt:.25}}
                                    >
                                        {t(
                                            'Select your preferred language.'
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{mb:2.5}}/>

                            <LanguageSwitcher/>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={1}
                        sx={{borderRadius:4}}
                    >
                        <CardContent
                            sx={{
                                p:{xs:2,sm:3}
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                mb={2}
                            >
                                <Person
                                    color="primary"
                                />

                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={800}
                                    >
                                        {t('Account')}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{mt:.25}}
                                    >
                                        {t(
                                            'Manage your personal account information.'
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{mb:2.5}}/>

                            <Stack spacing={2}>
                                <Stack
                                    direction={{
                                        xs:'column',
                                        sm:'row'
                                    }}
                                    spacing={{
                                        xs:1,
                                        sm:2
                                    }}
                                    justifyContent="space-between"
                                    alignItems={{
                                        xs:'stretch',
                                        sm:'center'
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            fontWeight={700}
                                        >
                                            {t(
                                                'Profile Information'
                                            )}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {t(
                                                'Update your name, photo, bio, contact and location information.'
                                            )}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        startIcon={
                                            <Edit/>
                                        }
                                        onClick={()=>
                                            navigate(
                                                '/profile'
                                            )
                                        }
                                        sx={{
                                            borderRadius:2.5,
                                            minWidth:{
                                                xs:'100%',
                                                sm:150
                                            }
                                        }}
                                    >
                                        {t('Edit Profile')}
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={1}
                        sx={{borderRadius:4}}
                    >
                        <CardContent
                            sx={{
                                p:{xs:2,sm:3}
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                mb={2}
                            >
                                <Info
                                    color="primary"
                                />

                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={800}
                                    >
                                        {t('About')}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{mt:.25}}
                                    >
                                        {t(
                                            'Information about RoamAgro.'
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{mb:2.5}}/>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    lineHeight:1.7,
                                    mb:2.5
                                }}
                            >
                                {t(
                                    'RoamAgro is a digital agribusiness platform helping farmers manage projects, monitor market prices, connect with buyers and build thriving agricultural communities.'
                                )}
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                useFlexGap
                            >
                                <Chip
                                    label={t(
                                        'Version 1.0 MVP'
                                    )}
                                    color="primary"
                                />

                                <Chip
                                    label={t(
                                        'Northern Nigeria'
                                    )}
                                    variant="outlined"
                                />

                                <Chip
                                    label={t(
                                        'English / Hausa'
                                    )}
                                    variant="outlined"
                                />
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>
        </PageLayout>
    );
};

export default Settings;