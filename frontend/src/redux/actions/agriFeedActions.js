import api from '../../services/api';

import {
    FETCH_AGRI_FEED_REQUEST,
    FETCH_AGRI_FEED_SUCCESS,
    FETCH_AGRI_FEED_FAIL,
} from './types';

export const fetchAgriFeed =
    (params = {}) =>
    async (dispatch) => {

        dispatch({
            type: FETCH_AGRI_FEED_REQUEST,
        });

        try {

            const res = await api.get(
                '/feed',
                {
                    params,
                }
            );

            dispatch({

                type: FETCH_AGRI_FEED_SUCCESS,

                payload: res.data.data,

            });

        } catch (error) {

            dispatch({

                type: FETCH_AGRI_FEED_FAIL,

                payload:
                    error.response?.data?.message ||
                    'Unable to load agricultural tips.',

            });

        }

    };