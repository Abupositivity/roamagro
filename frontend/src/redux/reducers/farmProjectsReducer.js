import {
    FETCH_PROJECTS_REQUEST,
    FETCH_PROJECTS_SUCCESS,
    FETCH_PROJECTS_FAIL,

    CREATE_PROJECT_REQUEST,
    CREATE_PROJECT_SUCCESS,
    CREATE_PROJECT_FAIL,

    UPDATE_PROJECT_REQUEST,
    UPDATE_PROJECT_SUCCESS,
    UPDATE_PROJECT_FAIL,

    DELETE_PROJECT_REQUEST,
    DELETE_PROJECT_SUCCESS,
    DELETE_PROJECT_FAIL,

    FETCH_ACTIVITIES_REQUEST,
    FETCH_ACTIVITIES_SUCCESS,
    FETCH_ACTIVITIES_FAIL,

    CREATE_ACTIVITY_REQUEST,
    CREATE_ACTIVITY_SUCCESS,
    CREATE_ACTIVITY_FAIL,

    UPDATE_ACTIVITY_REQUEST,
    UPDATE_ACTIVITY_SUCCESS,
    UPDATE_ACTIVITY_FAIL,

    UPDATE_ACTIVITY_STATUS_REQUEST,
    UPDATE_ACTIVITY_STATUS_SUCCESS,
    UPDATE_ACTIVITY_STATUS_FAIL,

    DELETE_ACTIVITY_REQUEST,
    DELETE_ACTIVITY_SUCCESS,
    DELETE_ACTIVITY_FAIL,

    CREATE_TASK_REQUEST,
    CREATE_TASK_SUCCESS,
    CREATE_TASK_FAIL,

    UPDATE_TASK_REQUEST,
    UPDATE_TASK_SUCCESS,
    UPDATE_TASK_FAIL,

    DELETE_TASK_REQUEST,
    DELETE_TASK_SUCCESS,
    DELETE_TASK_FAIL,

    UPDATE_TASK_STATUS_REQUEST,
    UPDATE_TASK_STATUS_SUCCESS,
    UPDATE_TASK_STATUS_FAIL,

    CREATE_EXPENSE_REQUEST,
    CREATE_EXPENSE_SUCCESS,
    CREATE_EXPENSE_FAIL,

    UPDATE_EXPENSE_REQUEST,
    UPDATE_EXPENSE_SUCCESS,
    UPDATE_EXPENSE_FAIL,

    DELETE_EXPENSE_REQUEST,
    DELETE_EXPENSE_SUCCESS,
    DELETE_EXPENSE_FAIL,

    CREATE_HARVEST_REQUEST,
    CREATE_HARVEST_SUCCESS,
    CREATE_HARVEST_FAIL,

    UPDATE_HARVEST_REQUEST,
    UPDATE_HARVEST_SUCCESS,
    UPDATE_HARVEST_FAIL,

    DELETE_HARVEST_REQUEST,
    DELETE_HARVEST_SUCCESS,
    DELETE_HARVEST_FAIL,

    CREATE_REMINDER_REQUEST,
    CREATE_REMINDER_SUCCESS,
    CREATE_REMINDER_FAIL,

    UPDATE_REMINDER_REQUEST,
    UPDATE_REMINDER_SUCCESS,
    UPDATE_REMINDER_FAIL,

    DELETE_REMINDER_REQUEST,
    DELETE_REMINDER_SUCCESS,
    DELETE_REMINDER_FAIL,

    TOGGLE_REMINDER_REQUEST,
    TOGGLE_REMINDER_SUCCESS,
    TOGGLE_REMINDER_FAIL
} from '../actions/types';


// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
    projects: [],
    currentProject: null,
    loading: false,
    success: false,
    error: null,
    lastAction: null
};


// ============================================================
// HELPERS
// ============================================================

/**
 * Replace a project inside the projects array.
 */
const updateProject = (
    projects,
    updatedProject
) => {

    return projects.map(project =>
        project._id === updatedProject._id
            ? updatedProject
            : project
    );
};


/**
 * Update the currently opened project.
 */
const updateCurrentProject = (
    currentProject,
    updatedProject
) => {

    return (
        currentProject &&
        currentProject._id === updatedProject._id
    )
        ? updatedProject
        : currentProject;
};


// ============================================================
// REDUCER
// ============================================================

