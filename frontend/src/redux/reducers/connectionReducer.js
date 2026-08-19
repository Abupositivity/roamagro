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
}from'../actions/types';

const initialState={
    users:[],
    discoveredUsers:[],
    connections:[],
    incomingRequests:[],
    outgoingRequests:[],
    publicProfile:null,
    connectionStatus:'none',
    loading:false,
    searchLoading:false,
    discoveryLoading:false,
    requestLoading:false,
    error:null,
    searchError:null,
    discoveryError:null,
    success:false
};

const connectionReducer=(
    state=initialState,
    action
)=>{
    switch(action.type){
        case SEARCH_USERS_REQUEST:
            return{
                ...state,
                searchLoading:true,
                searchError:null
            };

        case SEARCH_USERS_SUCCESS:
            return{
                ...state,
                searchLoading:false,
                users:action.payload.data||[],
                searchError:null
            };

        case SEARCH_USERS_FAIL:
            return{
                ...state,
                searchLoading:false,
                searchError:action.payload
            };

        case DISCOVER_USERS_REQUEST:
            return{
                ...state,
                discoveryLoading:true,
                discoveryError:null
            };

        case DISCOVER_USERS_SUCCESS:
            return{
                ...state,
                discoveryLoading:false,
                discoveredUsers:
                    action.payload.data||[],
                discoveryError:null
            };

        case DISCOVER_USERS_FAIL:
            return{
                ...state,
                discoveryLoading:false,
                discoveryError:action.payload
            };

        case GET_PUBLIC_PROFILE_REQUEST:
            return{
                ...state,
                loading:true,
                error:null,
                publicProfile:null
            };

        case GET_PUBLIC_PROFILE_SUCCESS:
            return{
                ...state,
                loading:false,
                publicProfile:action.payload,
                connectionStatus:
                    action.payload.connectionStatus||
                    'none',
                error:null
            };

        case GET_PUBLIC_PROFILE_FAIL:
            return{
                ...state,
                loading:false,
                error:action.payload
            };

        case GET_CONNECTION_STATUS_REQUEST:
            return{
                ...state,
                loading:true,
                error:null
            };

        case GET_CONNECTION_STATUS_SUCCESS:
            return{
                ...state,
                loading:false,
                connectionStatus:
                    action.payload.status||
                    'none',
                error:null
            };

        case GET_CONNECTION_STATUS_FAIL:
            return{
                ...state,
                loading:false,
                error:action.payload
            };

        case SEND_CONNECTION_REQUEST:
        case ACCEPT_CONNECTION_REQUEST:
        case DECLINE_CONNECTION_REQUEST:
        case CANCEL_CONNECTION_REQUEST:
        case REMOVE_CONNECTION_REQUEST:
            return{
                ...state,
                requestLoading:true,
                error:null,
                success:false
            };

        case SEND_CONNECTION_SUCCESS:
            return{
                ...state,
                requestLoading:false,
                success:true,
                connectionStatus:'outgoing_pending',
                discoveredUsers:
                    state.discoveredUsers.filter(
                        user=>
                            user._id!==
                            action.payload.data?.recipient?._id
                    ),
                error:null
            };

        case ACCEPT_CONNECTION_SUCCESS:
            return{
                ...state,
                requestLoading:false,
                success:true,
                connectionStatus:'connected',
                error:null
            };

        case DECLINE_CONNECTION_SUCCESS:
            return{
                ...state,
                requestLoading:false,
                success:true,
                connectionStatus:'none',
                incomingRequests:
                    state.incomingRequests.filter(
                        request=>
                            request.requester?._id!==
                            action.payload.userId
                    ),
                error:null
            };

        case CANCEL_CONNECTION_SUCCESS:
            return{
                ...state,
                requestLoading:false,
                success:true,
                connectionStatus:'none',
                error:null
            };

        case REMOVE_CONNECTION_SUCCESS:
            return{
                ...state,
                requestLoading:false,
                success:true,
                connectionStatus:'none',
                connections:
                    state.connections.filter(
                        user=>
                            user._id!==
                            action.payload.userId
                    ),
                error:null
            };

        case SEND_CONNECTION_FAIL:
        case ACCEPT_CONNECTION_FAIL:
        case DECLINE_CONNECTION_FAIL:
        case CANCEL_CONNECTION_FAIL:
        case REMOVE_CONNECTION_FAIL:
            return{
                ...state,
                requestLoading:false,
                success:false,
                error:action.payload
            };

        case FETCH_CONNECTIONS_REQUEST:
        case FETCH_INCOMING_CONNECTIONS_REQUEST:
        case FETCH_OUTGOING_CONNECTIONS_REQUEST:
            return{
                ...state,
                loading:true,
                error:null
            };

        case FETCH_CONNECTIONS_SUCCESS:
            return{
                ...state,
                loading:false,
                connections:
                    action.payload.data||[],
                error:null
            };

        case FETCH_INCOMING_CONNECTIONS_SUCCESS:
            return{
                ...state,
                loading:false,
                incomingRequests:
                    action.payload.data||[],
                error:null
            };

        case FETCH_OUTGOING_CONNECTIONS_SUCCESS:
            return{
                ...state,
                loading:false,
                outgoingRequests:
                    action.payload.data||[],
                error:null
            };

        case FETCH_CONNECTIONS_FAIL:
        case FETCH_INCOMING_CONNECTIONS_FAIL:
        case FETCH_OUTGOING_CONNECTIONS_FAIL:
            return{
                ...state,
                loading:false,
                error:action.payload
            };

        default:
            return state;
    }
};

export default connectionReducer;