import React,{useCallback,useEffect,useRef,useState}from'react';
import{
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Container,
    Grid,
    Snackbar,
    Typography,
}from'@mui/material';
import ExpandMoreIcon from'@mui/icons-material/ExpandMore';
import ArticleOutlinedIcon from'@mui/icons-material/ArticleOutlined';
import InsightsOutlinedIcon from'@mui/icons-material/InsightsOutlined';
import PublicIcon from'@mui/icons-material/Public';
import {useDispatch,useSelector}from'react-redux';
import {useTranslation}from'react-i18next';
import{
    fetchTopics,
    createTopic,
}from'../../redux/actions/communityActions';
import FeaturedPosts from'./FeaturedPosts';
import PostComposer from'./PostComposer';
import CommunityFeed from'./CommunityFeed';
import CommunitySummaryCards from'./CommunitySummaryCards';
import TrendingCategories from'./TrendingCategories';
import RecentActivity from'./RecentActivity';
import CommunitySearchBar from'./CommunitySearchBar';
import CommunityCategoryFilter from'./CommunityCategoryFilter';
import PublicProfile from'../connections/PublicProfile';

const Community=()=>{
    const{t}=useTranslation();
    const dispatch=useDispatch();

    const{
        topics,
        loading,
        error,
        page,
        limit,
        hasMore,
        loadingMore,
    }=useSelector(
        state=>state.community
    );

    const loadMoreRef=useRef(null);

    const[openSnackbar,setOpenSnackbar]=useState(false);
    const[openErrorSnackbar,setOpenErrorSnackbar]=useState(false);
    const[postError,setPostError]=useState(null);
    const[posting,setPosting]=useState(false);
    const[search,setSearch]=useState('');
    const[selectedCategory,setSelectedCategory]=useState('All');
    const[showMyPosts,setShowMyPosts]=useState(false);
    const[selectedProfileId,setSelectedProfileId]=useState(null);

    const[formData,setFormData]=useState({
        title:'',
        content:'',
        category:'General',
        image:'',
    });

    useEffect(()=>{
        const timer=setTimeout(()=>{
            dispatch(
                fetchTopics({
                    page:1,
                    limit,
                    search,
                    category:selectedCategory,
                    mine:showMyPosts,
                })
            );
        },400);

        return()=>clearTimeout(timer);
    },[
        dispatch,
        search,
        selectedCategory,
        showMyPosts,
        limit,
    ]);

    useEffect(()=>{
        const handleRefresh=event=>{
            if(event.detail?.route!=='/community'){
                return;
            }

            dispatch(
                fetchTopics({
                    page:1,
                    limit,
                    search,
                    category:selectedCategory,
                    mine:showMyPosts,
                })
            );
        };

        window.addEventListener(
            'roamagro:refresh-page',
            handleRefresh
        );

        return()=>{
            window.removeEventListener(
                'roamagro:refresh-page',
                handleRefresh
            );
        };
    },[
        dispatch,
        limit,
        search,
        selectedCategory,
        showMyPosts,
    ]);

    const handleChange=e=>{
        const{name,value}=e.target;

        setFormData(previous=>({
            ...previous,
            [name]:value,
        }));

        if(postError){
            setPostError(previous=>{
                if(!previous){
                    return null;
                }

                const updated={...previous};

                delete updated[name];

                if(
                    !updated.title&&
                    !updated.content&&
                    !updated.general
                ){
                    return null;
                }

                return updated;
            });
        }
    };

    const handleSubmit=async()=>{
        if(posting){
            return;
        }

        const title=formData.title.trim();
        const content=formData.content.trim();

        const validationError={};

        if(!title){
            validationError.title=t(
                'Post title is required.'
            );
        }

        if(!content){
            validationError.content=t(
                'Post content is required.'
            );
        }

        if(Object.keys(validationError).length){
            setPostError(validationError);
            setOpenErrorSnackbar(true);
            return;
        }

        setPosting(true);
        setPostError(null);

        try{
            const result=await dispatch(
                createTopic({
                    ...formData,
                    title,
                    content,
                })
            );

            if(result?.success){
                setFormData({
                    title:'',
                    content:'',
                    category:'General',
                    image:'',
                });

                setOpenSnackbar(true);

                dispatch(
                    fetchTopics({
                        page:1,
                        limit,
                        search,
                        category:selectedCategory,
                        mine:showMyPosts,
                    })
                );
            }else{
                const message=
                    result?.message||
                    t(
                        'Unable to create your post. Please try again.'
                    );

                setPostError({
                    general:message,
                });

                setOpenErrorSnackbar(true);
            }
        }catch(error){
            const message=
                error?.response?.data?.message||
                error?.message||
                t(
                    'Unable to create your post. Please check your connection and try again.'
                );

            setPostError({
                general:message,
            });

            setOpenErrorSnackbar(true);
        }finally{
            setPosting(false);
        }
    };

    const featuredPosts=topics.filter(
        post=>post.featured
    );

    const communityFeed=topics.filter(
        post=>!post.featured
    );

    const handleLoadMore=useCallback(()=>{
        if(!hasMore||loadingMore||loading){
            return;
        }

        dispatch(
            fetchTopics({
                page:page+1,
                limit,
                search,
                category:selectedCategory,
                mine:showMyPosts,
                append:true,
            })
        );
    },[
        dispatch,
        hasMore,
        loadingMore,
        loading,
        page,
        limit,
        search,
        selectedCategory,
        showMyPosts,
    ]);
        useEffect(()=>{
        const target=loadMoreRef.current;

        if(!target){
            return;
        }

        const observer=new IntersectionObserver(
            entries=>{
                if(entries[0].isIntersecting){
                    handleLoadMore();
                }
            },
            {
                rootMargin:'0px 0px 500px 0px',
            }
        );

        observer.observe(target);

        return()=>{
            observer.disconnect();
        };
    },[handleLoadMore]);

    const handleToggleMyPosts=()=>{
        setShowMyPosts(previous=>!previous);
    };

    const handleOpenProfile=userId=>{
        if(!userId){
            return;
        }

        setSelectedProfileId(userId);

        window.scrollTo({
            top:0,
            behavior:'smooth',
        });
    };

    const handleCloseProfile=()=>{
        setSelectedProfileId(null);
    };

    if(selectedProfileId){
        return(
            <PublicProfile
                userId={selectedProfileId}
                onBack={handleCloseProfile}
            />
        );
    }

    return(
        <Container
            maxWidth="md"
            sx={{
                py:3,
                pb:12,
            }}
        >
            <Box>
                <Typography
                    variant="h4"
                    fontWeight={700}
                    gutterBottom
                >
                    {t('Community')}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                >
                    {t(
                        'Share experiences, ask questions and learn from fellow farmers.'
                    )}
                </Typography>
            </Box>

            {error&&(
                <Alert
                    severity="error"
                    sx={{mb:3}}
                >
                    {error}
                </Alert>
            )}

            <PostComposer
                formData={formData}
                loading={loading}
                posting={posting}
                error={postError}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />

            <Grid
                container
                spacing={2}
                mb={3}
            >
                <Grid item xs={12} sm={7}>
                    <CommunitySearchBar
                        search={search}
                        onSearchChange={setSearch}
                    />
                </Grid>

                <Grid item xs={12} sm={5}>
                    <CommunityCategoryFilter
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                    />
                </Grid>
            </Grid>

            <Box
                sx={{
                    display:'flex',
                    gap:1,
                    mb:3,
                    flexWrap:'wrap',
                }}
            >
                <Button
                    variant={
                        !showMyPosts
                            ?'contained'
                            :'outlined'
                    }
                    startIcon={<PublicIcon/>}
                    onClick={()=>{
                        if(showMyPosts){
                            handleToggleMyPosts();
                        }
                    }}
                >
                    {t('All Posts')}
                </Button>

                <Button
                    variant={
                        showMyPosts
                            ?'contained'
                            :'outlined'
                    }
                    startIcon={<ArticleOutlinedIcon/>}
                    onClick={()=>{
                        if(!showMyPosts){
                            handleToggleMyPosts();
                        }
                    }}
                >
                    {t('My Posts')}
                </Button>
            </Box>

            <Box mb={3}>
                <CommunitySummaryCards
                    posts={topics}
                />
            </Box>

            {!showMyPosts&&(
                <FeaturedPosts
                    posts={featuredPosts}
                />
            )}

            <CommunityFeed
                loading={loading}
                posts={communityFeed}
                onOpenProfile={handleOpenProfile}
            />

            <Box
                ref={loadMoreRef}
                sx={{
                    minHeight:hasMore?80:24,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    py:2,
                }}
            >
                {hasMore&&loadingMore&&(
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {t('Loading more posts...')}
                    </Typography>
                )}

                {hasMore&&!loadingMore&&!loading&&(
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            opacity:0.7,
                        }}
                    >
                        {t('Scroll for more posts')}
                    </Typography>
                )}

                {!hasMore&&topics.length>0&&(
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            opacity:0.7,
                        }}
                    >
                        {t('You have reached the end of the community feed.')}
                    </Typography>
                )}
            </Box>

            <Accordion
                disableGutters
                elevation={1}
                sx={{
                    mt:4,
                    borderRadius:3,
                    overflow:'hidden',
                    '&:before':{
                        display:'none',
                    },
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    sx={{
                        px:2,
                        minHeight:56,
                        '& .MuiAccordionSummary-content':{
                            alignItems:'center',
                        },
                    }}
                >
                    <InsightsOutlinedIcon
                        sx={{
                            mr:1.5,
                            color:'success.main',
                        }}
                    />

                    <Typography fontWeight={700}>
                        {t('Community Insights')}
                    </Typography>
                </AccordionSummary>

                <AccordionDetails
                    sx={{
                        px:2,
                        pb:2,
                    }}
                >
                    <Box mb={3}>
                        <TrendingCategories
                            posts={topics}
                        />
                    </Box>

                    <RecentActivity
                        posts={topics}
                    />
                </AccordionDetails>
            </Accordion>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={()=>
                    setOpenSnackbar(false)
                }
            >
                <Alert
                    severity="success"
                    variant="filled"
                >
                    {t(
                        'Community post created successfully!'
                    )}
                </Alert>
            </Snackbar>

            <Snackbar
                open={openErrorSnackbar}
                autoHideDuration={5000}
                onClose={()=>
                    setOpenErrorSnackbar(false)
                }
            >
                <Alert
                    severity="error"
                    variant="filled"
                    onClose={()=>
                        setOpenErrorSnackbar(false)
                    }
                >
                    {postError?.general||
                        postError?.title||
                        postError?.content||
                        t('Unable to create your post.')}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Community;