import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    Alert,
    Box,
    CircularProgress,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';

import {
    useDispatch,
    useSelector,
} from 'react-redux';

import { useTranslation } from 'react-i18next';

import {
    fetchAgriFeed,
} from '../../redux/actions/agriFeedActions';

import AgriTipCard from './AgriTipCard';
import FeaturedTips from './FeaturedTips';

const AgriFeed = ({ refreshKey = 0 }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        tips,
        loading,
        error,
        page,
        limit,
        hasMore,
        loadingMore,
    } = useSelector(
        (state) => state.agriFeed
    );

    const user = useSelector(
        (state) => state.auth.user
    );

    const role = user?.role?.toLowerCase();

    const canViewOwnTips =
        role === 'admin' ||
        role === 'extension_officer';

    const [view, setView] = useState('all');

    const loadMoreRef = useRef(null);

    useEffect(() => {
        if (!canViewOwnTips && view !== 'all') {
            setView('all');
        }
    }, [
        canViewOwnTips,
        view,
    ]);

    useEffect(() => {
        dispatch(
            fetchAgriFeed(
                view === 'mine'
                    ? {
                          mine: true,
                          page: 1,
                          limit,
                      }
                    : {
                          page: 1,
                          limit,
                      },
                {
                    silent: refreshKey > 0,
                }
            )
        );
    }, [
        dispatch,
        refreshKey,
        view,
        limit,
    ]);

    const handleLoadMore = useCallback(() => {
        if (
            !hasMore ||
            loading ||
            loadingMore
        ) {
            return;
        }

        dispatch(
            fetchAgriFeed(
                view === 'mine'
                    ? {
                          mine: true,
                          page: page + 1,
                          limit,
                          append: true,
                      }
                    : {
                          page: page + 1,
                          limit,
                          append: true,
                      }
            )
        );
    }, [
        dispatch,
        hasMore,
        loading,
        loadingMore,
        page,
        view,
        limit,
    ]);

    useEffect(() => {
        const target = loadMoreRef.current;

        if (!target) {
            return;
        }

        const observer =
            new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];

                    if (
                        entry.isIntersecting
                    ) {
                        handleLoadMore();
                    }
                },
                {
                    rootMargin:
                        '0px 0px 500px 0px',
                }
            );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [page, hasMore, loading, loadingMore, view, limit, handleLoadMore]);

    const handleViewChange = (
        event,
        nextView
    ) => {
        if (nextView) {
            setView(nextView);
        }
    };

    return (
        <Box>
            {canViewOwnTips && (
                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={handleViewChange}
                    size="small"
                    color="primary"
                    sx={{ mb: 3 }}
                >
                    <ToggleButton value="all">
                        {t('All Tips')}
                    </ToggleButton>

                    <ToggleButton value="mine">
                        {t('My Tips')}
                    </ToggleButton>
                </ToggleButtonGroup>
            )}

            {view === 'all' && (
                <FeaturedTips
                    refreshKey={refreshKey}
                />
            )}

            {loading && tips.length === 0 && (
                <Box
                    display="flex"
                    justifyContent="center"
                    py={5}
                >
                    <CircularProgress />
                </Box>
            )}

            {error && tips.length === 0 && !loading && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>
            )}

            {!loading &&
                !error &&
                tips.length === 0 && (
                    <Alert severity="info">
                        {view === 'mine'
                            ? t(
                                  'You have not created any tips yet.'
                              )
                            : t(
                                  'No agricultural tips available yet.'
                              )}
                    </Alert>
                )}

            {tips.length > 0 && (
                <>
                    <Stack spacing={2}>
                        {tips.map((tip) => (
                            <AgriTipCard
                                key={tip._id}
                                tip={tip}
                            />
                        ))}
                    </Stack>

                    <Box
                        ref={loadMoreRef}
                        display="flex"
                        justifyContent="center"
                        py={4}
                    >
                        {loadingMore && (
                            <Stack
                                alignItems="center"
                                spacing={1}
                            >
                                <CircularProgress
                                    size={24}
                                />

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t(
                                        'Loading more tips...'
                                    )}
                                </Typography>
                            </Stack>
                        )}

                        {!loadingMore &&
                            !hasMore && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t(
                                        'You have reached the end of the agricultural tips.'
                                    )}
                                </Typography>
                            )}

                        {!loadingMore &&
                            hasMore && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t(
                                        'Scroll for more tips'
                                    )}
                                </Typography>
                            )}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default AgriFeed;