import React,{useRef,useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import {useDispatch,useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {
    addComment,
    deleteComment,
    likePost,
    updateTopic,
    deleteTopic,
    sharePost,
} from '../../redux/actions/communityActions';
import CommentDialog from './CommentDialog';

const categories=[
    'Crop Production',
    'Livestock',
    'Poultry',
    'Soil Health',
    'Pest Control',
    'Diseases',
    'Climate',
    'Weather',
    'Market Prices',
    'Government Support',
    'Mechanization',
    'Agribusiness',
    'Finance',
    'Technology',
    'General',
];

const MAX_IMAGE_SIZE=1200;
const IMAGE_QUALITY=0.75;

const compressImage=(file)=>
    new Promise((resolve,reject)=>{
        if(!file?.type?.startsWith('image/')){
            reject(
                new Error(
                    'Please select an image file.'
                )
            );
            return;
        }

        const reader=new FileReader();

        reader.onload=(event)=>{
            const image=new Image();

            image.onload=()=>{
                let width=image.width;
                let height=image.height;

                if(
                    width>MAX_IMAGE_SIZE||
                    height>MAX_IMAGE_SIZE
                ){
                    if(width>height){
                        height=
                            (height/width)*
                            MAX_IMAGE_SIZE;
                        width=MAX_IMAGE_SIZE;
                    }else{
                        width=
                            (width/height)*
                            MAX_IMAGE_SIZE;
                        height=MAX_IMAGE_SIZE;
                    }
                }

                const canvas=
                    document.createElement(
                        'canvas'
                    );

                canvas.width=Math.round(width);
                canvas.height=Math.round(height);

                const context=
                    canvas.getContext('2d');

                if(!context){
                    reject(
                        new Error(
                            'Unable to process image.'
                        )
                    );
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
                            'Unable to compress image.'
                        )
                    );
                }
            };

            image.onerror=()=>{
                reject(
                    new Error(
                        'Unable to process image.'
                    )
                );
            };

            image.src=event.target.result;
        };

        reader.onerror=()=>{
            reject(
                new Error(
                    'Unable to read image.'
                )
            );
        };

        reader.readAsDataURL(file);
    });

const getInitial=(name)=>{
    if(!name)return'F';
    return name.trim().charAt(0).toUpperCase();
};

const formatDate=(date)=>{
    if(!date)return'';

    const postDate=new Date(date);

    if(Number.isNaN(postDate.getTime())){
        return'';
    }

    const now=new Date();

    const today=new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const target=new Date(
        postDate.getFullYear(),
        postDate.getMonth(),
        postDate.getDate()
    );

    const difference=Math.round(
        (today-target)/86400000
    );

    if(difference===0)return'Today';

    if(difference===1)return'Yesterday';

    if(difference>1&&difference<7){
        return`${difference} days ago`;
    }

    return postDate.toLocaleDateString(
        undefined,
        {
            day:'numeric',
            month:'short',
            year:
                postDate.getFullYear()!==now.getFullYear()
                    ?'numeric'
                    :undefined,
        }
    );
};

