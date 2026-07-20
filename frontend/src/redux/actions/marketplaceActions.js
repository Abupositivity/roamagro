import api from '../../services/api';

import {
FETCH_LISTINGS_REQUEST,
FETCH_LISTINGS_SUCCESS,
FETCH_LISTINGS_FAIL,
CREATE_LISTING_REQUEST,
CREATE_LISTING_SUCCESS,
CREATE_LISTING_FAIL,
}
from './types';

export const fetchListings = () => async (dispatch)=>{
    dispatch({type:FETCH_LISTINGS_REQUEST});
    try{
        const res=await api.get('/marketplace');
        dispatch({
            type:FETCH_LISTINGS_SUCCESS,
            payload:res.data.data,
        });
    }
    catch(error){
        dispatch({
            type:FETCH_LISTINGS_FAIL,
            payload:error.response?.data?.message,
        });
    }
};

export const createListing=(listing)=>async(dispatch)=>{
    dispatch({
        type:CREATE_LISTING_REQUEST,
    });
    try{
        const res=await api.post('/marketplace',listing);
        dispatch({
            type:CREATE_LISTING_SUCCESS,
            payload:res.data.data,
        });
        console.log("✅ Listing Created");
    }
    catch(error){
        dispatch({
            type:CREATE_LISTING_FAIL,
            payload:error.response?.data?.message,
        });
    }
};