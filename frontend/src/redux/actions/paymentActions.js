import api from '../../services/api';

export const initializePremiumPayment = (billingCycle) =>
    async () => {
        try {
            const response = await api.post(
                '/payments/initialize',
                { billingCycle }
            );

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    'Could not start payment. Please try again.',
            };
        }
    };

export const verifyPremiumPayment = (reference) =>
    async () => {
        try {
            const response = await api.post(
                '/payments/verify',
                { reference }
            );

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    'Could not verify payment. Please try again.',
            };
        }
    };

export const fetchPaymentHistory = () =>
    async () => {
        try {
            const response = await api.get(
                '/payments/history'
            );

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    'Could not load payment history.',
            };
        }
    };