import React,{useEffect,useState}from"react";
import{
    Avatar,
    Box,
    CircularProgress,
    Paper,
    Stack,
    Typography,
    Chip
}from"@mui/material";
import WbSunnyOutlinedIcon from"@mui/icons-material/WbSunnyOutlined";
import CloudOutlinedIcon from"@mui/icons-material/CloudOutlined";
import NightsStayOutlinedIcon from"@mui/icons-material/NightsStayOutlined";
import LocationOnOutlinedIcon from"@mui/icons-material/LocationOnOutlined";
import {useSelector}from"react-redux";
import {useTranslation}from"react-i18next";
import weatherService from"../../services/weatherService";

const DashboardHeader=()=>{
    const{t}=useTranslation();

    const user=useSelector(
        state=>state.auth.user
    );

    const[weather,setWeather]=useState(null);
    const[weatherLoading,setWeatherLoading]=
        useState(true);

    const hour=new Date().getHours();

    const greeting=
        hour<12
            ?t("Good Morning")
            :hour<17
                ?t("Good Afternoon")
                :t("Good Evening");

    const greetingIcon=
        hour<12
            ?<WbSunnyOutlinedIcon color="warning"/>
            :hour<17
                ?<CloudOutlinedIcon color="primary"/>
                :<NightsStayOutlinedIcon color="secondary"/>;

    const initials=
        user?.name
            ?.split(" ")
            .filter(Boolean)
            .slice(0,2)
            .map(
                part=>
                    part.charAt(0).toUpperCase()
            )
            .join("")
        ||"R";

    useEffect(()=>{
        let mounted=true;

        const loadWeather=async()=>{
            setWeatherLoading(true);
            setWeather(null);

            try{
                const data=
                    await weatherService.getWeather(
                        user?.location,
                        {
                            lga:user?.lga,
                            state:user?.state,
                            location:user?.location
                        }
                    );

                if(mounted){
                    setWeather(data);
                }
            }catch(error){
                if(mounted){
                    setWeather(null);
                }

                console.warn(
                    "Weather unavailable:",
                    error?.message
                );
            }finally{
                if(mounted){
                    setWeatherLoading(false);
                }
            }
        };

        loadWeather();

        return()=>{
            mounted=false;
        };
    },[
        user?.lga,
        user?.state,
        user?.location
    ]);

    return(
        <Paper
            elevation={2}
            sx={{
                p:{xs:2,sm:3},
                borderRadius:3
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Box>
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >
                        {greetingIcon}

                        <Typography
                            variant="h5"
                            fontWeight={700}
                        >
                            {greeting}
                        </Typography>
                    </Stack>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        mt={1}
                    >
                        <strong>
                            {user?.name||t("Farmer")}
                        </strong>
                    </Typography>
                </Box>

                <Avatar
                    src={
                        user?.profilePhoto||
                        undefined
                    }
                    alt={
                        user?.name||
                        t("RoamAgro user")
                    }
                    sx={{
                        width:60,
                        height:60,
                        bgcolor:"primary.main",
                        fontSize:24,
                        fontWeight:700
                    }}
                >
                    {!user?.profilePhoto&&initials}
                </Avatar>
            </Stack>

            <Box mt={3}>
                {weatherLoading?(
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >
                        <CircularProgress
                            size={20}
                        />

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {t("Loading weather...")}
                        </Typography>
                    </Stack>
                ):weather?(
                    <Box>
                        <Stack
                            direction={{
                                xs:"column",
                                sm:"row"
                            }}
                            spacing={2}
                            alignItems={{
                                xs:"flex-start",
                                sm:"center"
                            }}
                        >
                            <Chip
                                icon={
                                    <LocationOnOutlinedIcon/>
                                }
                                label={
                                    weather.country
                                        ?`${weather.location}, ${weather.country}`
                                        :weather.location
                                }
                                color="success"
                                variant="outlined"
                            />

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {typeof weather.temperature==="number"
                                    ?`${Math.round(
                                        weather.temperature
                                    )}°C`
                                    :"--"}
                            </Typography>

                            <Typography
                                color="text.secondary"
                            >
                                {t(
                                    weather.condition
                                )}
                            </Typography>
                        </Stack>

                        {weather.forecast?.length>0&&(
                            <Stack
                                direction={{
                                    xs:"column",
                                    sm:"row"
                                }}
                                spacing={1}
                                mt={2}
                            >
                                {weather.forecast.map(
                                    day=>(
                                        <Chip
                                            key={day.date}
                                            label={`${new Date(
                                                day.date
                                            ).toLocaleDateString(
                                                undefined,
                                                {
                                                    weekday:"short"
                                                }
                                            )}: ${
                                                typeof day.maxTemperature==="number"
                                                    ?Math.round(
                                                        day.maxTemperature
                                                    )
                                                    :"--"
                                            }°/${
                                                typeof day.minTemperature==="number"
                                                    ?Math.round(
                                                        day.minTemperature
                                                    )
                                                    :"--"
                                            }°C`}
                                            variant="outlined"
                                            size="small"
                                        />
                                    )
                                )}
                            </Stack>
                        )}
                    </Box>
                ):(
                    <Chip
                        label={t(
                            "Weather unavailable"
                        )}
                        color="default"
                        variant="outlined"
                    />
                )}
            </Box>
        </Paper>
    );
};

export default DashboardHeader;