import { createMuiTheme } from '@material-ui/core/styles';
import { green, black } from '@material-ui/core/colors';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: green['#00BF63'],
        },
        secondary: {
            main: black[500],
        },
        type: 'light',
    },
});

export default theme;