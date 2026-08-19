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
}from'../actions/notificationTypes';

const initialState={
    notifications:[],
    unreadCount:0,
    loading:false,
    countLoading:false,
    actionLoading:false,
    actionId:null,
    error:null,
    actionError:null
};

const notificationReducer=(state=initialState,action)=>{
    switch(action.type){
        case FETCH_NOTIFICATIONS_REQUEST:
            return{
                ...state,
                loading:true,
                error:null
            };

        case FETCH_NOTIFICATIONS_SUCCESS:{
            const notifications=Array.isArray(action.payload)
                ?action.payload
                :[];

            return{
                ...state,
                notifications,
                unreadCount:notifications.filter(
                    notification=>!notification.read
                ).length,
                loading:false,
                error:null
            };
        }

        case FETCH_NOTIFICATIONS_FAIL:
            return{
                ...state,
                loading:false,
                error:action.payload||'Unable to load notifications.'
            };

        case FETCH_UNREAD_COUNT_REQUEST:
            return{
                ...state,
                countLoading:true
            };

        case FETCH_UNREAD_COUNT_SUCCESS:
            return{
                ...state,
                unreadCount:Number(action.payload)||0,
                countLoading:false
            };

        case FETCH_UNREAD_COUNT_FAIL:
            return{
                ...state,
                countLoading:false
            };

        case MARK_NOTIFICATION_READ_REQUEST:
            return{
                ...state,
                actionLoading:true,
                actionId:action.payload,
                actionError:null
            };

        case MARK_NOTIFICATION_READ_SUCCESS:{
            const updatedNotification=action.payload;

            if(!updatedNotification?._id){
                return{
                    ...state,
                    actionLoading:false,
                    actionId:null
                };
            }

            const existing=state.notifications.find(
                notification=>
                    String(notification._id)===
                    String(updatedNotification._id)
            );

            const wasUnread=existing?.read===false;

            return{
                ...state,
                notifications:state.notifications.map(
                    notification=>
                        String(notification._id)===
                        String(updatedNotification._id)
                            ?updatedNotification
                            :notification
                ),
                unreadCount:wasUnread
                    ?Math.max(state.unreadCount-1,0)
                    :state.unreadCount,
                actionLoading:false,
                actionId:null,
                actionError:null
            };
        }

        case MARK_NOTIFICATION_READ_FAIL:
            return{
                ...state,
                actionLoading:false,
                actionId:null,
                actionError:
                    action.payload?.message||
                    action.payload||
                    'Unable to update notification.'
            };

        case MARK_ALL_NOTIFICATIONS_READ_REQUEST:
            return{
                ...state,
                actionLoading:true,
                actionId:'all',
                actionError:null
            };

        case MARK_ALL_NOTIFICATIONS_READ_SUCCESS:
            return{
                ...state,
                notifications:state.notifications.map(
                    notification=>({
                        ...notification,
                        read:true
                    })
                ),
                unreadCount:0,
                actionLoading:false,
                actionId:null,
                actionError:null
            };

        case MARK_ALL_NOTIFICATIONS_READ_FAIL:
            return{
                ...state,
                actionLoading:false,
                actionId:null,
                actionError:
                    action.payload||
                    'Unable to update notifications.'
            };

        case DELETE_NOTIFICATION_REQUEST:
            return{
                ...state,
                actionLoading:true,
                actionId:action.payload,
                actionError:null
            };

        case DELETE_NOTIFICATION_SUCCESS:{
            const deletedNotification=state.notifications.find(
                notification=>
                    String(notification._id)===
                    String(action.payload)
            );

            const wasUnread=Boolean(
                deletedNotification &&
                !deletedNotification.read
            );

            return{
                ...state,
                notifications:state.notifications.filter(
                    notification=>
                        String(notification._id)!==
                        String(action.payload)
                ),
                unreadCount:wasUnread
                    ?Math.max(state.unreadCount-1,0)
                    :state.unreadCount,
                actionLoading:false,
                actionId:null,
                actionError:null
            };
        }

        case DELETE_NOTIFICATION_FAIL:
            return{
                ...state,
                actionLoading:false,
                actionId:null,
                actionError:
                    action.payload?.message||
                    action.payload||
                    'Unable to delete notification.'
            };

        default:
            return state;
    }
};

export default notificationReducer;