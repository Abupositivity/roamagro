import financialService from '../../services/financialService';

import {
    GET_FINANCIAL_DASHBOARD_REQUEST,
    GET_FINANCIAL_DASHBOARD_SUCCESS,
    GET_FINANCIAL_DASHBOARD_FAIL,
    GET_EXPENSE_BREAKDOWN_REQUEST,
    GET_EXPENSE_BREAKDOWN_SUCCESS,
    GET_EXPENSE_BREAKDOWN_FAIL,
    GET_PROJECT_PROFITABILITY_REQUEST,
    GET_PROJECT_PROFITABILITY_SUCCESS,
    GET_PROJECT_PROFITABILITY_FAIL,
    GET_CASHFLOW_REQUEST,
    GET_CASHFLOW_SUCCESS,
    GET_CASHFLOW_FAIL
} from '../constants/financialConstants';

import {
    CLEAR_FINANCIAL_DATA
} from '../reducers/financialReducer';

export const clearFinancialData = () => ({
    type: CLEAR_FINANCIAL_DATA
});

const fetchFinancialResource = ({
    requestType,
    successType,
    failType,
    request,
    fallbackMessage
}) => async (dispatch, getState) => {
    const sessionToken = getState().auth?.token;

    if (!sessionToken) {
        return {
            success: false,
            message: 'Please log in to continue.'
        };
    }

    dispatch({
        type: requestType
    });

    try {
        const response = await request();

        if (getState().auth?.token !== sessionToken) {
            return {
                success: false,
                message: 'Your session has changed.'
            };
        }

        const data = response.data.data;

        dispatch({
            type: successType,
            payload: data
        });

        return {
            success: true,
            data
        };
    } catch (error) {
        if (getState().auth?.token !== sessionToken) {
            return {
                success: false,
                message: 'Your session has changed.'
            };
        }

        const message =
            error.response?.data?.message ||
            error.message ||
            fallbackMessage;

        dispatch({
            type: failType,
            payload: message
        });

        return {
            success: false,
            message,
            status: error.response?.status
        };
    }
};

export const fetchFinancialDashboard = () =>
    fetchFinancialResource({
        requestType: GET_FINANCIAL_DASHBOARD_REQUEST,
        successType: GET_FINANCIAL_DASHBOARD_SUCCESS,
        failType: GET_FINANCIAL_DASHBOARD_FAIL,
        request: () => financialService.getDashboard(),
        fallbackMessage: 'Unable to load financial dashboard.'
    });

export const fetchExpenseBreakdown = () =>
    fetchFinancialResource({
        requestType: GET_EXPENSE_BREAKDOWN_REQUEST,
        successType: GET_EXPENSE_BREAKDOWN_SUCCESS,
        failType: GET_EXPENSE_BREAKDOWN_FAIL,
        request: () => financialService.getExpenseBreakdown(),
        fallbackMessage: 'Unable to load expense breakdown.'
    });

export const fetchProjectProfitability = () =>
    fetchFinancialResource({
        requestType: GET_PROJECT_PROFITABILITY_REQUEST,
        successType: GET_PROJECT_PROFITABILITY_SUCCESS,
        failType: GET_PROJECT_PROFITABILITY_FAIL,
        request: () => financialService.getProjectProfitability(),
        fallbackMessage: 'Unable to load project profitability.'
    });

export const fetchCashFlow = () =>
    fetchFinancialResource({
        requestType: GET_CASHFLOW_REQUEST,
        successType: GET_CASHFLOW_SUCCESS,
        failType: GET_CASHFLOW_FAIL,
        request: () => financialService.getMonthlyCashFlow(),
        fallbackMessage: 'Unable to load cash flow.'
    });