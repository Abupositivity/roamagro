import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    Alert,
    Box,
    Button,
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
        refreshing,
        mine,
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

    const [
        archiveRefreshKey,
        setArchiveRefreshKey,
    ] = useState(0);

    const [
        archivedTipIds,
        setArchivedTipIds,
    ] = useState([]);

    const loadMoreRef = useRef(null);
    const failedAppendRef = useRef(false);

    // Synchronous feed request protection.
    const fetchRequestRef = useRef(null);

    const [
        fetchingFeed,
        setFetchingFeed,
    ] = useState(false);

    // Protect view changes and archive refreshes.
    const feedPendingRef = useRef(true);

    const [
        feedPending,
        setFeedPending,
    ] = useState(true);

    const previousViewRef = useRef(null);

    const previousArchiveRefreshKeyRef =
        useRef(0);

    const previousLimitRef =
        useRef(null);

    const previousRefreshKeyRef =
        useRef(null);

    const viewMatchesFeed =
        Boolean(mine) === (view === 'mine');

    const buildFetchParams = useCallback(
        (
            requestedPage = 1,
            append = false
        ) => ({
            ...(view === 'mine'
                ? { mine: true }
                : {}),
            page: requestedPage,
            limit,
            ...(append
                ? { append: true }
                : {}),
        }),
        [
            view,
            limit,
        ]
    );

    // Centralized feed fetching.
    // Prevent simultaneous requests initiated
    // by this component.
    const requestFeed = useCallback(
        async (
            params,
            options = {}
        ) => {
            if (fetchRequestRef.current) {
                return {
                    success: false,
                    skipped: true,
                };
            }

            setFetchingFeed(true);

            const request =
                Promise.resolve()
                    .then(() =>
                        dispatch(
                            fetchAgriFeed(
                                params,
                                options
                            )
                        )
                    )
                    .catch((requestError) => ({
                        success: false,
                        message:
                            requestError?.message ||
                            'Unable to load agricultural tips.',
                    }));

            fetchRequestRef.current = request;

            try {
                const result = await request;

                if (!result?.skipped) {
                    if (result?.success) {
                        failedAppendRef.current = false;
                    } else if (!options.silent) {
                        failedAppendRef.current =
                            params.append === true;
                    }
                }

                return result;
            } finally {
                if (
                    fetchRequestRef.current === request
                ) {
                    fetchRequestRef.current = null;
                    setFetchingFeed(false);
                }
            }
        },
        [dispatch]
    );

    useEffect(() => {
        if (
            !canViewOwnTips &&
            view !== 'all'
        ) {
            feedPendingRef.current = true;
            setFeedPending(true);

            failedAppendRef.current = false;

            setView('all');
        }
    }, [
        canViewOwnTips,
        view,
    ]);

    // Coordinate initial loading, view changes,
    // silent refreshes and archive synchronization.
    useEffect(() => {
        if (
            !canViewOwnTips &&
            view === 'mine'
        ) {
            return undefined;
        }

        let cancelled = false;

        const viewChanged =
            previousViewRef.current !== view;

        const archiveChanged =
            previousArchiveRefreshKeyRef.current !==
            archiveRefreshKey;

        const limitChanged =
            previousLimitRef.current !== limit;

        const refreshChanged =
            previousRefreshKeyRef.current !==
            refreshKey;

        const silent =
            !viewChanged &&
            !archiveChanged &&
            !limitChanged &&
            refreshChanged &&
            refreshKey > 0;

        // Background refreshes should not
        // compete with an active feed request.
        if (
            silent &&
            (
                fetchRequestRef.current ||
                feedPendingRef.current
            )
        ) {
            previousRefreshKeyRef.current =
                refreshKey;

            return undefined;
        }

        feedPendingRef.current = true;
        setFeedPending(true);

        const loadFeed = async () => {
            try {
                // Wait for the active request.
                // Obsolete view requests are discarded
                // before another request is dispatched.
                while (
                    fetchRequestRef.current &&
                    !cancelled
                ) {
                    await fetchRequestRef.current;
                }

                if (cancelled) {
                    return;
                }

                if (!silent) {
                    failedAppendRef.current = false;
                }

                previousViewRef.current = view;

                previousArchiveRefreshKeyRef.current =
                    archiveRefreshKey;

                previousLimitRef.current = limit;

                previousRefreshKeyRef.current =
                    refreshKey;

                await requestFeed(
                    buildFetchParams(1),
                    { silent }
                );
            } finally {
                if (!cancelled) {
                    feedPendingRef.current = false;
                    setFeedPending(false);
                }
            }
        };

        loadFeed();

        return () => {
            cancelled = true;
        };
    }, [
        refreshKey,
        archiveRefreshKey,
        view,
        limit,
        canViewOwnTips,
        buildFetchParams,
        requestFeed,
    ]);

    // Preserve archive synchronization for
    // both FeaturedTips and the main feed.
    const handleArchived = useCallback(
        (tipId) => {
            setArchivedTipIds((previous) =>
                previous.includes(tipId)
                    ? previous
                    : [
                          ...previous,
                          tipId,
                      ]
            );

            feedPendingRef.current = true;
            setFeedPending(true);

            failedAppendRef.current = false;

            setArchiveRefreshKey(
                (previous) => previous + 1
            );
        },
        []
    );

    const handleLoadMore = useCallback(
        () => {
            if (
                !viewMatchesFeed ||
                !hasMore ||
                feedPendingRef.current ||
                fetchRequestRef.current ||
                fetchingFeed ||
                loading ||
                loadingMore ||
                refreshing ||
                error
            ) {
                return;
            }

            return requestFeed(
                buildFetchParams(
                    page + 1,
                    true
                )
            );
        },
        [
            viewMatchesFeed,
            hasMore,
            fetchingFeed,
            loading,
            loadingMore,
            refreshing,
            error,
            page,
            buildFetchParams,
            requestFeed,
        ]
    );

    // Retry the failed page rather than
    // unnecessarily reloading the entire feed.
    const handleRetry = () => {
        if (
            feedPendingRef.current ||
            fetchRequestRef.current ||
            fetchingFeed ||
            loading ||
            loadingMore ||
            refreshing
        ) {
            return;
        }

        const append =
            viewMatchesFeed &&
            failedAppendRef.current &&
            hasMore;

        return requestFeed(
            buildFetchParams(
                append ? page + 1 : 1,
                append
            )
        );
    };

    useEffect(() => {
        const target = loadMoreRef.current;

        if (
            !target ||
            !viewMatchesFeed ||
            !hasMore ||
            feedPending ||
            fetchingFeed ||
            loading ||
            loadingMore ||
            refreshing ||
            error
        ) {
            return;
        }

        const observer =
            new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];

                    if (
                        entry?.isIntersecting
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
    }, [
        page,
        viewMatchesFeed,
        hasMore,
        feedPending,
        fetchingFeed,
        loading,
        loadingMore,
        refreshing,
        error,
        view,
        limit,
        handleLoadMore,
    ]);

    const handleViewChange = (
        event,
        nextView
    ) => {
        if (
            nextView &&
            nextView !== view
        ) {
            feedPendingRef.current = true;
            setFeedPending(true);

            failedAppendRef.current = false;

            setView(nextView);
        }
    };

    const visibleTips = viewMatchesFeed
        ? tips
        : [];

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
                    archivedTipIds={archivedTipIds}
                    onArchived={handleArchived}
                />
            )}

            {(
                loading ||
                feedPending ||
                fetchingFeed ||
                (!viewMatchesFeed && !error)
            ) && visibleTips.length === 0 && (
                <Box
                    display="flex"
                    justifyContent="center"
                    py={5}
                >
                    <CircularProgress />
                </Box>
            )}

            {error &&
                !loading &&
                !loadingMore &&
                !feedPending &&
                !fetchingFeed && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            overflowWrap: 'anywhere',
                        }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={handleRetry}
                                disabled={
                                    loading ||
                                    loadingMore ||
                                    refreshing ||
                                    feedPending ||
                                    fetchingFeed
                                }
                            >
                                {t('Retry')}
                            </Button>
                        }
                    >
                        {t(error)}
                    </Alert>
                )}

            {viewMatchesFeed &&
                !loading &&
                !feedPending &&
                !fetchingFeed &&
                !error &&
                visibleTips.length === 0 && (
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

            {visibleTips.length > 0 && (
                <>
                    <Stack spacing={2}>
                        {visibleTips.map((tip) => (
                            <AgriTipCard
                                key={tip._id}
                                tip={tip}
                                onArchived={handleArchived}
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

                        {!loading &&
                            !loadingMore &&
                            !refreshing &&
                            !feedPending &&
                            !fetchingFeed &&
                            !hasMore &&
                            !error && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t(
                                        'You have reached the end of the agricultural tips.'
                                    )}
                                </Typography>
                            )}

                        {!loading &&
                            !loadingMore &&
                            !refreshing &&
                            !feedPending &&
                            !fetchingFeed &&
                            hasMore &&
                            !error && (
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