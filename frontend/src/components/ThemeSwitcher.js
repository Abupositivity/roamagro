import React, { memo } from "react";
import {
    Switch,
    FormControlLabel,
    Tooltip
} from "@mui/material";
import { useTranslation } from "react-i18next";

const ThemeSwitcher = ({
    darkMode = false,
    toggleDarkMode,
    setDarkMode
}) => {
    const { t } = useTranslation();

    const handleToggle = () => {
        if (toggleDarkMode) {
            toggleDarkMode();
            return;
        }

        if (setDarkMode) {
            setDarkMode(!darkMode);
        }
    };

    return (
        <Tooltip
            title={t(
                darkMode
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode"
            )}
        >
            <FormControlLabel
                control={
                    <Switch
                        checked={darkMode}
                        onChange={handleToggle}
                        color="primary"
                        inputProps={{
                            "aria-label": t("Toggle dark mode")
                        }}
                    />
                }
                label={
                    darkMode
                        ? t("Dark Mode")
                        : t("Light Mode")
                }
                sx={{
                    m: 0,
                    "& .MuiFormControlLabel-label": {
                        fontSize: "0.875rem"
                    }
                }}
            />
        </Tooltip>
    );
};

export default memo(ThemeSwitcher);