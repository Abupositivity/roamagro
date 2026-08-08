import React, {
    useEffect,
    useState,
} from 'react';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Stack,
    TextField,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import { useTranslation } from 'react-i18next';

const emptyExpense = {
    category: '',
    amount: '',
    date: '',
};

const ExpenseDialog = ({
    open,
    loading = false,
    expense = null,
    onClose,
    onSubmit,
}) => {
    const { t } = useTranslation();

    const [form, setForm] = useState(
        emptyExpense
    );

    useEffect(() => {
        if (expense) {
            setForm({
                category:
                    expense.category || '',
                amount:
                    expense.amount ?? '',
                date: expense.date
                    ? new Date(expense.date)
                          .toISOString()
                          .split('T')[0]
                    : '',
            });
        } else {
            setForm(emptyExpense);
        }
    }, [expense, open]);

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        if (
            !form.category.trim() ||
            form.amount === '' ||
            Number(form.amount) < 0
        ) {
            return;
        }

        onSubmit?.({
            ...form,
            category:
                form.category.trim(),
            amount: Number(form.amount),
        });
    };

    return (
        <Dialog
            open={open}
            onClose={
                loading
                    ? undefined
                    : onClose
            }
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent:
                        'space-between',
                    alignItems: 'center',
                }}
            >
                {expense
                    ? t('Edit Expense')
                    : t('Add Expense')}

                <IconButton
                    size="small"
                    disabled={loading}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack
                    spacing={2}
                    sx={{ mt: 1 }}
                >
                    <TextField
                        label={t(
                            'What did you spend money on?'
                        )}
                        name="category"
                        value={
                            form.category
                        }
                        onChange={
                            handleChange
                        }
                        fullWidth
                        required
                        autoFocus
                    />

                    <TextField
                        label={t(
                            'Amount (₦)'
                        )}
                        name="amount"
                        type="number"
                        value={
                            form.amount
                        }
                        onChange={
                            handleChange
                        }
                        fullWidth
                        required
                        inputProps={{
                            min: 0,
                            step: '0.01',
                        }}
                    />

                    <TextField
                        label={t('Date')}
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={
                            handleChange
                        }
                        InputLabelProps={{
                            shrink: true,
                        }}
                        fullWidth
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    disabled={loading}
                >
                    {t('Cancel')}
                </Button>

                <Button
                    variant="contained"
                    disabled={
                        loading ||
                        !form.category.trim() ||
                        form.amount === ''
                    }
                    onClick={handleSubmit}
                >
                    {expense
                        ? t(
                              'Update Expense'
                          )
                        : t(
                              'Add Expense'
                          )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExpenseDialog;