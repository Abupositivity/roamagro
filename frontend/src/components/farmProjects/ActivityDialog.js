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
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import { useTranslation } from 'react-i18next';

const statuses = [
    'Pending',
    'In Progress',
    'Completed',
];

const emptyActivity = {
    title: '',
    status: 'Pending',
    dueDate: '',
};

const ActivityDialog = ({
    open,
    loading = false,
    activity = null,
    onClose,
    onSubmit,
}) => {
    const { t } = useTranslation();

    const [form, setForm] = useState(
        emptyActivity
    );

    useEffect(() => {
        if (activity) {
            setForm({
                title: activity.title || '',
                status:
                    activity.status || 'Pending',
                dueDate: activity.dueDate
                    ? new Date(activity.dueDate)
                          .toISOString()
                          .split('T')[0]
                    : '',
            });
        } else {
            setForm(emptyActivity);
        }
    }, [activity, open]);

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
                {activity
                    ? t('Edit Activity')
                    : t('New Activity')}

                <IconButton
                    onClick={onClose}
                    disabled={loading}
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
                        label={t('What needs to be done?')}
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        fullWidth
                        required
                        autoFocus
                    />

                    <TextField
                        select
                        label={t('Status')}
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        fullWidth
                    >
                        {statuses.map((status) => (
                            <MenuItem
                                key={status}
                                value={status}
                            >
                                {t(status)}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label={t('Due Date')}
                        name="dueDate"
                        type="date"
                        value={form.dueDate}
                        onChange={handleChange}
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
                    onClick={handleSubmit}
                    disabled={
                        loading ||
                        !form.title.trim()
                    }
                >
                    {activity
                        ? t('Update Activity')
                        : t('Add Activity')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ActivityDialog;