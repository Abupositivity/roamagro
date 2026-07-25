import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

const Profile = () => {

    const { user } = useSelector(state => state.auth);

    return (
        <Box p={3}>

            <Typography variant="h5">
                Profile
            </Typography>

            <Typography sx={{ mt: 2 }}>
                Name: {user?.name}
            </Typography>

            <Typography>
                Email: {user?.email}
            </Typography>

        </Box>
    );
};

export default Profile;