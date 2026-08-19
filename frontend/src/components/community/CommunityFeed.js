import React from'react';
import{
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography,
}from'@mui/material';
import {useTranslation}from'react-i18next';
import AgriPostCard from'./AgriPostCard';

const CommunityFeed=({
    loading=false,
    loadingMore=false,
    posts=[],
    hasMore=false,
    onLoadMore,
    onOpenProfile,
})=>{
    const{t}=useTranslation();

    if(loading){
        return(
            <Box
                display="flex"
                justifyContent="center"
                py={6}
            >
                <CircularProgress/>
            </Box>
        );
    }

    if(posts.length===0){
        return(
            <Alert
                severity="info"
                sx={{mt:3}}
            >
                {t(
                    'No community discussions match your search.'
                )}
            </Alert>
        );
    }

    return(
        <>
            <Typography
                variant="h5"
                fontWeight={700}
                mb={2}
                mt={4}
            >
                {t('Community Discussions')}{' '}
                ({posts.length})
            </Typography>

            <Stack spacing={3}>
                {posts.map(post=>(
                    <AgriPostCard
                        key={post._id}
                        post={post}
                        onOpenProfile={
                            onOpenProfile
                        }
                    />
                ))}
            </Stack>

            {hasMore&&(
                <Box
                    display="flex"
                    justifyContent="center"
                    mt={4}
                >
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        startIcon={
                            loadingMore?(
                                <CircularProgress
                                    size={20}
                                />
                            ):null
                        }
                        sx={{
                            minWidth:180,
                            borderRadius:2,
                        }}
                    >
                        {loadingMore
                            ?t('Loading...')
                            :t('Load More')}
                    </Button>
                </Box>
            )}
        </>
    );
};

export default CommunityFeed;