const farmProjectsReducer = (
    state = initialState,
    action
) => {

    switch (action.type) {

        // ====================================================
        // REQUESTS
        // ====================================================

        case FETCH_PROJECTS_REQUEST:
        case CREATE_PROJECT_REQUEST:
        case UPDATE_PROJECT_REQUEST:
        case DELETE_PROJECT_REQUEST:
        case FETCH_ACTIVITIES_REQUEST:
        case CREATE_ACTIVITY_REQUEST:
        case UPDATE_ACTIVITY_REQUEST:
        case UPDATE_ACTIVITY_STATUS_REQUEST:
        case DELETE_ACTIVITY_REQUEST:
        case CREATE_TASK_REQUEST:
        case UPDATE_TASK_REQUEST:
        case DELETE_TASK_REQUEST:
        case UPDATE_TASK_STATUS_REQUEST:
        case CREATE_EXPENSE_REQUEST:
        case UPDATE_EXPENSE_REQUEST:
        case DELETE_EXPENSE_REQUEST:
        case CREATE_HARVEST_REQUEST:
        case UPDATE_HARVEST_REQUEST:
        case DELETE_HARVEST_REQUEST:
        case CREATE_REMINDER_REQUEST:
        case UPDATE_REMINDER_REQUEST:
        case DELETE_REMINDER_REQUEST:
        case TOGGLE_REMINDER_REQUEST:

            return {
                ...state,
                loading: true,
                error: null
            };


        // ====================================================
        // FARM PROJECTS
        // ====================================================

        case FETCH_PROJECTS_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,
                lastAction: 'FETCH_PROJECTS',
                projects: action.payload,
                error: null
            };


        case CREATE_PROJECT_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,
                lastAction: 'CREATE_PROJECT',

                projects: [
                    action.payload,
                    ...state.projects
                ],

                currentProject: action.payload,
                error: null
            };


        case UPDATE_PROJECT_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,
                lastAction: 'UPDATE_PROJECT',

                projects: updateProject(
                    state.projects,
                    action.payload
                ),

                currentProject: action.payload,
                error: null
            };


        case DELETE_PROJECT_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,
                lastAction: 'DELETE_PROJECT',

                projects: state.projects.filter(
                    project =>
                        project._id !== action.payload
                ),

                currentProject: null,
                error: null
            };


        // ====================================================
        // ACTIVITIES
        // ====================================================

        case FETCH_ACTIVITIES_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,
                lastAction: 'FETCH_ACTIVITIES',

                projects: state.projects.map(project =>
                    project._id ===
                    action.payload.projectId

                        ? {
                            ...project,
                            activities:
                                action.payload.activities
                        }

                        : project
                ),

                currentProject:
                    state.currentProject &&
                    state.currentProject._id ===
                    action.payload.projectId

                        ? {
                            ...state.currentProject,
                            activities:
                                action.payload.activities
                        }

                        : state.currentProject,

                error: null
            };


        case CREATE_ACTIVITY_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,
                lastAction: 'CREATE_ACTIVITY',

                projects: state.projects.map(project =>
                    project._id ===
                    action.payload.projectId

                        ? {
                            ...project,

                            activities: [
                                ...(project.activities || []),
                                action.payload.activity
                            ]
                        }

                        : project
                ),

                currentProject:
                    state.currentProject &&
                    state.currentProject._id ===
                    action.payload.projectId

                        ? {
                            ...state.currentProject,

                            activities: [
                                ...(state.currentProject.activities || []),
                                action.payload.activity
                            ]
                        }

                        : state.currentProject,

                error: null
            };


        case UPDATE_ACTIVITY_SUCCESS:
        case UPDATE_ACTIVITY_STATUS_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,

                lastAction:
                    action.type ===
                    UPDATE_ACTIVITY_STATUS_SUCCESS

                        ? 'UPDATE_ACTIVITY_STATUS'

                        : 'UPDATE_ACTIVITY',

                projects: state.projects.map(project =>
                    project._id !==
                    action.payload.projectId

                        ? project

                        : {
                            ...project,

                            activities: (
                                project.activities || []
                            ).map(activity =>
                                activity._id ===
                                action.payload.activity._id

                                    ? action.payload.activity

                                    : activity
                            )
                        }
                ),

                currentProject:
                    state.currentProject &&
                    state.currentProject._id ===
                    action.payload.projectId

                        ? {
                            ...state.currentProject,

                            activities: (
                                state.currentProject.activities || []
                            ).map(activity =>
                                activity._id ===
                                action.payload.activity._id

                                    ? action.payload.activity

                                    : activity
                            )
                        }

                        : state.currentProject,

                error: null
            };


        case DELETE_ACTIVITY_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,
                lastAction: 'DELETE_ACTIVITY',

                projects: state.projects.map(project =>
                    project._id !==
                    action.payload.projectId

                        ? project

                        : {
                            ...project,

                            activities: (
                                project.activities || []
                            ).filter(
                                activity =>
                                    activity._id !==
                                    action.payload.activityId
                            )
                        }
                ),

                currentProject:
                    state.currentProject &&
                    state.currentProject._id ===
                    action.payload.projectId

                        ? {
                            ...state.currentProject,

                            activities: (
                                state.currentProject.activities || []
                            ).filter(
                                activity =>
                                    activity._id !==
                                    action.payload.activityId
                            )
                        }

                        : state.currentProject,

                error: null
            };


        // ====================================================
        // TASKS
        // ====================================================

        /*
         * The API returns the complete updated
         * project for task operations.
         */

        case CREATE_TASK_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,
                lastAction: 'CREATE_TASK',

                projects: updateProject(
                    state.projects,
                    action.payload
                ),

                currentProject: updateCurrentProject(
                    state.currentProject,
                    action.payload
                ),

                error: null
            };


        case UPDATE_TASK_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,
                lastAction: 'UPDATE_TASK',

                projects: updateProject(
                    state.projects,
                    action.payload
                ),

                currentProject: updateCurrentProject(
                    state.currentProject,
                    action.payload
                ),

                error: null
            };


        case UPDATE_TASK_STATUS_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,
                lastAction: 'UPDATE_TASK_STATUS',

                projects: updateProject(
                    state.projects,
                    action.payload
                ),

                currentProject: updateCurrentProject(
                    state.currentProject,
                    action.payload
                ),

                error: null
            };


        case DELETE_TASK_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,
                lastAction: 'DELETE_TASK',

                projects: updateProject(
                    state.projects,
                    action.payload
                ),

                currentProject: updateCurrentProject(
                    state.currentProject,
                    action.payload
                ),

                error: null
            };


        // ====================================================
        // EXPENSES
        // ====================================================

        /*
         * The API returns the complete updated project.
         * Replacing the project here ensures that:
         *
         * - expenses update immediately
         * - financials update immediately
         * - calculated profit updates immediately
         * - currentProject stays synchronized
         */

        case CREATE_EXPENSE_SUCCESS:
        case UPDATE_EXPENSE_SUCCESS:
        case DELETE_EXPENSE_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,

                lastAction:
                    action.type ===
                    CREATE_EXPENSE_SUCCESS

                        ? 'CREATE_EXPENSE'

                        : action.type ===
                          UPDATE_EXPENSE_SUCCESS

                            ? 'UPDATE_EXPENSE'

                            : 'DELETE_EXPENSE',

                projects: updateProject(
                    state.projects,
                    action.payload
                ),

                currentProject: updateCurrentProject(
                    state.currentProject,
                    action.payload
                ),

                error: null
            };


        // ====================================================
        // HARVESTS
        // ====================================================

        case CREATE_HARVEST_SUCCESS:
        case UPDATE_HARVEST_SUCCESS:
        case DELETE_HARVEST_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,

                lastAction:
                    action.type ===
                    CREATE_HARVEST_SUCCESS

                        ? 'CREATE_HARVEST'

                        : action.type ===
                          UPDATE_HARVEST_SUCCESS

                            ? 'UPDATE_HARVEST'

                            : 'DELETE_HARVEST',

                projects: updateProject(
                    state.projects,
                    action.payload
                ),

                currentProject: updateCurrentProject(
                    state.currentProject,
                    action.payload
                ),

                error: null
            };


        // ====================================================
        // REMINDERS
        // ====================================================

        case CREATE_REMINDER_SUCCESS:
        case UPDATE_REMINDER_SUCCESS:
        case DELETE_REMINDER_SUCCESS:
        case TOGGLE_REMINDER_SUCCESS:

            return {
                ...state,
                loading: false,
                success: true,

                lastAction:
                    action.type ===
                    CREATE_REMINDER_SUCCESS

                        ? 'CREATE_REMINDER'

                        : action.type ===
                          UPDATE_REMINDER_SUCCESS

                            ? 'UPDATE_REMINDER'

                            : action.type ===
                              DELETE_REMINDER_SUCCESS

                                ? 'DELETE_REMINDER'

                                : 'TOGGLE_REMINDER',

                projects: updateProject(
                    state.projects,
                    action.payload
                ),

                currentProject: updateCurrentProject(
                    state.currentProject,
                    action.payload
                ),

                error: null
            };


        // ====================================================
        // ERRORS
        // ====================================================

        case FETCH_PROJECTS_FAIL:
        case CREATE_PROJECT_FAIL:
        case UPDATE_PROJECT_FAIL:
        case DELETE_PROJECT_FAIL:
        case FETCH_ACTIVITIES_FAIL:
        case CREATE_ACTIVITY_FAIL:
        case UPDATE_ACTIVITY_FAIL:
        case UPDATE_ACTIVITY_STATUS_FAIL:
        case DELETE_ACTIVITY_FAIL:
        case CREATE_TASK_FAIL:
        case UPDATE_TASK_FAIL:
        case DELETE_TASK_FAIL:
        case UPDATE_TASK_STATUS_FAIL:
        case CREATE_EXPENSE_FAIL:
        case UPDATE_EXPENSE_FAIL:
        case DELETE_EXPENSE_FAIL:
        case CREATE_HARVEST_FAIL:
        case UPDATE_HARVEST_FAIL:
        case DELETE_HARVEST_FAIL:
        case CREATE_REMINDER_FAIL:
        case UPDATE_REMINDER_FAIL:
        case DELETE_REMINDER_FAIL:
        case TOGGLE_REMINDER_FAIL:

            return {
                ...state,
                loading: false,
                success: false,
                error: action.payload
            };


        // ====================================================
        // DEFAULT
        // ====================================================

        default:
            return state;
    }
};


export default farmProjectsReducer;