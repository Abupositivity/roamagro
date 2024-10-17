import { createMuiTheme } from '@mui/material/styles';
import { common } from '@mui/material/colors';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#00BF63',
        },
        secondary: {
            main: common.black,
        },
        type: 'light',
    },
});

export default theme;