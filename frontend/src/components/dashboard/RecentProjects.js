import React from "react";
import {
    Box,
    Paper,
    Typography,
    LinearProgress,
    Stack,
    Chip,
    Button,
} from "@mui/material";

import AgricultureIcon from "@mui/icons-material/Agriculture";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const RecentProjects = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const projects =
        useSelector(state => state.farmProjects.projects || []);

    const recentProjects = projects.slice(0, 3);

    return (

        <Box>

            <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
            >
                {t("Recent Projects")}
            </Typography>

            {recentProjects.length === 0 ? (

                <Paper
                    sx={{
                        p:3,
                        textAlign:"center",
                        borderRadius:3
                    }}
                >

                    <AgricultureIcon
                        color="success"
                        sx={{fontSize:50}}
                    />

                    <Typography mt={2}>
                        {t("No farm projects yet")}
                    </Typography>

                    <Button
                        sx={{mt:2}}
                        variant="contained"
                        onClick={() =>
                            navigate("/farm-projects")
                        }
                    >
                        {t("Create Project")}
                    </Button>

                </Paper>

            ) : (

                recentProjects.map(project=>(

                    <Paper
                        key={project._id}
                        sx={{
                            p:2,
                            mb:2,
                            borderRadius:3
                        }}
                    >

                        <Stack
                            direction="row"
                            justifyContent="space-between"
                        >

                            <Typography
                                fontWeight={700}
                            >
                                {project.name}
                            </Typography>

                            <Chip
                                size="small"
                                label={t("Active")}
                                color="success"
                            />

                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={1}
                        >
                            {project.description}
                        </Typography>

                        <LinearProgress
                            sx={{mt:2}}
                            variant="determinate"
                            value={
                                project.progress || 20
                            }
                        />

                    </Paper>

                ))

            )}

        </Box>

    );

};

export default RecentProjects;