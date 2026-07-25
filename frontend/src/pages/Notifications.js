import { Box, Typography } from '@mui/material';

const Notifications = () => {
    return (
        <Box p={3}>
            <Typography variant="h5">
                Notifications
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 2 }}>
                You have no notifications yet.
            </Typography>
        </Box>
    );
};

export default Notifications;