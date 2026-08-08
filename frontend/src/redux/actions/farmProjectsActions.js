import farmProjectService from '../../services/farmProjectService';
import api from '../../services/api';

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
} from './types';


const getError = error =>
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong.';


// ============================================================
// FARM PROJECTS
// ============================================================

export const fetchFarmProjects = () => async dispatch => {

    dispatch({
        type: FETCH_PROJECTS_REQUEST
    });

    try {

        const res =
            await farmProjectService.getProjects();

        const data = res.data.data;

        dispatch({
            type: FETCH_PROJECTS_SUCCESS,
            payload: data
        });

        return {
            success: true,
            data
        };

    } catch (error) {

        const message = getError(error);

        dispatch({
            type: FETCH_PROJECTS_FAIL,
            payload: message
        });

        return {
            success: false,
            message
        };
    }
};


export const createFarmProject =
    project => async dispatch => {

        dispatch({
            type: CREATE_PROJECT_REQUEST
        });

        try {

            const res =
                await farmProjectService.createProject(
                    project
                );

            const data = res.data.data;

            dispatch({
                type: CREATE_PROJECT_SUCCESS,
                payload: data
            });

            return {
                success: true,
                data
            };

        } catch (error) {

            const message = getError(error);

            dispatch({
                type: CREATE_PROJECT_FAIL,
                payload: message
            });

            return {
                success: false,
                message
            };
        }
    };


export const updateFarmProject =
    (id, project) => async dispatch => {

        dispatch({
            type: UPDATE_PROJECT_REQUEST
        });

        try {

            const res =
                await farmProjectService.updateProject(
                    id,
                    project
                );

            const data = res.data.data;

            dispatch({
                type: UPDATE_PROJECT_SUCCESS,
                payload: data
            });

            return {
                success: true,
                data
            };

        } catch (error) {

            const message = getError(error);

            dispatch({
                type: UPDATE_PROJECT_FAIL,
                payload: message
            });

            return {
                success: false,
                message
            };
        }
    };


export const deleteFarmProject =
    id => async dispatch => {

        dispatch({
            type: DELETE_PROJECT_REQUEST
        });

        try {

            await farmProjectService.deleteProject(id);

            dispatch({
                type: DELETE_PROJECT_SUCCESS,
                payload: id
            });

            return {
                success: true
            };

        } catch (error) {

            const message = getError(error);

            dispatch({
                type: DELETE_PROJECT_FAIL,
                payload: message
            });

            return {
                success: false,
                message
            };
        }
    };


// ============================================================
// ACTIVITIES
// ============================================================

export const fetchActivities =
    projectId => async dispatch => {

        dispatch({
            type: FETCH_ACTIVITIES_REQUEST
        });

        try {

            const res = await api.get(
                `/farm-projects/${projectId}/activities`
            );

            const data = res.data.data;

            dispatch({
                type: FETCH_ACTIVITIES_SUCCESS,
                payload: {
                    projectId,
                    activities: data
                }
            });

            return {
                success: true,
                data
            };

        } catch (error) {

            const message =
                getError(error);

            dispatch({
                type: FETCH_ACTIVITIES_FAIL,
                payload: message
            });

            return {
                success: false,
                message
            };
        }
    };


export const createActivity =
    (projectId, data) => async dispatch => {

        dispatch({
            type: CREATE_ACTIVITY_REQUEST
        });

        try {

            const res = await api.post(
                `/farm-projects/${projectId}/activities`,
                data
            );

            const activity = res.data.data;

            dispatch({
                type: CREATE_ACTIVITY_SUCCESS,
                payload: {
                    projectId,
                    activity
                }
            });

            return {
                success: true,
                data: activity
            };

        } catch (error) {

            const message =
                getError(error);

            dispatch({
                type: CREATE_ACTIVITY_FAIL,
                payload: message
            });

            return {
                success: false,
                message
            };
        }
    };


