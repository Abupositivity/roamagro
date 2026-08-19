import api from '../../services/api';

import{
    SEARCH_USERS_REQUEST,
    SEARCH_USERS_SUCCESS,
    SEARCH_USERS_FAIL,
    DISCOVER_USERS_REQUEST,
    DISCOVER_USERS_SUCCESS,
    DISCOVER_USERS_FAIL,
    GET_PUBLIC_PROFILE_REQUEST,
    GET_PUBLIC_PROFILE_SUCCESS,
    GET_PUBLIC_PROFILE_FAIL,
    GET_CONNECTION_STATUS_REQUEST,
    GET_CONNECTION_STATUS_SUCCESS,
    GET_CONNECTION_STATUS_FAIL,
    SEND_CONNECTION_REQUEST,
    SEND_CONNECTION_SUCCESS,
    SEND_CONNECTION_FAIL,
    ACCEPT_CONNECTION_REQUEST,
    ACCEPT_CONNECTION_SUCCESS,
    ACCEPT_CONNECTION_FAIL,
    DECLINE_CONNECTION_REQUEST,
    DECLINE_CONNECTION_SUCCESS,
    DECLINE_CONNECTION_FAIL,
    CANCEL_CONNECTION_REQUEST,
    CANCEL_CONNECTION_SUCCESS,
    CANCEL_CONNECTION_FAIL,
    REMOVE_CONNECTION_REQUEST,
    REMOVE_CONNECTION_SUCCESS,
    REMOVE_CONNECTION_FAIL,
    FETCH_CONNECTIONS_REQUEST,
    FETCH_CONNECTIONS_SUCCESS,
    FETCH_CONNECTIONS_FAIL,
    FETCH_INCOMING_CONNECTIONS_REQUEST,
    FETCH_INCOMING_CONNECTIONS_SUCCESS,
    FETCH_INCOMING_CONNECTIONS_FAIL,
    FETCH_OUTGOING_CONNECTIONS_REQUEST,
    FETCH_OUTGOING_CONNECTIONS_SUCCESS,
    FETCH_OUTGOING_CONNECTIONS_FAIL
}from'./types';

const getError=error=>
    error.response?.data?.message||
    'Unable to complete the connection request.';

export const searchUsers=(search,page=1,limit=12)=>
    async dispatch=>{
        dispatch({
            type:SEARCH_USERS_REQUEST
        });

        try{
            const res=await api.get(
                `/connections/search?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`
            );

            dispatch({
                type:SEARCH_USERS_SUCCESS,
                payload:res.data
            });

            return res.data;
        }catch(error){
            const message=getError(error);

            dispatch({
                type:SEARCH_USERS_FAIL,
                payload:message
            });

            return{
                success:false,
                message
            };
        }
    };

export const discoverUsers=(limit=6)=>
    async dispatch=>{
        dispatch({
            type:DISCOVER_USERS_REQUEST
        });

        try{
            const res=await api.get(
                `/connections/discover?limit=${limit}`
            );

            dispatch({
                type:DISCOVER_USERS_SUCCESS,
                payload:res.data
            });

            return res.data;
        }catch(error){
            const message=getError(error);

            dispatch({
                type:DISCOVER_USERS_FAIL,
                payload:message
            });

            return{
                success:false,
                message
            };
        }
    };

export const getPublicProfile=userId=>
    async dispatch=>{
        dispatch({
            type:GET_PUBLIC_PROFILE_REQUEST
        });

        try{
            const res=await api.get(
                `/connections/${userId}/profile`
            );

            dispatch({
                type:GET_PUBLIC_PROFILE_SUCCESS,
                payload:res.data.data
            });

            return{
                success:true,
                data:res.data.data
            };
        }catch(error){
            const message=getError(error);

            dispatch({
                type:GET_PUBLIC_PROFILE_FAIL,
                payload:message
            });

            return{
                success:false,
                message
            };
        }
    };

export const getConnectionStatus=userId=>
    async dispatch=>{
        dispatch({
            type:GET_CONNECTION_STATUS_REQUEST
        });

        try{
            const res=await api.get(
                `/connections/${userId}/status`
            );

            dispatch({
                type:GET_CONNECTION_STATUS_SUCCESS,
                payload:res.data.data
            });

            return res.data.data;
        }catch(error){
            const message=getError(error);

            dispatch({
                type:GET_CONNECTION_STATUS_FAIL,
                payload:message
            });

            return{
                status:'none',
                message
            };
        }
    };

