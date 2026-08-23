import React,{useState}from'react';
import{Alert,Button,CircularProgress,Dialog,DialogActions,DialogContent,DialogTitle,MenuItem,Stack,TextField,Typography}from'@mui/material';
import{useTranslation}from'react-i18next';
import api from'../../services/api';

const REPORT_REASONS=[
    'Spam',
    'Harassment',
    'Scam',
    'Fake Account',
    'Inappropriate Content',
    'Other'
];

const ReportUserDialog=({
    open,
    onClose,
    userId,
    userName=''
})=>{
    const{t}=useTranslation();

    const[reason,setReason]=useState('');
    const[description,setDescription]=useState('');
    const[loading,setLoading]=useState(false);
    const[error,setError]=useState('');
    const[success,setSuccess]=useState(false);

    const handleClose=()=>{
        if(loading)return;

        setReason('');
        setDescription('');
        setError('');
        setSuccess(false);
        onClose?.();
    };

    const handleSubmit=async event=>{
        event.preventDefault();

        setError('');

        if(!userId){
            setError(
                t('Unable to identify this user.')
            );
            return;
        }

        if(!reason){
            setError(
                t('Please select a report reason.')
            );
            return;
        }

        setLoading(true);

        try{
            await api.post(
                `/users/${userId}/report`,
                {
                    reason,
                    description:description.trim()
                }
            );

            setSuccess(true);
        }catch(requestError){
            setError(
                requestError?.response?.data?.message||
                t(
                    'Unable to submit your report. Please try again.'
                )
            );
        }finally{
            setLoading(false);
        }
    };

    const handleSuccessClose=()=>{
        setReason('');
        setDescription('');
        setError('');
        setSuccess(false);
        onClose?.();
    };

    return(
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx:{
                    borderRadius:{
                        xs:3,
                        sm:4
                    },
                    m:{
                        xs:1,
                        sm:2
                    }
                }
            }}
        >
            <DialogTitle
                sx={{
                    fontWeight:800,
                    pb:1
                }}
            >
                {t('Report User')}
            </DialogTitle>

            <DialogContent dividers>
                {success?(
                    <Stack
                        spacing={2}
                        sx={{py:2}}
                    >
                        <Alert severity="success">
                            {t(
                                'User report submitted successfully.'
                            )}
                        </Alert>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {t(
                                'Thank you for helping keep RoamAgro safe. Our administrators will review your report.'
                            )}
                        </Typography>
                    </Stack>
                ):(
                    <Stack
                        component="form"
                        id="report-user-form"
                        onSubmit={handleSubmit}
                        spacing={2}
                    >
                        {error&&(
                            <Alert severity="error">
                                {error}
                            </Alert>
                        )}

                        <Typography variant="body2">
                            {userName
                                ?t(
                                    'Why are you reporting {{name}}?',
                                    {name:userName}
                                )
                                :t(
                                    'Why are you reporting this user?'
                                )}
                        </Typography>

                        <TextField
                            select
                            label={t('Report Reason')}
                            value={reason}
                            onChange={event=>
                                setReason(
                                    event.target.value
                                )
                            }
                            fullWidth
                            required
                            disabled={loading}
                        >
                            {REPORT_REASONS.map(reportReason=>(
                                <MenuItem
                                    key={reportReason}
                                    value={reportReason}
                                >
                                    {t(reportReason)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={t('Additional Details')}
                            value={description}
                            onChange={event=>
                                setDescription(
                                    event.target.value.slice(
                                        0,
                                        1000
                                    )
                                )
                            }
                            multiline
                            minRows={4}
                            maxRows={8}
                            fullWidth
                            disabled={loading}
                            placeholder={t(
                                'Provide any additional information that may help our administrators review this report.'
                            )}
                            helperText={`${description.length}/1000`}
                        />
                    </Stack>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    p:{
                        xs:2,
                        sm:2.5
                    },
                    gap:1,
                    flexDirection:{
                        xs:'column-reverse',
                        sm:'row'
                    }
                }}
            >
                {success?(
                    <Button
                        variant="contained"
                        onClick={handleSuccessClose}
                        fullWidth
                        sx={{
                            borderRadius:2.5,
                            maxWidth:{
                                sm:160
                            }
                        }}
                    >
                        {t('Done')}
                    </Button>
                ):(
                    <>
                        <Button
                            onClick={handleClose}
                            disabled={loading}
                            fullWidth
                            sx={{
                                borderRadius:2.5,
                                maxWidth:{
                                    sm:140
                                }
                            }}
                        >
                            {t('Cancel')}
                        </Button>

                        <Button
                            type="submit"
                            form="report-user-form"
                            variant="contained"
                            disabled={
                                loading||
                                !reason
                            }
                            fullWidth
                            sx={{
                                borderRadius:2.5,
                                maxWidth:{
                                    sm:180
                                }
                            }}
                        >
                            {loading?(
                                <>
                                    <CircularProgress
                                        size={19}
                                        color="inherit"
                                        sx={{mr:1}}
                                    />
                                    {t('Submitting...')}
                                </>
                            ):t('Submit Report')}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ReportUserDialog;