import React,{useEffect,useRef,useState}from'react';
import{Alert,Avatar,Box,Button,Card,CardActionArea,CardContent,Chip,CircularProgress,Dialog,DialogActions,DialogContent,DialogTitle,Divider,Grid,IconButton,MenuItem,Snackbar,Stack,TextField,Typography}from'@mui/material';
import EditIcon from'@mui/icons-material/Edit';
import CameraAltIcon from'@mui/icons-material/CameraAlt';
import DeleteIcon from'@mui/icons-material/Delete';
import EmailOutlinedIcon from'@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from'@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from'@mui/icons-material/LocationOnOutlined';
import PublicOutlinedIcon from'@mui/icons-material/PublicOutlined';
import BadgeOutlinedIcon from'@mui/icons-material/BadgeOutlined';
import HomeOutlinedIcon from'@mui/icons-material/HomeOutlined';
import LanguageOutlinedIcon from'@mui/icons-material/LanguageOutlined';
import InfoOutlinedIcon from'@mui/icons-material/InfoOutlined';
import PeopleAltOutlinedIcon from'@mui/icons-material/PeopleAltOutlined';
import ArticleOutlinedIcon from'@mui/icons-material/ArticleOutlined';
import StorefrontOutlinedIcon from'@mui/icons-material/StorefrontOutlined';
import ArrowForwardIosIcon from'@mui/icons-material/ArrowForwardIos';
import AddPhotoAlternateOutlinedIcon from'@mui/icons-material/AddPhotoAlternateOutlined';
import{useDispatch,useSelector}from'react-redux';
import{useTranslation}from'react-i18next';
import{useNavigate}from'react-router-dom';
import{updateProfile}from'../redux/actions/authActions';
import api from'../services/api';
import{fetchConnections}from'../redux/actions/connectionActions';
import PublicProfile from'../components/connections/PublicProfile';

const MAX_IMAGE_SIZE=1200;
const IMAGE_QUALITY=.75;
const MAX_BIO_LENGTH=500;

const compressImage=file=>new Promise((resolve,reject)=>{
    if(!file?.type?.startsWith('image/')){
        reject(new Error('Please select a valid image file.'));
        return;
    }

    const reader=new FileReader();

    reader.onload=event=>{
        const image=new Image();

        image.onload=()=>{
            let width=image.width;
            let height=image.height;

            if(width>MAX_IMAGE_SIZE||height>MAX_IMAGE_SIZE){
                if(width>height){
                    height=height/width*MAX_IMAGE_SIZE;
                    width=MAX_IMAGE_SIZE;
                }else{
                    width=width/height*MAX_IMAGE_SIZE;
                    height=MAX_IMAGE_SIZE;
                }
            }

            const canvas=document.createElement('canvas');
            canvas.width=Math.round(width);
            canvas.height=Math.round(height);

            const context=canvas.getContext('2d');

            if(!context){
                reject(new Error('Unable to process the selected image.'));
                return;
            }

            context.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
            );

            try{
                resolve(
                    canvas.toDataURL(
                        'image/jpeg',
                        IMAGE_QUALITY
                    )
                );
            }catch{
                reject(
                    new Error(
                        'Unable to compress the selected image.'
                    )
                );
            }
        };

        image.onerror=()=>{
            reject(
                new Error(
                    'Unable to process the selected image.'
                )
            );
        };

        image.src=event.target.result;
    };

    reader.onerror=()=>{
        reject(
            new Error(
                'Unable to read the selected image.'
            )
        );
    };

    reader.readAsDataURL(file);
});

const getRoleLabel=role=>{
    if(!role)return'Farmer';

    const labels={
        farmer:'Farmer',
        buyer:'Buyer',
        extension_officer:'Extension Officer',
        admin:'Administrator'
    };

    return labels[role]||
        role.charAt(0).toUpperCase()+role.slice(1);
};

const getInitials=name=>
    name?.split(' ')
        .filter(Boolean)
        .slice(0,2)
        .map(part=>part.charAt(0).toUpperCase())
        .join('')||'U';

const formatDate=value=>{
    if(!value)return'';

    const date=new Date(value);

    return Number.isNaN(date.getTime())
        ?''
        :date.toLocaleDateString();
};

const ProfileInfo=({icon,label,value})=>(
    <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-start"
    >
        <Box
            sx={{
                color:'primary.main',
                display:'flex',
                pt:.2,
                flexShrink:0
            }}
        >
            {icon}
        </Box>

        <Box sx={{minWidth:0}}>
            <Typography
                variant="caption"
                color="text.secondary"
                display="block"
            >
                {label}
            </Typography>

            <Typography
                variant="body1"
                fontWeight={600}
                sx={{wordBreak:'break-word'}}
            >
                {value||'Not provided'}
            </Typography>
        </Box>
    </Stack>
);