export const sendConnectionRequest=userId=>
    async dispatch=>{
        dispatch({
            type:SEND_CONNECTION_REQUEST
        });

        try{
            const res=await api.post(
                `/connections/${userId}/connect`
            );

            dispatch({
                type:SEND_CONNECTION_SUCCESS,
                payload:res.data
            });

            return{
                success:true,
                data:res.data.data,
                message:res.data.message
            };
        }catch(error){
            const message=getError(error);

            dispatch({
                type:SEND_CONNECTION_FAIL,
                payload:message
            });

            return{
                success:false,
                message
            };
        }
    };

export const acceptConnectionRequest=userId=>
    async dispatch=>{
        dispatch({
            type:ACCEPT_CONNECTION_REQUEST
        });

        try{
            const res=await api.put(
                `/connections/${userId}/accept`
            );

            dispatch({
                type:ACCEPT_CONNECTION_SUCCESS,
                payload:res.data
            });

            return{
                success:true,
                data:res.data.data,
                message:res.data.message
            };
        }catch(error){
            const message=getError(error);

            dispatch({
                type:ACCEPT_CONNECTION_FAIL,
                payload:message
            });

            return{
                success:false,
                message
            };
        }
    };

export const declineConnectionRequest=userId=>
    async dispatch=>{
        dispatch({
            type:DECLINE_CONNECTION_REQUEST
        });

        try{
            const res=await api.delete(
                `/connections/${userId}/decline`
            );

            dispatch({
                type:DECLINE_CONNECTION_SUCCESS,
                payload:{
                    userId,
                    message:res.data.message
                }
            });

            return{
                success:true,
                message:res.data.message
            };
        }catch(error){
            const message=getError(error);

            dispatch({
                type:DECLINE_CONNECTION_FAIL,
                payload:message
            });

            return{
                success:false,
                message
            };
        }
    };

export const cancelConnectionRequest=userId=>
    async dispatch=>{
        dispatch({
            type:CANCEL_CONNECTION_REQUEST
        });

        try{
            const res=await api.delete(
                `/connections/${userId}/cancel`
            );

            dispatch({
                type:CANCEL_CONNECTION_SUCCESS,
                payload:{
                    userId,
                    message:res.data.message
                }
            });

            return{
                success:true,
                message:res.data.message
            };
        }catch(error){
            const message=getError(error);

            dispatch({
                type:CANCEL_CONNECTION_FAIL,
                payload:message
            });

            return{
                success:false,
                message
            };
        }
    };

export const removeConnection=userId=>
    async dispatch=>{
        dispatch({
            type:REMOVE_CONNECTION_REQUEST
        });

        try{
            const res=await api.delete(
                `/connections/${userId}/remove`
            );

            dispatch({
                type:REMOVE_CONNECTION_SUCCESS,
                payload:{
                    userId,
                    message:res.data.message
                }
            });

            return{
                success:true,
                message:res.data.message
            };
        }catch(error){
            const message=getError(error);

            dispatch({
                type:REMOVE_CONNECTION_FAIL,
                payload:message
            });

            return{
                success:false,
                message
            };
        }
    };

export const fetchConnections=()=>
    async dispatch=>{
        dispatch({
            type:FETCH_CONNECTIONS_REQUEST
        });

        try{
            const res=await api.get(
                '/connections'
            );

            dispatch({
                type:FETCH_CONNECTIONS_SUCCESS,
                payload:res.data
            });

            return res.data;
        }catch(error){
            const message=getError(error);

            dispatch({
                type:FETCH_CONNECTIONS_FAIL,
                payload:message
            });

            return{
                success:false,
                message
            };
        }
    };

export const fetchIncomingConnections=()=>
    async dispatch=>{
        dispatch({
            type:FETCH_INCOMING_CONNECTIONS_REQUEST
        });

        try{
            const res=await api.get(
                '/connections/requests/incoming'
            );

            dispatch({
                type:FETCH_INCOMING_CONNECTIONS_SUCCESS,
                payload:res.data
            });

            return res.data;
        }catch(error){
            const message=getError(error);

            dispatch({
                type:FETCH_INCOMING_CONNECTIONS_FAIL,
                payload:message
            });

            return{
                success:false,
                message
            };
        }
    };

export const fetchOutgoingConnections=()=>
    async dispatch=>{
        dispatch({
            type:FETCH_OUTGOING_CONNECTIONS_REQUEST
        });

        try{
            const res=await api.get(
                '/connections/requests/outgoing'
            );

            dispatch({
                type:FETCH_OUTGOING_CONNECTIONS_SUCCESS,
                payload:res.data
            });

            return res.data;
        }catch(error){
            const message=getError(error);

            dispatch({
                type:FETCH_OUTGOING_CONNECTIONS_FAIL,
                payload:message
            });

            return{
                success:false,
                message
            };
        }
    };