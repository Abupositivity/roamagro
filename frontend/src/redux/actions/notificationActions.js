import notificationService from '../../services/notificationService';

import{
    FETCH_NOTIFICATIONS_REQUEST,
    FETCH_NOTIFICATIONS_SUCCESS,
    FETCH_NOTIFICATIONS_FAIL,
    FETCH_UNREAD_COUNT_REQUEST,
    FETCH_UNREAD_COUNT_SUCCESS,
    FETCH_UNREAD_COUNT_FAIL,
    MARK_NOTIFICATION_READ_REQUEST,
    MARK_NOTIFICATION_READ_SUCCESS,
    MARK_NOTIFICATION_READ_FAIL,
    MARK_ALL_NOTIFICATIONS_READ_REQUEST,
    MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
    MARK_ALL_NOTIFICATIONS_READ_FAIL,
    DELETE_NOTIFICATION_REQUEST,
    DELETE_NOTIFICATION_SUCCESS,
    DELETE_NOTIFICATION_FAIL
}from './notificationTypes';

let unreadCountCache=null;
let unreadCountCacheTime=0;
let unreadCountRequest=null;

const UNREAD_COUNT_CACHE_MS=10000;

const clearUnreadCountCache=()=>{
    unreadCountCache=null;
    unreadCountCacheTime=0;
};

export const fetchNotifications=()=>async dispatch=>{
    dispatch({
        type:FETCH_NOTIFICATIONS_REQUEST
    });

    try{
        const res=await notificationService.getNotifications();

        const data=Array.isArray(res.data?.data)
            ?res.data.data
            :[];

        dispatch({
            type:FETCH_NOTIFICATIONS_SUCCESS,
            payload:data
        });

        const unreadCount=data.filter(
            notification=>!notification.read
        ).length;

        unreadCountCache=unreadCount;
        unreadCountCacheTime=Date.now();

        return{
            success:true,
            data
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            error.message||
            'Unable to load notifications.';

        dispatch({
            type:FETCH_NOTIFICATIONS_FAIL,
            payload:message
        });

        return{
            success:false,
            error:message
        };
    }
};

export const fetchUnreadCount=()=>async dispatch=>{
    const now=Date.now();

    if(
        unreadCountCache!==null&&
        now-unreadCountCacheTime<UNREAD_COUNT_CACHE_MS
    ){
        dispatch({
            type:FETCH_UNREAD_COUNT_SUCCESS,
            payload:unreadCountCache
        });

        return{
            success:true,
            count:unreadCountCache,
            cached:true
        };
    }

    if(unreadCountRequest){
        return unreadCountRequest;
    }

    dispatch({
        type:FETCH_UNREAD_COUNT_REQUEST
    });

    unreadCountRequest=(async()=>{
        try{
            const res=await notificationService.getUnreadCount();

            const count=Math.max(
                Number(res.data?.count)||0,
                0
            );

            unreadCountCache=count;
            unreadCountCacheTime=Date.now();

            dispatch({
                type:FETCH_UNREAD_COUNT_SUCCESS,
                payload:count
            });

            return{
                success:true,
                count
            };
        }catch(error){
            const message=
                error.response?.data?.message||
                error.message||
                'Unable to load notification count.';

            dispatch({
                type:FETCH_UNREAD_COUNT_FAIL,
                payload:message
            });

            return{
                success:false,
                error:message
            };
        }finally{
            unreadCountRequest=null;
        }
    })();

    return unreadCountRequest;
};

export const markNotificationAsRead=id=>async dispatch=>{
    if(!id){
        return{
            success:false,
            error:'Notification ID is required.'
        };
    }

    dispatch({
        type:MARK_NOTIFICATION_READ_REQUEST,
        payload:id
    });

    try{
        const res=await notificationService.markAsRead(id);

        clearUnreadCountCache();

        dispatch({
            type:MARK_NOTIFICATION_READ_SUCCESS,
            payload:res.data?.data
        });

        return{
            success:true,
            data:res.data?.data
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            error.message||
            'Unable to update notification.';

        dispatch({
            type:MARK_NOTIFICATION_READ_FAIL,
            payload:{
                id,
                message
            }
        });

        return{
            success:false,
            error:message
        };
    }
};

export const markAllNotificationsAsRead=()=>async dispatch=>{
    dispatch({
        type:MARK_ALL_NOTIFICATIONS_READ_REQUEST
    });

    try{
        const res=await notificationService.markAllAsRead();

        clearUnreadCountCache();

        dispatch({
            type:MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
            payload:res.data
        });

        return{
            success:true
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            error.message||
            'Unable to update notifications.';

        dispatch({
            type:MARK_ALL_NOTIFICATIONS_READ_FAIL,
            payload:message
        });

        return{
            success:false,
            error:message
        };
    }
};

export const deleteNotification=id=>async dispatch=>{
    if(!id){
        return{
            success:false,
            error:'Notification ID is required.'
        };
    }

    dispatch({
        type:DELETE_NOTIFICATION_REQUEST,
        payload:id
    });

    try{
        await notificationService.deleteNotification(id);

        clearUnreadCountCache();

        dispatch({
            type:DELETE_NOTIFICATION_SUCCESS,
            payload:id
        });

        return{
            success:true
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            error.message||
            'Unable to delete notification.';

        dispatch({
            type:DELETE_NOTIFICATION_FAIL,
            payload:{
                id,
                message
            }
        });

        return{
            success:false,
            error:message
        };
    }
};