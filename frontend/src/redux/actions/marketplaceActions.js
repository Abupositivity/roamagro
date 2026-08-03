import api from '../../services/api';

import {
FETCH_LISTINGS_REQUEST,
FETCH_LISTINGS_SUCCESS,
FETCH_LISTINGS_FAIL,
CREATE_LISTING_REQUEST,
CREATE_LISTING_SUCCESS,
CREATE_LISTING_FAIL,
GET_LISTING_REQUEST,
GET_LISTING_SUCCESS,
GET_LISTING_FAIL,
UPDATE_LISTING_REQUEST,
UPDATE_LISTING_SUCCESS,
UPDATE_LISTING_FAIL,
DELETE_LISTING_REQUEST,
DELETE_LISTING_SUCCESS,
DELETE_LISTING_FAIL
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

export const getListing=id=>async(dispatch)=>{
dispatch({
type:GET_LISTING_REQUEST
});
try{
const res=await api.get(`/marketplace/${id}`);
dispatch({
type:GET_LISTING_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:GET_LISTING_FAIL,
payload:error.response?.data?.message
});
}
};

export const updateListing=(id,data)=>async(dispatch)=>{
dispatch({
type:UPDATE_LISTING_REQUEST
});
try{
const res=await api.put(
`/marketplace/${id}`,
data
);
dispatch({
type:UPDATE_LISTING_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:UPDATE_LISTING_FAIL,
payload:error.response?.data?.message
});
}
};

export const deleteListing=id=>async(dispatch)=>{
dispatch({
type:DELETE_LISTING_REQUEST
});
try{
await api.delete(`/marketplace/${id}`);
dispatch({
type:DELETE_LISTING_SUCCESS,
payload:id
});
}catch(error){
dispatch({
type:DELETE_LISTING_FAIL,
payload:error.response?.data?.message
});
}
};