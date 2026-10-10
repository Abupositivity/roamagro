import { createTheme } from "@mui/material/styles";

const COLORS = {
    primary: "#00BF63",
    primaryDark: "#00994F",
    secondary: "#333333",
    lightBackground: "#F4F7F5",
    darkBackground: "#121212",
    lightPaper: "#FFFFFF",
    darkPaper: "#1E1E1E",
    lightText: "#202124",
    darkText: "#F5F5F5"
};

export const createAppTheme = (darkMode = false) => {
    const mode = darkMode ? "dark" : "light";

    return createTheme({
        palette: {
            mode,
            primary: {
                main: COLORS.primary,
                dark: COLORS.primaryDark,
                contrastText: "#FFFFFF"
            },
            secondary: {
                main: COLORS.secondary
            },
            background: {
                default: darkMode
                    ? COLORS.darkBackground
                    : COLORS.lightBackground,
                paper: darkMode
                    ? COLORS.darkPaper
                    : COLORS.lightPaper
            },
            text: {
                primary: darkMode
                    ? COLORS.darkText
                    : COLORS.lightText,
                secondary: darkMode
                    ? "#BDBDBD"
                    : "#666666"
            },
            divider: darkMode
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.12)",
            success: {
                main: COLORS.primary
            }
        },
        typography: {
            fontFamily: [
                "Roboto",
                "Arial",
                "sans-serif"
            ].join(","),
            h1: {
                fontWeight: 700
            },
            h2: {
                fontWeight: 700
            },
            h3: {
                fontWeight: 700
            },
            h4: {
                fontWeight: 700
            },
            h5: {
                fontWeight: 700
            },
            h6: {
                fontWeight: 700
            },
            button: {
                textTransform: "none",
                fontWeight: 600
            }
        },
        shape: {
            borderRadius: 10
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        transition:
                            "background-color 150ms ease, color 150ms ease"
                    },
                    "*": {
                        boxSizing: "border-box"
                    }
                }
            },
            MuiButton: {
                defaultProps: {
                    disableElevation: true
                },
                styleOverrides: {
                    root: {
                        borderRadius: 8
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        backgroundImage: "none"
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none"
                    }
                }
            },
            MuiTextField: {
                defaultProps: {
                    size: "medium",
                    fullWidth: true
                }
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 8
                    }
                }
            },
            MuiAppBar: {
                defaultProps: {
                    color: "inherit"
                }
            }
        }
    });
};

const theme = createAppTheme(false);

export default theme;