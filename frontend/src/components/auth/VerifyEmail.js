import React,{useEffect,useState}from"react";
import{
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Stack,
    Typography
}from"@mui/material";
import{useDispatch,useSelector}from"react-redux";
import{verifyEmail}from"../../redux/actions/authActions";
import{Link,useSearchParams}from"react-router-dom";
import{useTranslation}from"react-i18next";

const VerifyEmail=()=>{
    const dispatch=useDispatch();
    const[tParams]=useSearchParams();
    const{t}=useTranslation();

    const{
        loading,
        error
    }=useSelector(state=>state.auth);

    const token=tParams.get("token");

    const[message,setMessage]=useState("");
    const[completed,setCompleted]=useState(false);

    useEffect(()=>{
        if(!token){
            return;
        }

        let active=true;

        const verify=async()=>{
            const result=await dispatch(
                verifyEmail(token)
            );

            if(active&&result?.success){
                setMessage(
                    result.message||
                    t("Email verified successfully.")
                );
                setCompleted(true);
            }
        };

        verify();

        return()=>{
            active=false;
        };
    },[dispatch,token,t]);

    return(
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight:"100vh",
                    display:"flex",
                    alignItems:"center",
                    py:3
                }}
            >
                <Card
                    sx={{
                        width:"100%",
                        borderRadius:4
                    }}
                    elevation={3}
                >
                    <CardContent
                        sx={{
                            p:{xs:2.5,sm:4}
                        }}
                    >
                        <Stack
                            spacing={2.5}
                            alignItems="center"
                        >
                            <Typography
                                variant="h4"
                                fontWeight={800}
                                align="center"
                            >
                                {t("Email Verification")}
                            </Typography>

                            {loading&&(
                                <>
                                    <CircularProgress/>

                                    <Typography
                                        color="text.secondary"
                                        align="center"
                                    >
                                        {t(
                                            "Verifying your email address..."
                                        )}
                                    </Typography>
                                </>
                            )}

                            {!loading&&!token&&(
                                <Alert
                                    severity="error"
                                    sx={{width:"100%"}}
                                >
                                    {t(
                                        "This verification link is invalid or incomplete."
                                    )}
                                </Alert>
                            )}

                            {!loading&&error&&(
                                <Alert
                                    severity="error"
                                    sx={{width:"100%"}}
                                >
                                    {error}
                                </Alert>
                            )}

                            {!loading&&completed&&(
                                <>
                                    <Alert
                                        severity="success"
                                        sx={{width:"100%"}}
                                    >
                                        {message}
                                    </Alert>

                                    <Button
                                        component={Link}
                                        to="/login"
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            borderRadius:2.5
                                        }}
                                    >
                                        {t("Continue to Login")}
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default VerifyEmail;