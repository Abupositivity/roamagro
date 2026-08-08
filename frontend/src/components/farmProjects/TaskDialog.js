import React, {
    useEffect,
    useState,
} from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import { useTranslation } from 'react-i18next';

const defaultTask = {
    title: '',
    description: '',
    dueDate: '',
};

const TaskDialog = ({
    open,
    loading = false,
    task = null,
    onClose,
    onSubmit,
}) => {
    const { t } = useTranslation();

    const [form, setForm] = useState(
        defaultTask
    );

    useEffect(() => {
        if (task) {
            setForm({
                title: task.title || '',
                description:
                    task.description || '',
                dueDate: task.dueDate
                    ? new Date(task.dueDate)
                          .toISOString()
                          .split('T')[0]
                    : '',
            });
        } else {
            setForm(defaultTask);
        }
    }, [task, open]);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            return;
        }

        onSubmit?.({
            ...form,
            title: form.title.trim(),
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
                {task
                    ? t('Edit Task')
                    : t('Add Task')}

                <IconButton
                    onClick={onClose}
                    disabled={loading}
                    size="small"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        <TextField
                            label={t(
                                'What needs to be done?'
                            )}
                            name="title"
                            value={form.title}
                            onChange={
                                handleChange
                            }
                            required
                            fullWidth
                            autoFocus
                        />

                        <TextField
                            label={t(
                                'Description'
                            )}
                            name="description"
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                            multiline
                            rows={3}
                            fullWidth
                        />

                        <TextField
                            fullWidth
                            type="date"
                            label={t(
                                'Due Date'
                            )}
                            name="dueDate"
                            value={
                                form.dueDate
                            }
                            onChange={
                                handleChange
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
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
                        type="submit"
                        variant="contained"
                        disabled={
                            loading ||
                            !form.title.trim()
                        }
                    >
                        {task
                            ? t(
                                  'Update Task'
                              )
                            : t(
                                  'Create Task'
                              )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TaskDialog;