export const updateActivity =
    (projectId, activityId, data) =>
        async dispatch => {

            dispatch({
                type: UPDATE_ACTIVITY_REQUEST
            });

            try {

                const res = await api.put(
                    `/farm-projects/${projectId}/activities/${activityId}`,
                    data
                );

                const activity = res.data.data;

                dispatch({
                    type: UPDATE_ACTIVITY_SUCCESS,
                    payload: {
                        projectId,
                        activity
                    }
                });

                return {
                    success: true,
                    data: activity
                };

            } catch (error) {

                const message =
                    getError(error);

                dispatch({
                    type: UPDATE_ACTIVITY_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


export const updateActivityStatus =
    (projectId, activityId, status) =>
        async dispatch => {

            dispatch({
                type: UPDATE_ACTIVITY_STATUS_REQUEST
            });

            try {

                const res = await api.patch(
                    `/farm-projects/${projectId}/activities/${activityId}/status`,
                    {status}
                );

                const activity = res.data.data;

                dispatch({
                    type: UPDATE_ACTIVITY_STATUS_SUCCESS,
                    payload: {
                        projectId,
                        activity
                    }
                });

                return {
                    success: true,
                    data: activity
                };

            } catch (error) {

                const message =
                    getError(error);

                dispatch({
                    type: UPDATE_ACTIVITY_STATUS_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


export const deleteActivity =
    (projectId, activityId) =>
        async dispatch => {

            dispatch({
                type: DELETE_ACTIVITY_REQUEST
            });

            try {

                await api.delete(
                    `/farm-projects/${projectId}/activities/${activityId}`
                );

                dispatch({
                    type: DELETE_ACTIVITY_SUCCESS,
                    payload: {
                        projectId,
                        activityId
                    }
                });

                return {
                    success: true
                };

            } catch (error) {

                const message =
                    getError(error);

                dispatch({
                    type: DELETE_ACTIVITY_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


// ============================================================
// TASKS
// ============================================================

export const createTask =
    (projectId, data) => async dispatch => {

        dispatch({
            type: CREATE_TASK_REQUEST
        });

        try {

            const res = await api.post(
                `/farm-projects/${projectId}/tasks`,
                data
            );

            const project = res.data.data;

            dispatch({
                type: CREATE_TASK_SUCCESS,
                payload: project
            });

            return {
                success: true,
                data: project
            };

        } catch (error) {

            const message = getError(error);

            dispatch({
                type: CREATE_TASK_FAIL,
                payload: message
            });

            return {
                success: false,
                message
            };
        }
    };


export const updateTask =
    (projectId, taskId, data) =>
        async dispatch => {

            dispatch({
                type: UPDATE_TASK_REQUEST
            });

            try {

                const res = await api.put(
                    `/farm-projects/${projectId}/tasks/${taskId}`,
                    data
                );

                const project = res.data.data;

                dispatch({
                    type: UPDATE_TASK_SUCCESS,
                    payload: project
                });

                return {
                    success: true,
                    data: project
                };

            } catch (error) {

                const message = getError(error);

                dispatch({
                    type: UPDATE_TASK_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


export const deleteTask =
    (projectId, taskId) =>
        async dispatch => {

            dispatch({
                type: DELETE_TASK_REQUEST
            });

            try {

                const res = await api.delete(
                    `/farm-projects/${projectId}/tasks/${taskId}`
                );

                const project = res.data.data;

                dispatch({
                    type: DELETE_TASK_SUCCESS,
                    payload: project
                });

                return {
                    success: true,
                    data: project
                };

            } catch (error) {

                const message = getError(error);

                dispatch({
                    type: DELETE_TASK_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


export const updateTaskStatus =
    (projectId, taskId, status) =>
        async dispatch => {

            dispatch({
                type: UPDATE_TASK_STATUS_REQUEST
            });

            try {

                const res = await api.patch(
                    `/farm-projects/${projectId}/tasks/${taskId}/status`,
                    {status}
                );

                const project = res.data.data;

                dispatch({
                    type: UPDATE_TASK_STATUS_SUCCESS,
                    payload: project
                });

                return {
                    success: true,
                    data: project
                };

            } catch (error) {

                const message = getError(error);

                dispatch({
                    type: UPDATE_TASK_STATUS_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


// ============================================================
// EXPENSES
// ============================================================

export const createExpense =
    (projectId, data) => async dispatch => {

        dispatch({
            type: CREATE_EXPENSE_REQUEST
        });

        try {

            const res = await api.post(
                `/farm-projects/${projectId}/expenses`,
                data
            );

            const project = res.data.data;

            dispatch({
                type: CREATE_EXPENSE_SUCCESS,
                payload: project
            });

            return {
                success: true,
                data: project
            };

        } catch (error) {

            const message = getError(error);

            dispatch({
                type: CREATE_EXPENSE_FAIL,
                payload: message
            });

            return {
                success: false,
                message
            };
        }
    };


export const updateExpense =
    (projectId, expenseId, data) =>
        async dispatch => {

            dispatch({
                type: UPDATE_EXPENSE_REQUEST
            });

            try {

                const res = await api.put(
                    `/farm-projects/${projectId}/expenses/${expenseId}`,
                    data
                );

                const project = res.data.data;

                dispatch({
                    type: UPDATE_EXPENSE_SUCCESS,
                    payload: project
                });

                return {
                    success: true,
                    data: project
                };

            } catch (error) {

                const message = getError(error);

                dispatch({
                    type: UPDATE_EXPENSE_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


export const deleteExpense =
    (projectId, expenseId) =>
        async dispatch => {

            dispatch({
                type: DELETE_EXPENSE_REQUEST
            });

            try {

                const res = await api.delete(
                    `/farm-projects/${projectId}/expenses/${expenseId}`
                );

                const project = res.data.data;

                dispatch({
                    type: DELETE_EXPENSE_SUCCESS,
                    payload: project
                });

                return {
                    success: true,
                    data: project
                };

            } catch (error) {

                const message = getError(error);

                dispatch({
                    type: DELETE_EXPENSE_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


// ============================================================
// HARVESTS
// ============================================================

export const createHarvest =
    (projectId, data) => async dispatch => {

        dispatch({
            type: CREATE_HARVEST_REQUEST
        });

        try {

            const res =
                await farmProjectService.createHarvest(
                    projectId,
                    data
                );

            const project = res.data.data;

            dispatch({
                type: CREATE_HARVEST_SUCCESS,
                payload: project
            });

            return {
                success: true,
                data: project
            };

        } catch (error) {

            const message = getError(error);

            dispatch({
                type: CREATE_HARVEST_FAIL,
                payload: message
            });

            return {
                success: false,
                message
            };
        }
    };


export const updateHarvest =
    (projectId, harvestId, data) =>
        async dispatch => {

            dispatch({
                type: UPDATE_HARVEST_REQUEST
            });

            try {

                const res =
                    await farmProjectService.updateHarvest(
                        projectId,
                        harvestId,
                        data
                    );

                const project = res.data.data;

                dispatch({
                    type: UPDATE_HARVEST_SUCCESS,
                    payload: project
                });

                return {
                    success: true,
                    data: project
                };

            } catch (error) {

                const message = getError(error);

                dispatch({
                    type: UPDATE_HARVEST_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


export const deleteHarvest =
    (projectId, harvestId) =>
        async dispatch => {

            dispatch({
                type: DELETE_HARVEST_REQUEST
            });

            try {

                const res =
                    await farmProjectService.deleteHarvest(
                        projectId,
                        harvestId
                    );

                const project = res.data.data;

                dispatch({
                    type: DELETE_HARVEST_SUCCESS,
                    payload: project
                });

                return {
                    success: true,
                    data: project
                };

            } catch (error) {

                const message = getError(error);

                dispatch({
                    type: DELETE_HARVEST_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


// ============================================================
// REMINDERS
// ============================================================

export const createReminder =
    (projectId, data) => async dispatch => {

        dispatch({
            type: CREATE_REMINDER_REQUEST
        });

        try {

            const res =
                await farmProjectService.createReminder(
                    projectId,
                    data
                );

            const project = res.data.data;

            dispatch({
                type: CREATE_REMINDER_SUCCESS,
                payload: project
            });

            return {
                success: true,
                data: project
            };

        } catch (error) {

            const message = getError(error);

            dispatch({
                type: CREATE_REMINDER_FAIL,
                payload: message
            });

            return {
                success: false,
                message
            };
        }
    };


export const updateReminder =
    (projectId, reminderId, data) =>
        async dispatch => {

            dispatch({
                type: UPDATE_REMINDER_REQUEST
            });

            try {

                const res =
                    await farmProjectService.updateReminder(
                        projectId,
                        reminderId,
                        data
                    );

                const project = res.data.data;

                dispatch({
                    type: UPDATE_REMINDER_SUCCESS,
                    payload: project
                });

                return {
                    success: true,
                    data: project
                };

            } catch (error) {

                const message = getError(error);

                dispatch({
                    type: UPDATE_REMINDER_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


export const toggleReminder =
    (projectId, reminderId) =>
        async dispatch => {

            dispatch({
                type: TOGGLE_REMINDER_REQUEST
            });

            try {

                const res =
                    await farmProjectService.toggleReminder(
                        projectId,
                        reminderId
                    );

                const project = res.data.data;

                dispatch({
                    type: TOGGLE_REMINDER_SUCCESS,
                    payload: project
                });

                return {
                    success: true,
                    data: project
                };

            } catch (error) {

                const message = getError(error);

                dispatch({
                    type: TOGGLE_REMINDER_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };


export const deleteReminder =
    (projectId, reminderId) =>
        async dispatch => {

            dispatch({
                type: DELETE_REMINDER_REQUEST
            });

            try {

                const res =
                    await farmProjectService.deleteReminder(
                        projectId,
                        reminderId
                    );

                const project = res.data.data;

                dispatch({
                    type: DELETE_REMINDER_SUCCESS,
                    payload: project
                });

                return {
                    success: true,
                    data: project
                };

            } catch (error) {

                const message = getError(error);

                dispatch({
                    type: DELETE_REMINDER_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    message
                };
            }
        };