import { createMuiTheme } from '@material-ui/core/styles';
import { black } from '@material-ui/core/colors';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#00BF63',
        },
        secondary: {
            main: black[500],
        },
        type: 'light',
    },
});

export default theme;