const SectionHeader=({
    icon,
    title,
    description,
    action,
    actionLabel
})=>(
    <Stack
        direction={{xs:'column',sm:'row'}}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{xs:'stretch',sm:'center'}}
    >
        <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{minWidth:0}}
        >
            <Box
                sx={{
                    display:'flex',
                    color:'primary.main',
                    flexShrink:0
                }}
            >
                {icon}
            </Box>

            <Box sx={{minWidth:0}}>
                <Typography variant="h6" fontWeight={800}>
                    {title}
                </Typography>

                {description&&(
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{mt:.25}}
                    >
                        {description}
                    </Typography>
                )}
            </Box>
        </Stack>

        {action&&(
            <Button
                size="small"
                endIcon={
                    <ArrowForwardIosIcon
                        sx={{fontSize:'12px!important'}}
                    />
                }
                onClick={action}
                sx={{
                    alignSelf:{
                        xs:'flex-start',
                        sm:'auto'
                    },
                    flexShrink:0
                }}
            >
                {actionLabel}
            </Button>
        )}
    </Stack>
);

const ActivityCard=({post,onClick,t})=>{
    const title=
        post?.title||
        post?.category||
        t('Community post');

    const content=post?.content||'';

    return(
        <Card
            variant="outlined"
            sx={{
                borderRadius:3,
                height:'100%',
                transition:
                    'transform .18s ease,box-shadow .18s ease',
                '&:hover':{
                    transform:'translateY(-2px)',
                    boxShadow:2
                },
                '&:active':{
                    transform:'scale(.99)'
                }
            }}
        >
            <CardActionArea
                onClick={onClick}
                sx={{height:'100%'}}
            >
                <CardContent
                    sx={{
                        p:{
                            xs:1.75,
                            sm:2
                        }
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                    >
                        <Avatar
                            sx={{
                                bgcolor:'primary.main',
                                width:{
                                    xs:40,
                                    sm:42
                                },
                                height:{
                                    xs:40,
                                    sm:42
                                },
                                flexShrink:0
                            }}
                        >
                            <ArticleOutlinedIcon fontSize="small"/>
                        </Avatar>

                        <Box
                            sx={{
                                minWidth:0,
                                flex:1
                            }}
                        >
                            <Typography
                                fontWeight={700}
                                sx={{
                                    overflowWrap:'anywhere'
                                }}
                            >
                                {title}
                            </Typography>

                            {post?.category&&(
                                <Chip
                                    label={post.category}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        mt:.75,
                                        maxWidth:'100%'
                                    }}
                                />
                            )}

                            {content&&(
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt:1,
                                        display:'-webkit-box',
                                        WebkitLineClamp:3,
                                        WebkitBoxOrient:'vertical',
                                        overflow:'hidden',
                                        lineHeight:1.5
                                    }}
                                >
                                    {content}
                                </Typography>
                            )}

                            {post?.createdAt&&(
                                <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    display="block"
                                    sx={{mt:1}}
                                >
                                    {formatDate(post.createdAt)}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

const ListingCard=({listing,onClick,t})=>{
    const title=
        listing?.title||
        t('Marketplace listing');

    const price=
        listing?.price!==undefined&&
        listing?.price!==null
            ?`₦${Number(listing.price).toLocaleString()}`
            :'';

    return(
        <Card
            variant="outlined"
            sx={{
                borderRadius:3,
                height:'100%',
                transition:
                    'transform .18s ease,box-shadow .18s ease',
                '&:hover':{
                    transform:'translateY(-2px)',
                    boxShadow:2
                },
                '&:active':{
                    transform:'scale(.99)'
                }
            }}
        >
            <CardActionArea
                onClick={onClick}
                sx={{height:'100%'}}
            >
                <CardContent
                    sx={{
                        p:{
                            xs:1.75,
                            sm:2
                        }
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                    >
                        <Avatar
                            sx={{
                                bgcolor:'success.main',
                                width:{
                                    xs:40,
                                    sm:42
                                },
                                height:{
                                    xs:40,
                                    sm:42
                                },
                                flexShrink:0
                            }}
                        >
                            <StorefrontOutlinedIcon fontSize="small"/>
                        </Avatar>

                        <Box
                            sx={{
                                minWidth:0,
                                flex:1
                            }}
                        >
                            <Typography
                                fontWeight={700}
                                sx={{
                                    overflowWrap:'anywhere'
                                }}
                            >
                                {title}
                            </Typography>

                            {price&&(
                                <Typography
                                    color="primary.main"
                                    fontWeight={800}
                                    sx={{mt:.5}}
                                >
                                    {price}
                                </Typography>
                            )}

                            {listing?.category&&(
                                <Chip
                                    label={listing.category}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        mt:.75,
                                        maxWidth:'100%'
                                    }}
                                />
                            )}

                            {listing?.location&&(
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt:1,
                                        overflowWrap:'anywhere'
                                    }}
                                >
                                    {listing.location}
                                </Typography>
                            )}

                            {listing?.createdAt&&(
                                <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    display="block"
                                    sx={{mt:1}}
                                >
                                    {formatDate(listing.createdAt)}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

const EmptyActivity=({
    icon,
    title,
    description,
    buttonLabel,
    onClick
})=>(
    <Box
        sx={{
            p:{
                xs:2.5,
                sm:3
            },
            borderRadius:3,
            bgcolor:'action.hover',
            textAlign:'center',
            minHeight:170,
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            justifyContent:'center'
        }}
    >
        {icon}

        <Typography
            fontWeight={700}
            sx={{mt:1}}
        >
            {title}
        </Typography>

        <Typography
            variant="body2"
            color="text.secondary"
            sx={{
                mt:.5,
                maxWidth:420
            }}
        >
            {description}
        </Typography>

        <Button
            variant="outlined"
            sx={{
                mt:1.5,
                borderRadius:2.5
            }}
            onClick={onClick}
        >
            {buttonLabel}
        </Button>
    </Box>
);

const ActivityPanel=({
    type,
    posts,
    listings,
    count,
    t,
    navigate
})=>{
    const isCommunity=type==='community';
    const items=isCommunity?posts:listings;

    const title=isCommunity
        ?t('Community Activity')
        :t('Marketplace Listings');

    const description=isCommunity
        ?`${count} ${t('community posts')}`
        :`${count} ${t('active listings')}`;

    return(
        <Box
            sx={{
                minWidth:0,
                height:'100%'
            }}
        >
            <SectionHeader
                icon={
                    isCommunity
                        ?<ArticleOutlinedIcon/>
                        :<StorefrontOutlinedIcon/>
                }
                title={title}
                description={description}
                action={()=>
                    navigate(
                        isCommunity
                            ?'/community'
                            :'/marketplace'
                    )
                }
                actionLabel={t('See All')}
            />

            <Box sx={{mt:2}}>
                {items.length===0?(
                    <EmptyActivity
                        icon={
                            isCommunity
                                ?<ArticleOutlinedIcon
                                    sx={{
                                        fontSize:38,
                                        color:'text.secondary'
                                    }}
                                />
                                :<StorefrontOutlinedIcon
                                    sx={{
                                        fontSize:38,
                                        color:'text.secondary'
                                    }}
                                />
                        }
                        title={
                            isCommunity
                                ?t('No community activity yet')
                                :t('No marketplace listings yet')
                        }
                        description={
                            isCommunity
                                ?t('Your community posts and interactions will appear here.')
                                :t('Your active produce, equipment and service listings will appear here.')
                        }
                        buttonLabel={
                            isCommunity
                                ?t('Visit Community')
                                :t('Visit Marketplace')
                        }
                        onClick={()=>
                            navigate(
                                isCommunity
                                    ?'/community'
                                    :'/marketplace'
                            )
                        }
                    />
                ):(
                    <Stack spacing={1.25}>
                        {items.slice(0,3).map(
                            (item,index)=>
                                isCommunity?(
                                    <ActivityCard
                                        key={
                                            item._id||
                                            index
                                        }
                                        post={item}
                                        t={t}
                                        onClick={()=>
                                            navigate(
                                                item.link||
                                                `/community/${item._id}`
                                            )
                                        }
                                    />
                                ):(
                                    <ListingCard
                                        key={
                                            item._id||
                                            index
                                        }
                                        listing={item}
                                        t={t}
                                        onClick={()=>
                                            navigate(
                                                item.link||
                                                `/marketplace/${item._id}`
                                            )
                                        }
                                    />
                                )
                        )}
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

const Profile=()=>{
    const{t}=useTranslation();
    const dispatch=useDispatch();
    const navigate=useNavigate();

    const fileInputRef=useRef(null);
    const cameraInputRef=useRef(null);

    const{
        user,
        loading,
        error
    }=useSelector(state=>state.auth);

    const connectionState=useSelector(
        state=>state.connections||
        state.connection||
        {}
    );

    const connections=
        Array.isArray(connectionState.connections)
            ?connectionState.connections
            :[];

    const connectionCount=connections.length;

    const[openEdit,setOpenEdit]=useState(false);
    const[imageError,setImageError]=useState('');
    const[localError,setLocalError]=useState('');
    const[success,setSuccess]=useState(false);
    const[publicProfileId,setPublicProfileId]=useState(null);

    const[profileActivity,setProfileActivity]=useState({
        communityPosts:[],
        marketplaceListings:[],
        stats:{
            communityPosts:0,
            marketplaceListings:0
        }
    });

    const[activityLoading,setActivityLoading]=useState(false);
    const[activityError,setActivityError]=useState('');

    const[form,setForm]=useState({
        name:'',
        bio:'',
        phone:'',
        state:'',
        lga:'',
        location:'',
        language:'English',
        profilePhoto:''
    });

    useEffect(()=>{
        if(!user)return;

        setForm({
            name:user.name||'',
            bio:user.bio||'',
            phone:user.phone||'',
            state:user.state||'',
            lga:user.lga||'',
            location:user.location||'',
            language:user.language||'English',
            profilePhoto:user.profilePhoto||''
        });
    },[user]);

    useEffect(()=>{
        if(user?._id){
            dispatch(fetchConnections());
        }
    },[dispatch,user?._id]);

    useEffect(()=>{
        let mounted=true;

        const fetchProfileActivity=async()=>{
            if(!user?._id){
                setProfileActivity({
                    communityPosts:[],
                    marketplaceListings:[],
                    stats:{
                        communityPosts:0,
                        marketplaceListings:0
                    }
                });
                return;
            }

            setActivityLoading(true);
            setActivityError('');

            try{
                const[
                    communityResponse,
                    marketplaceResponse
                ]=await Promise.all([
                    api.get('/community',{
                        params:{
                            mine:'true',
                            page:1,
                            limit:3
                        }
                    }),
                    api.get('/marketplace',{
                        params:{
                            mine:'true',
                            availability:'Available',
                            page:1,
                            limit:3
                        }
                    })
                ]);

                if(!mounted)return;

                const communityData=
                    communityResponse.data||{};

                const marketplaceData=
                    marketplaceResponse.data||{};

                setProfileActivity({
                    communityPosts:
                        Array.isArray(
                            communityData.data
                        )
                            ?communityData.data
                            :[],
                    marketplaceListings:
                        Array.isArray(
                            marketplaceData.data
                        )
                            ?marketplaceData.data
                            :[],
                    stats:{
                        communityPosts:
                            Number(
                                communityData.total
                            )||0,
                        marketplaceListings:
                            Number(
                                marketplaceData.total
                            )||0
                    }
                });
            }catch(activityRequestError){
                if(!mounted)return;

                setActivityError(
                    activityRequestError
                        .response
                        ?.data
                        ?.message||
                    t(
                        'Unable to load your activity.'
                    )
                );
            }finally{
                if(mounted){
                    setActivityLoading(false);
                }
            }
        };

        fetchProfileActivity();

        return()=>{
            mounted=false;
        };
    },[user?._id,t]);

    const handleOpenEdit=()=>{
        setLocalError('');
        setImageError('');

        if(user){
            setForm({
                name:user.name||'',
                bio:user.bio||'',
                phone:user.phone||'',
                state:user.state||'',
                lga:user.lga||'',
                location:user.location||'',
                language:user.language||'English',
                profilePhoto:user.profilePhoto||''
            });
        }

        setOpenEdit(true);
    };

    const handleCloseEdit=()=>{
        if(loading)return;

        setOpenEdit(false);
        setLocalError('');
        setImageError('');
    };

    const handleChange=event=>{
        const{
            name,
            value
        }=event.target;

        setForm(previous=>({
            ...previous,
            [name]:
                name==='bio'
                    ?value.slice(0,MAX_BIO_LENGTH)
                    :value
        }));

        setLocalError('');
    };

    const handleImageSelect=async event=>{
        const file=event.target.files?.[0];

        if(!file)return;

        setImageError('');

        try{
            const image=await compressImage(file);

            setForm(previous=>({
                ...previous,
                profilePhoto:image
            }));
        }catch(imageUploadError){
            setImageError(
                imageUploadError.message||
                t('Unable to add profile photo.')
            );
        }

        event.target.value='';
    };

    const handleRemoveImage=()=>{
        setForm(previous=>({
            ...previous,
            profilePhoto:''
        }));

        setImageError('');
    };

    const handleSubmit=async event=>{
        event.preventDefault();

        setLocalError('');

        if(!form.name.trim()){
            setLocalError(
                t('Name cannot be empty.')
            );
            return;
        }

        if(form.name.trim().length<2){
            setLocalError(
                t(
                    'Name must contain at least 2 characters.'
                )
            );
            return;
        }

        if(form.bio.trim().length>MAX_BIO_LENGTH){
            setLocalError(
                t('Bio must not exceed 500 characters.')
            );
            return;
        }

        try{
            const result=await dispatch(
                updateProfile({
                    ...form,
                    name:form.name.trim(),
                    bio:form.bio.trim(),
                    phone:form.phone.trim(),
                    state:form.state.trim(),
                    lga:form.lga.trim(),
                    location:form.location.trim()
                })
            );

            if(result?.success){
                setOpenEdit(false);
                setSuccess(true);
                setLocalError('');
                setImageError('');
            }else{
                setLocalError(
                    result?.message||
                    error||
                    t(
                        'Unable to update your profile. Please try again.'
                    )
                );
            }
        }catch(updateError){
            setLocalError(
                updateError?.message||
                t(
                    'Unable to update your profile. Please try again.'
                )
            );
        }
    };

    if(!user){
        return(
            <Box
                sx={{
                    p:{
                        xs:2,
                        sm:3
                    },
                    maxWidth:800,
                    mx:'auto'
                }}
            >
                <Alert severity="error">
                    {t(
                        'Unable to load your profile. Please log in again.'
                    )}
                </Alert>
            </Box>
        );
    }

    if(publicProfileId){
        return(
            <PublicProfile
                userId={publicProfileId}
                onBack={()=>setPublicProfileId(null)}
            />
        );
    }

    const initials=getInitials(user.name);
    const roleLabel=getRoleLabel(user.role);

    const communityPosts=
        profileActivity.communityPosts;

    const marketplaceListings=
        profileActivity.marketplaceListings;

    const stats=profileActivity.stats;

    const communityCount=
        stats.communityPosts;

    const marketplaceCount=
        stats.marketplaceListings;

    return(
        <Box
            sx={{
                px:{
                    xs:1.25,
                    sm:3
                },
                py:{
                    xs:2,
                    sm:3
                },
                pb:{
                    xs:10,
                    sm:6
                },
                maxWidth:1000,
                mx:'auto',
                width:'100%',
                boxSizing:'border-box'
            }}
        >
            <Stack spacing={{xs:2,sm:2.5}}>
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
                        {t('My Profile')}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{mt:.5}}
                    >
                        {t(
                            'Manage your profile, connections and activity on RoamAgro.'
                        )}
                    </Typography>
                </Box>

                {(error||localError)&&!openEdit&&(
                    <Alert severity="error">
                        {localError||error}
                    </Alert>
                )}

                <Card
                    elevation={2}
                    sx={{
                        borderRadius:4,
                        overflow:'hidden'
                    }}
                >
                    <Box
                        sx={{
                            height:{
                                xs:105,
                                sm:150
                            },
                            background:
                                'linear-gradient(135deg,#00BF63 0%,#008f4a 100%)'
                        }}
                    />

                    <CardContent
                        sx={{
                            px:{
                                xs:1.75,
                                sm:4
                            },
                            pb:{
                                xs:3,
                                sm:4
                            },
                            mt:{
                                xs:-7,
                                sm:-8
                            }
                        }}
                    >
                        <Stack
                            direction={{
                                xs:'column',
                                sm:'row'
                            }}
                            spacing={2}
                            alignItems={{
                                xs:'center',
                                sm:'flex-end'
                            }}
                        >
                            <Avatar
                                src={
                                    user.profilePhoto||
                                    undefined
                                }
                                sx={{
                                    width:{
                                        xs:112,
                                        sm:132
                                    },
                                    height:{
                                        xs:112,
                                        sm:132
                                    },
                                    border:'5px solid',
                                    borderColor:
                                        'background.paper',
                                    bgcolor:
                                        'primary.main',
                                    fontSize:{
                                        xs:38,
                                        sm:44
                                    },
                                    fontWeight:700,
                                    boxShadow:3
                                }}
                            >
                                {!user.profilePhoto&&
                                    initials}
                            </Avatar>

                            <Box
                                sx={{
                                    flexGrow:1,
                                    minWidth:0,
                                    textAlign:{
                                        xs:'center',
                                        sm:'left'
                                    }
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    fontWeight={800}
                                    sx={{
                                        wordBreak:
                                            'break-word'
                                    }}
                                >
                                    {user.name}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mt:.5,
                                        wordBreak:
                                            'break-word'
                                    }}
                                >
                                    {user.email}
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    justifyContent={{
                                        xs:'center',
                                        sm:'flex-start'
                                    }}
                                    flexWrap="wrap"
                                    sx={{
                                        mt:1,
                                        gap:.75
                                    }}
                                >
                                    <Chip
                                        icon={
                                            <BadgeOutlinedIcon/>
                                        }
                                        label={roleLabel}
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                    />

                                    <Chip
                                        icon={
                                            <PeopleAltOutlinedIcon/>
                                        }
                                        label={`${connectionCount} ${t('Connections')}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Stack>
                            </Box>

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
                                        <PeopleAltOutlinedIcon/>
                                    }
                                    onClick={()=>
                                        navigate(
                                            '/connections'
                                        )
                                    }
                                    sx={{
                                        borderRadius:2.5,
                                        minWidth:{
                                            xs:'100%',
                                            sm:'auto'
                                        }
                                    }}
                                >
                                    {t('Connections')}
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<EditIcon/>}
                                    onClick={
                                        handleOpenEdit
                                    }
                                    sx={{
                                        borderRadius:2.5,
                                        minWidth:{
                                            xs:'100%',
                                            sm:'auto'
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
                            p:{
                                xs:2,
                                sm:3
                            }
                        }}
                    >
                        <SectionHeader
                            icon={
                                <InfoOutlinedIcon/>
                            }
                            title={t('About Me')}
                        />

                        <Typography
                            variant="body1"
                            color={
                                user.bio
                                    ?'text.primary'
                                    :'text.secondary'
                            }
                            sx={{
                                mt:1.5,
                                whiteSpace:'pre-wrap',
                                wordBreak:'break-word',
                                lineHeight:1.7
                            }}
                        >
                            {user.bio||
                                t(
                                    'You have not added a bio yet. Add a short introduction so other RoamAgro users can know more about you.'
                                )}
                        </Typography>
                    </CardContent>
                </Card>

                <Card
                    elevation={1}
                    sx={{borderRadius:4}}
                >
                    <CardContent
                        sx={{
                            p:{
                                xs:2,
                                sm:3
                            }
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={800}
                            mb={2.5}
                        >
                            {t('Contact & Location')}
                        </Typography>

                        <Grid
                            container
                            spacing={{
                                xs:2.5,
                                sm:3
                            }}
                        >
                            <Grid item xs={12} sm={6}>
                                <ProfileInfo
                                    icon={
                                        <EmailOutlinedIcon/>
                                    }
                                    label={t('Email')}
                                    value={user.email}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ProfileInfo
                                    icon={
                                        <PhoneOutlinedIcon/>
                                    }
                                    label={t('Phone')}
                                    value={user.phone}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ProfileInfo
                                    icon={
                                        <PublicOutlinedIcon/>
                                    }
                                    label={t('State')}
                                    value={user.state}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ProfileInfo
                                    icon={
                                        <HomeOutlinedIcon/>
                                    }
                                    label={t('LGA')}
                                    value={user.lga}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <ProfileInfo
                                    icon={
                                        <LocationOnOutlinedIcon/>
                                    }
                                    label={t('Location')}
                                    value={user.location}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ProfileInfo
                                    icon={
                                        <LanguageOutlinedIcon/>
                                    }
                                    label={t('Language')}
                                    value={
                                        user.language||
                                        'English'
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <ProfileInfo
                                    icon={
                                        <BadgeOutlinedIcon/>
                                    }
                                    label={t('Account Type')}
                                    value={roleLabel}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card
                    elevation={1}
                    sx={{borderRadius:4}}
                >
                    <CardContent
                        sx={{
                            p:{
                                xs:2,
                                sm:3
                            }
                        }}
                    >
                        <SectionHeader
                            icon={
                                <PeopleAltOutlinedIcon/>
                            }
                            title={t('Your Connections')}
                            description={t(
                                'People you are connected with on RoamAgro.'
                            )}
                            action={()=>
                                navigate(
                                    '/connections'
                                )
                            }
                            actionLabel={t('View All')}
                        />

                        <Box sx={{mt:2}}>
                            {connections.length===0?(
                                <Box
                                    sx={{
                                        p:{
                                            xs:2.5,
                                            sm:3
                                        },
                                        borderRadius:3,
                                        bgcolor:
                                            'action.hover',
                                        textAlign:'center'
                                    }}
                                >
                                    <PeopleAltOutlinedIcon
                                        sx={{
                                            fontSize:38,
                                            color:
                                                'text.secondary'
                                        }}
                                    />

                                    <Typography
                                        fontWeight={700}
                                        sx={{mt:1}}
                                    >
                                        {t(
                                            'No connections yet'
                                        )}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{mt:.5}}
                                    >
                                        {t(
                                            'Discover other RoamAgro users and start building your network.'
                                        )}
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        sx={{
                                            mt:1.5,
                                            borderRadius:2.5
                                        }}
                                        onClick={()=>
                                            navigate(
                                                '/connections'
                                            )
                                        }
                                    >
                                        {t('Find People')}
                                    </Button>
                                </Box>
                            ):(
                                <Grid
                                    container
                                    spacing={1.5}
                                >
                                    {connections
                                        .slice(0,6)
                                        .map(connection=>(
                                            <Grid
                                                item
                                                xs={6}
                                                sm={4}
                                                md={2}
                                                key={
                                                    connection._id
                                                }
                                            >
                                                <Card
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius:3,
                                                        height:'100%',
                                                        transition:
                                                            'transform .18s ease,box-shadow .18s ease',
                                                        '&:hover':{
                                                            transform:
                                                                'translateY(-2px)',
                                                            boxShadow:2
                                                        },
                                                        '&:active':{
                                                            transform:
                                                                'scale(.98)'
                                                        }
                                                    }}
                                                >
                                                    <CardActionArea
                                                        onClick={()=>
                                                            setPublicProfileId(
                                                                connection._id
                                                            )
                                                        }
                                                        sx={{
                                                            height:'100%'
                                                        }}
                                                    >
                                                        <CardContent
                                                            sx={{
                                                                textAlign:'center',
                                                                p:{
                                                                    xs:1.25,
                                                                    sm:1.5
                                                                }
                                                            }}
                                                        >
                                                            <Avatar
                                                                src={
                                                                    connection.profilePhoto||
                                                                    undefined
                                                                }
                                                                sx={{
                                                                    width:{
                                                                        xs:48,
                                                                        sm:52
                                                                    },
                                                                    height:{
                                                                        xs:48,
                                                                        sm:52
                                                                    },
                                                                    mx:'auto',
                                                                    bgcolor:
                                                                        'primary.main'
                                                                }}
                                                            >
                                                                {getInitials(
                                                                    connection.name
                                                                )}
                                                            </Avatar>

                                                            <Typography
                                                                fontWeight={700}
                                                                noWrap
                                                                sx={{
                                                                    mt:1,
                                                                    fontSize:{
                                                                        xs:'.85rem',
                                                                        sm:'.95rem'
                                                                    }
                                                                }}
                                                            >
                                                                {
                                                                    connection.name
                                                                }
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                noWrap
                                                            >
                                                                {
                                                                    connection.role
                                                                        ?getRoleLabel(
                                                                            connection.role
                                                                        )
                                                                        :t(
                                                                            'Connection'
                                                                        )
                                                                }
                                                            </Typography>
                                                        </CardContent>
                                                    </CardActionArea>
                                                </Card>
                                            </Grid>
                                        ))}
                                </Grid>
                            )}
                        </Box>
                    </CardContent>
                </Card>

                {activityError&&(
                    <Alert severity="error">
                        {activityError}
                    </Alert>
                )}

                <Box
                    sx={{
                        minWidth:0,
                        position:'relative'
                    }}
                >
                    <Grid
                        container
                        spacing={{
                            xs:2.5,
                            sm:3
                        }}
                        sx={{mt:.25}}
                    >
                        {activityLoading&&(
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        display:'flex',
                                        justifyContent:'center',
                                        py:3
                                    }}
                                >
                                    <CircularProgress
                                        size={28}
                                    />
                                </Box>
                            </Grid>
                        )}

                        <Grid
                            item
                            xs={12}
                            md={6}
                            sx={{minWidth:0}}
                        >
                            <ActivityPanel
                                type="community"
                                posts={communityPosts}
                                listings={marketplaceListings}
                                count={communityCount}
                                t={t}
                                navigate={navigate}
                            />
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            md={6}
                            sx={{minWidth:0}}
                        >
                            <ActivityPanel
                                type="marketplace"
                                posts={communityPosts}
                                listings={marketplaceListings}
                                count={marketplaceCount}
                                t={t}
                                navigate={navigate}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Card
                    elevation={1}
                    sx={{borderRadius:4}}
                >
                    <CardContent
                        sx={{
                            p:{
                                xs:2,
                                sm:3
                            }
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={800}
                            mb={1}
                        >
                            {t('Profile Information')}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {t(
                                'Keep your profile information updated so other RoamAgro users can identify and contact you when appropriate.'
                            )}
                        </Typography>

                        <Divider sx={{my:2.5}}/>

                        <Button
                            variant="outlined"
                            startIcon={<EditIcon/>}
                            onClick={handleOpenEdit}
                            fullWidth
                            sx={{
                                borderRadius:2.5,
                                maxWidth:{
                                    sm:220
                                }
                            }}
                        >
                            {t('Update Information')}
                        </Button>
                    </CardContent>
                </Card>
            </Stack>

            <Dialog
                open={openEdit}
                onClose={handleCloseEdit}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx:{
                        borderRadius:{
                            xs:3,
                            sm:4
                        },
                        m:{
                            xs:1,
                            sm:2
                        }
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight:800,
                        pb:1
                    }}
                >
                    {t('Edit Profile')}
                </DialogTitle>

                <DialogContent dividers>
                    <Stack
                        component="form"
                        id="profile-edit-form"
                        onSubmit={handleSubmit}
                        spacing={2}
                    >
                        {(localError||error)&&(
                            <Alert severity="error">
                                {localError||error}
                            </Alert>
                        )}

                        <Stack
                            alignItems="center"
                            spacing={1.5}
                            sx={{py:1}}
                        >
                            <Box sx={{position:'relative'}}>
                                <Avatar
                                    src={
                                        form.profilePhoto||
                                        undefined
                                    }
                                    sx={{
                                        width:112,
                                        height:112,
                                        bgcolor:
                                            'primary.main',
                                        fontSize:38,
                                        border:'3px solid',
                                        borderColor:
                                            'primary.main'
                                    }}
                                >
                                    {!form.profilePhoto&&
                                        initials}
                                </Avatar>

                                {form.profilePhoto&&(
                                    <IconButton
                                        size="small"
                                        onClick={
                                            handleRemoveImage
                                        }
                                        disabled={loading}
                                        aria-label={t(
                                            'Remove profile photo'
                                        )}
                                        sx={{
                                            position:'absolute',
                                            right:-6,
                                            top:-6,
                                            bgcolor:
                                                'background.paper',
                                            boxShadow:2,
                                            '&:hover':{
                                                bgcolor:
                                                    'background.paper'
                                            }
                                        }}
                                    >
                                        <DeleteIcon
                                            fontSize="small"
                                            color="error"
                                        />
                                    </IconButton>
                                )}
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                textAlign="center"
                            >
                                {t(
                                    'Add a profile photo or capture one with your camera.'
                                )}
                            </Typography>

                            <Stack
                                direction={{
                                    xs:'column',
                                    sm:'row'
                                }}
                                spacing={1}
                                width="100%"
                                justifyContent="center"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={
                                        handleImageSelect
                                    }
                                />

                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    hidden
                                    onChange={
                                        handleImageSelect
                                    }
                                />

                                <Button
                                    variant="outlined"
                                    startIcon={
                                        <AddPhotoAlternateOutlinedIcon/>
                                    }
                                    onClick={()=>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={loading}
                                    fullWidth
                                >
                                    {t('Choose Photo')}
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={
                                        <CameraAltIcon/>
                                    }
                                    onClick={()=>
                                        cameraInputRef.current?.click()
                                    }
                                    disabled={loading}
                                    fullWidth
                                >
                                    {t('Take Photo')}
                                </Button>
                            </Stack>

                            {imageError&&(
                                <Alert
                                    severity="error"
                                    sx={{width:'100%'}}
                                >
                                    {imageError}
                                </Alert>
                            )}
                        </Stack>

                        <TextField
                            label={t('Name')}
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            fullWidth
                            disabled={loading}
                        />

                        <TextField
                            label={t('Email')}
                            value={user.email||''}
                            fullWidth
                            disabled
                            helperText={t(
                                'Email cannot be changed here.'
                            )}
                        />

                        <TextField
                            label={t('Bio')}
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            minRows={4}
                            maxRows={7}
                            disabled={loading}
                            placeholder={t(
                                'Tell other RoamAgro users a little about yourself...'
                            )}
                            helperText={`${form.bio.length}/${MAX_BIO_LENGTH}`}
                            inputProps={{
                                maxLength:MAX_BIO_LENGTH
                            }}
                        />

                        <TextField
                            label={t('Phone')}
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            fullWidth
                            disabled={loading}
                            placeholder="08012345678"
                        />

                        <Grid
                            container
                            spacing={2}
                        >
                            <Grid
                                item
                                xs={12}
                                sm={6}
                            >
                                <TextField
                                    label={t('State')}
                                    name="state"
                                    value={form.state}
                                    onChange={
                                        handleChange
                                    }
                                    fullWidth
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid
                                item
                                xs={12}
                                sm={6}
                            >
                                <TextField
                                    label={t('LGA')}
                                    name="lga"
                                    value={form.lga}
                                    onChange={
                                        handleChange
                                    }
                                    fullWidth
                                    disabled={loading}
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            label={t('Location')}
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            fullWidth
                            disabled={loading}
                            placeholder={t(
                                'Town, village, market or area'
                            )}
                        />

                        <TextField
                            select
                            label={t('Language')}
                            name="language"
                            value={form.language}
                            onChange={handleChange}
                            fullWidth
                            disabled={loading}
                        >
                            <MenuItem value="English">
                                {t('English')}
                            </MenuItem>

                            <MenuItem value="Hausa">
                                {t('Hausa')}
                            </MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        p:{
                            xs:2,
                            sm:2.5
                        },
                        gap:1,
                        flexDirection:{
                            xs:'column-reverse',
                            sm:'row'
                        }
                    }}
                >
                    <Button
                        onClick={handleCloseEdit}
                        disabled={loading}
                        fullWidth
                        sx={{
                            maxWidth:{
                                sm:140
                            }
                        }}
                    >
                        {t('Cancel')}
                    </Button>

                    <Button
                        type="submit"
                        form="profile-edit-form"
                        variant="contained"
                        disabled={loading}
                        fullWidth
                        sx={{
                            maxWidth:{
                                sm:180
                            }
                        }}
                    >
                        {loading?(
                            <>
                                <CircularProgress
                                    size={19}
                                    color="inherit"
                                    sx={{mr:1}}
                                />
                                {t('Saving...')}
                            </>
                        ):t('Save Changes')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={success}
                autoHideDuration={3500}
                onClose={()=>
                    setSuccess(false)
                }
                anchorOrigin={{
                    vertical:'bottom',
                    horizontal:'center'
                }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={()=>
                        setSuccess(false)
                    }
                >
                    {t(
                        'Profile updated successfully.'
                    )}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Profile;