const AgriPostCard=({post})=>{
    const {t}=useTranslation();
    const dispatch=useDispatch();

    const currentUser=useSelector(
        (state)=>state.auth?.user
    );

    const fileInputRef=useRef(null);

    const [
        openComments,
        setOpenComments,
    ]=useState(false);

    const [
        menuAnchor,
        setMenuAnchor,
    ]=useState(null);

    const [
        editOpen,
        setEditOpen,
    ]=useState(false);

    const [
        deleteLoading,
        setDeleteLoading,
    ]=useState(false);

    const [
        shareLoading,
        setShareLoading,
    ]=useState(false);

    const [
        imageLoading,
        setImageLoading,
    ]=useState(false);

    const [
        imageError,
        setImageError,
    ]=useState('');

    const [
        editData,
        setEditData,
    ]=useState({
        title:post.title||'',
        content:post.content||'',
        category:post.category||'General',
        image:post.image||'',
    });

    const userId=
        currentUser?._id||
        currentUser?.id;

    const postUserId=
        post.user?._id||
        post.user?.id||
        post.user;

    const isOwner=Boolean(
        userId&&
        postUserId&&
        userId.toString()===
            postUserId.toString()
    );

    const liked=Boolean(
        post.likes?.some(
            (like)=>
                (
                    like?._id||
                    like
                ).toString()===
                userId?.toString()
        )
    );

    const likeCount=post.likes?.length||0;
    const commentCount=post.comments?.length||0;
    const shareCount=post.shares||0;

    const authorName=
        post.user?.name||
        'Farmer';

    const handleLike=()=>{
        dispatch(
            likePost(post._id)
        );
    };

    const handleAddComment=(content)=>{
        dispatch(
            addComment(
                post._id,
                content
            )
        );
    };

    const handleDeleteComment=(commentId)=>{
        dispatch(
            deleteComment(
                post._id,
                commentId
            )
        );
    };

    const handleOpenEdit=()=>{
        setEditData({
            title:post.title||'',
            content:post.content||'',
            category:
                post.category||
                'General',
            image:post.image||'',
        });

        setImageError('');
        setMenuAnchor(null);
        setEditOpen(true);
    };

    const handleEditChange=(event)=>{
        setEditData(
            (previous)=>({
                ...previous,
                [event.target.name]:
                    event.target.value,
            })
        );
    };

    const handleImageSelect=async(event)=>{
        const file=
            event.target.files?.[0];

        if(!file){
            return;
        }

        setImageError('');
        setImageLoading(true);

        try{
            const image=
                await compressImage(file);

            setEditData(
                (previous)=>({
                    ...previous,
                    image,
                })
            );
        }catch(error){
            setImageError(
                error.message||
                t(
                    'Unable to add image.'
                )
            );
        }finally{
            setImageLoading(false);
            event.target.value='';
        }
    };

    const handleRemoveImage=()=>{
        setEditData(
            (previous)=>({
                ...previous,
                image:'',
            })
        );

        setImageError('');
    };

    const handleUpdate=async()=>{
        if(
            !editData.title.trim()||
            !editData.content.trim()||
            imageLoading
        ){
            return;
        }

        const result=await dispatch(
            updateTopic(
                post._id,
                editData
            )
        );

        if(result?.success){
            setEditOpen(false);
            setImageError('');
        }
    };

    const handleDelete=async()=>{
        setMenuAnchor(null);

        const confirmed=window.confirm(
            t(
                'Are you sure you want to delete this post?'
            )
        );

        if(!confirmed){
            return;
        }

        setDeleteLoading(true);

        await dispatch(
            deleteTopic(post._id)
        );

        setDeleteLoading(false);
    };

    const handleShare=async()=>{
        if(shareLoading){
            return;
        }

        setShareLoading(true);

        const shareUrl=
            `${window.location.origin}/community?post=${post._id}`;

        try{
            if(navigator.share){
                await navigator.share({
                    title:
                        post.title||
                        'RoamAgro Community',
                    text:
                        post.content||
                        '',
                    url:shareUrl,
                });

                await dispatch(
                    sharePost(post._id)
                );
            }else if(navigator.clipboard){
                await navigator.clipboard.writeText(
                    shareUrl
                );

                await dispatch(
                    sharePost(post._id)
                );

                window.alert(
                    t('Post link copied.')
                );
            }else{
                window.prompt(
                    t('Copy this post link:'),
                    shareUrl
                );
            }
        }catch(error){
            if(
                error?.name===
                'AbortError'
            ){
                return;
            }

            try{
                if(navigator.clipboard){
                    await navigator.clipboard.writeText(
                        shareUrl
                    );

                    await dispatch(
                        sharePost(post._id)
                    );

                    window.alert(
                        t('Post link copied.')
                    );
                }
            }catch{
                window.alert(
                    t(
                        'Unable to share this post.'
                    )
                );
            }
        }finally{
            setShareLoading(false);
        }
    };

    return(
        <>
            <Card
                elevation={1}
                sx={{
                    borderRadius:3,
                    overflow:'hidden',
                    mb:2,
                    border:'1px solid',
                    borderColor:'divider',
                }}
            >
                <CardContent
                    sx={{
                        p:{
                            xs:2,
                            sm:2.5,
                        },
                        '&:last-child':{
                            pb:{
                                xs:2,
                                sm:2.5,
                            },
                        },
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                    >
                        <Avatar
                            src={
                                post.user?.profilePhoto
                            }
                            alt={authorName}
                            sx={{
                                width:44,
                                height:44,
                                fontWeight:700,
                            }}
                        >
                            {getInitial(
                                authorName
                            )}
                        </Avatar>

                        <Box
                            sx={{
                                flex:1,
                                minWidth:0,
                            }}
                        >
                            <Typography
                                fontWeight={700}
                                sx={{
                                    fontSize:{
                                        xs:'0.95rem',
                                        sm:'1rem',
                                    },
                                    overflow:'hidden',
                                    textOverflow:'ellipsis',
                                    whiteSpace:'nowrap',
                                }}
                            >
                                {authorName}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {formatDate(
                                    post.createdAt
                                )}
                            </Typography>
                        </Box>

                        <Chip
                            label={
                                post.category||
                                'General'
                            }
                            color="success"
                            size="small"
                            sx={{
                                maxWidth:{
                                    xs:120,
                                    sm:180,
                                },
                                '& .MuiChip-label':{
                                    overflow:'hidden',
                                    textOverflow:'ellipsis',
                                },
                            }}
                        />

                        {isOwner&&(
                            <IconButton
                                size="large"
                                onClick={(event)=>
                                    setMenuAnchor(
                                        event.currentTarget
                                    )
                                }
                                aria-label={t(
                                    'Post options'
                                )}
                                sx={{
                                    ml:-0.5,
                                }}
                            >
                                <MoreVertIcon/>
                            </IconButton>
                        )}
                    </Stack>

                    <Box
                        sx={{
                            mt:2,
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                fontSize:{
                                    xs:'1.05rem',
                                    sm:'1.2rem',
                                },
                                lineHeight:1.35,
                                wordBreak:'break-word',
                            }}
                        >
                            {post.title}
                        </Typography>

                        <Typography
                            color="text.primary"
                            sx={{
                                mt:1,
                                lineHeight:1.65,
                                whiteSpace:'pre-wrap',
                                wordBreak:'break-word',
                                fontSize:{
                                    xs:'0.95rem',
                                    sm:'1rem',
                                },
                            }}
                        >
                            {post.content}
                        </Typography>
                    </Box>

                    {post.image&&(
                        <CardMedia
                            component="img"
                            image={post.image}
                            alt={
                                post.title||
                                t(
                                    'Community post image'
                                )
                            }
                            loading="lazy"
                            sx={{
                                mt:2,
                                width:'100%',
                                maxHeight:{
                                    xs:280,
                                    sm:380,
                                },
                                borderRadius:2,
                                objectFit:'cover',
                                backgroundColor:
                                    'action.hover',
                            }}
                        />
                    )}

                    <Divider
                        sx={{my:1.5}}
                    />

                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            width:'100%',
                            gap:0.5,
                        }}
                    >
                        <Button
                            size="medium"
                            color={
                                liked
                                    ?'error'
                                    :'inherit'
                            }
                            onClick={handleLike}
                            startIcon={
                                liked
                                    ?(
                                        <FavoriteIcon/>
                                    )
                                    :(
                                        <FavoriteBorderIcon/>
                                    )
                            }
                            sx={{
                                minWidth:0,
                                px:{
                                    xs:1,
                                    sm:1.5,
                                },
                                textTransform:'none',
                                fontWeight:600,
                            }}
                        >
                            {likeCount}

                            <Box
                                component="span"
                                sx={{
                                    display:{
                                        xs:'none',
                                        sm:'inline',
                                    },
                                    ml:0.5,
                                }}
                            >
                                {liked
                                    ?t('Liked')
                                    :t('Like')}
                            </Box>
                        </Button>

                        <Button
                            size="medium"
                            color="inherit"
                            onClick={()=>
                                setOpenComments(true)
                            }
                            startIcon={
                                <ChatBubbleOutlineIcon/>
                            }
                            sx={{
                                minWidth:0,
                                px:{
                                    xs:1,
                                    sm:1.5,
                                },
                                textTransform:'none',
                                fontWeight:600,
                            }}
                        >
                            {commentCount}

                            <Box
                                component="span"
                                sx={{
                                    display:{
                                        xs:'none',
                                        sm:'inline',
                                    },
                                    ml:0.5,
                                }}
                            >
                                {t('Comment')}
                            </Box>
                        </Button>

                        <Button
                            size="medium"
                            color="inherit"
                            onClick={handleShare}
                            disabled={shareLoading}
                            startIcon={
                                <ShareIcon/>
                            }
                            sx={{
                                minWidth:0,
                                px:{
                                    xs:1,
                                    sm:1.5,
                                },
                                textTransform:'none',
                                fontWeight:600,
                            }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    display:{
                                        xs:'none',
                                        sm:'inline',
                                    },
                                }}
                            >
                                {shareLoading
                                    ?t('Sharing...')
                                    :t('Share')}
                            </Box>

                            <Box
                                component="span"
                                sx={{
                                    display:{
                                        xs:'inline',
                                        sm:'none',
                                    },
                                }}
                            >
                                {shareCount}
                            </Box>
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={()=>
                    setMenuAnchor(null)
                }
            >
                <MenuItem
                    onClick={handleOpenEdit}
                    sx={{
                        minHeight:48,
                    }}
                >
                    <EditOutlinedIcon
                        fontSize="small"
                        sx={{mr:1.5}}
                    />
                    {t('Edit Post')}
                </MenuItem>

                <MenuItem
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    sx={{
                        minHeight:48,
                    }}
                >
                    <DeleteOutlineIcon
                        fontSize="small"
                        sx={{mr:1.5}}
                    />
                    {deleteLoading
                        ?t('Deleting...')
                        :t('Delete Post')}
                </MenuItem>
            </Menu>

            <Dialog
                open={editOpen}
                onClose={()=>{
                    if(!imageLoading){
                        setEditOpen(false);
                    }
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {t('Edit Post')}
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{mt:1}}
                    >
                        <TextField
                            fullWidth
                            label={t('Title')}
                            name="title"
                            value={
                                editData.title
                            }
                            onChange={
                                handleEditChange
                            }
                            autoFocus
                        />

                        <TextField
                            fullWidth
                            multiline
                            minRows={5}
                            label={t(
                                'What do you want to share?'
                            )}
                            name="content"
                            value={
                                editData.content
                            }
                            onChange={
                                handleEditChange
                            }
                        />

                        <TextField
                            select
                            fullWidth
                            label={t('Category')}
                            name="category"
                            value={
                                editData.category
                            }
                            onChange={
                                handleEditChange
                            }
                        >
                            {categories.map(
                                (category)=>(
                                    <MenuItem
                                        key={
                                            category
                                        }
                                        value={
                                            category
                                        }
                                    >
                                        {t(category)}
                                    </MenuItem>
                                )
                            )}
                        </TextField>

                        <Box>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                mb={0.5}
                            >
                                {t(
                                    'Photo (optional)'
                                )}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={1.5}
                            >
                                {t(
                                    'Add a new photo or keep the current one.'
                                )}
                            </Typography>

                            <input
                                ref={
                                    fileInputRef
                                }
                                type="file"
                                accept="image/*"
                                capture="environment"
                                hidden
                                onChange={
                                    handleImageSelect
                                }
                            />

                            {!editData.image&&(
                                <Button
                                    variant="outlined"
                                    startIcon={
                                        <CameraAltIcon/>
                                    }
                                    onClick={()=>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={
                                        imageLoading
                                    }
                                >
                                    {imageLoading
                                        ?t('Processing...')
                                        :t('Add Photo')}
                                </Button>
                            )}

                            {imageError&&(
                                <Typography
                                    variant="body2"
                                    color="error"
                                    mt={1}
                                >
                                    {imageError}
                                </Typography>
                            )}

                            {editData.image&&(
                                <Box
                                    sx={{
                                        position:'relative',
                                        mt:2,
                                        width:'100%',
                                        maxWidth:400,
                                        borderRadius:2,
                                        overflow:'hidden',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={
                                            editData.image
                                        }
                                        alt={t(
                                            'Community post'
                                        )}
                                        sx={{
                                            width:'100%',
                                            maxHeight:250,
                                            objectFit:'cover',
                                            display:'block',
                                            backgroundColor:
                                                'action.hover',
                                        }}
                                    />

                                    <IconButton
                                        size="small"
                                        onClick={
                                            handleRemoveImage
                                        }
                                        disabled={
                                            imageLoading
                                        }
                                        aria-label={t(
                                            'Remove photo'
                                        )}
                                        sx={{
                                            position:'absolute',
                                            top:8,
                                            right:8,
                                            backgroundColor:
                                                'rgba(255,255,255,0.9)',
                                            '&:hover':{
                                                backgroundColor:
                                                    'white',
                                            },
                                        }}
                                    >
                                        <DeleteOutlineIcon
                                            fontSize="small"
                                        />
                                    </IconButton>
                                </Box>
                            )}

                            {editData.image&&(
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={
                                        <CameraAltIcon/>
                                    }
                                    onClick={()=>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={
                                        imageLoading
                                    }
                                    sx={{
                                        mt:1,
                                    }}
                                >
                                    {t('Change Photo')}
                                </Button>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px:3,
                        pb:2,
                    }}
                >
                    <Button
                        onClick={()=>
                            setEditOpen(false)
                        }
                        disabled={
                            imageLoading
                        }
                    >
                        {t('Cancel')}
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleUpdate}
                        disabled={
                            !editData.title.trim()||
                            !editData.content.trim()||
                            imageLoading
                        }
                    >
                        {t('Save Changes')}
                    </Button>
                </DialogActions>
            </Dialog>

            <CommentDialog
                open={openComments}
                onClose={()=>
                    setOpenComments(false)
                }
                post={post}
                onAddComment={
                    handleAddComment
                }
                onDeleteComment={
                    handleDeleteComment
                }
            />
        </>
    );
};

export default AgriPostCard;