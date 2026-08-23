import React,{useCallback,useEffect,useMemo,useState}from'react';
import{Alert,Box,Button,Card,CardContent,Chip,CircularProgress,Dialog,DialogActions,DialogContent,DialogTitle,Divider,FormControl,Grid,InputLabel,MenuItem,Select,Stack,TextField,Typography}from'@mui/material';
import CheckCircleOutlineIcon from'@mui/icons-material/CheckCircleOutline';
import BlockOutlinedIcon from'@mui/icons-material/BlockOutlined';
import RestoreOutlinedIcon from'@mui/icons-material/RestoreOutlined';
import VisibilityOutlinedIcon from'@mui/icons-material/VisibilityOutlined';
import RefreshOutlinedIcon from'@mui/icons-material/RefreshOutlined';
import{useTranslation}from'react-i18next';
import PageLayout from'../components/layout/PageLayout';
import api from'../services/api';

const REPORT_STATUSES=[
    'pending',
    'reviewed',
    'dismissed',
    'action_taken'
];

const STATUS_COLORS={
    pending:'warning',
    reviewed:'info',
    dismissed:'default',
    action_taken:'success'
};

const formatDate=value=>{
    if(!value)return'';

    const date=new Date(value);

    return Number.isNaN(date.getTime())
        ?''
        :date.toLocaleString();
};

const getUserName=user=>{
    if(!user)return'Unknown User';

    if(typeof user==='string'){
        return user;
    }

    return user.name||
        user.email||
        'Unknown User';
};

const getUserEmail=user=>{
    if(!user||typeof user==='string'){
        return'';
    }

    return user.email||'';
};

const getUserId=user=>{
    if(!user)return'';

    if(typeof user==='string'){
        return user;
    }

    return user._id||user.id||'';
};

const AdminReports=()=>{
    const{t}=useTranslation();

    const[reports,setReports]=useState([]);
    const[loading,setLoading]=useState(true);
    const[error,setError]=useState('');
    const[filter,setFilter]=useState('all');
    const[selectedReport,setSelectedReport]=useState(null);
    const[status,setStatus]=useState('');
    const[adminNote,setAdminNote]=useState('');
    const[updateLoading,setUpdateLoading]=useState(false);
    const[actionLoading,setActionLoading]=useState(false);
    const[actionError,setActionError]=useState('');
    const[actionSuccess,setActionSuccess]=useState('');

    const fetchReports=useCallback(async()=>{
        setLoading(true);
        setError('');

        try{
            const response=await api.getReports();

            const data=
                response?.data?.data||
                response?.data?.reports||
                response?.data;

            setReports(
                Array.isArray(data)
                    ?data
                    :[]
            );
        }catch(requestError){
            setError(
                requestError?.response?.data?.message||
                t(
                    'Unable to load reports. Please try again.'
                )
            );
        }finally{
            setLoading(false);
        }
    },[t]);

    useEffect(()=>{
        fetchReports();
    },[fetchReports]);

    const filteredReports=useMemo(()=>{
        if(filter==='all'){
            return reports;
        }

        return reports.filter(
            report=>report.status===filter
        );
    },[reports,filter]);

    const pendingCount=reports.filter(
        report=>report.status==='pending'
    ).length;

    const openReport=report=>{
        setSelectedReport(report);
        setStatus(report.status||'pending');
        setAdminNote(report.adminNote||'');
        setActionError('');
        setActionSuccess('');
    };

    const closeReport=()=>{
        if(updateLoading||actionLoading)return;

        setSelectedReport(null);
        setStatus('');
        setAdminNote('');
        setActionError('');
        setActionSuccess('');
    };

    const handleUpdateReport=async()=>{
        if(!selectedReport)return;

        setUpdateLoading(true);
        setActionError('');
        setActionSuccess('');

        try{
            const response=await api.updateReportStatus(
                selectedReport._id,
                status
            );

            const updatedReport=
                response?.data?.data;

            const nextReport=
                updatedReport||{
                    ...selectedReport,
                    status
                };

            if(adminNote.trim()){
                nextReport.adminNote=
                    adminNote.trim();
            }

            setReports(previous=>
                previous.map(report=>
                    report._id===selectedReport._id
                        ?nextReport
                        :report
                )
            );

            setSelectedReport(nextReport);

            setActionSuccess(
                response?.data?.message||
                t('Report updated successfully.')
            );
        }catch(requestError){
            setActionError(
                requestError?.response?.data?.message||
                t(
                    'Unable to update this report.'
                )
            );
        }finally{
            setUpdateLoading(false);
        }
    };

    const handleSuspend=async()=>{
        if(!selectedReport?.reportedUser)return;

        const reportedUserId=
            getUserId(selectedReport.reportedUser);

        if(!reportedUserId)return;

        setActionLoading(true);
        setActionError('');
        setActionSuccess('');

        try{
            const response=await api.suspendUser(
                reportedUserId,
                {
                    reason:
                        selectedReport.reason||
                        'User reported'
                }
            );

            const updatedUser=
                response?.data?.data;

            setReports(previous=>
                previous.map(report=>{
                    if(report._id!==selectedReport._id){
                        return report;
                    }

                    return{
                        ...report,
                        reportedUser:
                            updatedUser||
                            typeof report.reportedUser==='object'
                                ?{
                                    ...report.reportedUser,
                                    accountStatus:'suspended'
                                }
                                :report.reportedUser
                    };
                })
            );

            setSelectedReport(previous=>{
                if(!previous)return previous;

                return{
                    ...previous,
                    reportedUser:
                        updatedUser||
                        typeof previous.reportedUser==='object'
                            ?{
                                ...previous.reportedUser,
                                accountStatus:'suspended'
                            }
                            :previous.reportedUser
                };
            });

            setActionSuccess(
                response?.data?.message||
                t(
                    'User account suspended successfully.'
                )
            );
        }catch(requestError){
            setActionError(
                requestError?.response?.data?.message||
                t(
                    'Unable to suspend this user.'
                )
            );
        }finally{
            setActionLoading(false);
        }
    };

    const handleReinstate=async()=>{
        if(!selectedReport?.reportedUser)return;

        const reportedUserId=
            getUserId(selectedReport.reportedUser);

        if(!reportedUserId)return;

        setActionLoading(true);
        setActionError('');
        setActionSuccess('');

        try{
            const response=
                await api.restoreUser(
                    reportedUserId
                );

            const updatedUser=
                response?.data?.data;

            setReports(previous=>
                previous.map(report=>{
                    if(report._id!==selectedReport._id){
                        return report;
                    }

                    return{
                        ...report,
                        reportedUser:
                            updatedUser||
                            typeof report.reportedUser==='object'
                                ?{
                                    ...report.reportedUser,
                                    accountStatus:'active'
                                }
                                :report.reportedUser
                    };
                })
            );

            setSelectedReport(previous=>{
                if(!previous)return previous;

                return{
                    ...previous,
                    reportedUser:
                        updatedUser||
                        typeof previous.reportedUser==='object'
                            ?{
                                ...previous.reportedUser,
                                accountStatus:'active'
                            }
                            :previous.reportedUser
                };
            });

            setActionSuccess(
                response?.data?.message||
                t(
                    'User account reinstated successfully.'
                )
            );
        }catch(requestError){
            setActionError(
                requestError?.response?.data?.message||
                t(
                    'Unable to reinstate this user.'
                )
            );
        }finally{
            setActionLoading(false);
        }
    };

    const getReportedUserStatus=report=>{
        const user=report?.reportedUser;

        if(!user||typeof user==='string'){
            return'';
        }

        return user.accountStatus||'active';
    };

    return(
        <PageLayout>
            <Stack spacing={3}>
                <Box>
                    <Stack
                        direction={{
                            xs:'column',
                            sm:'row'
                        }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{
                            xs:'stretch',
                            sm:'center'
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h4"
                                fontWeight={800}
                            >
                                {t('Report Management')}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{mt:.75}}
                            >
                                {t(
                                    'Review user reports and manage reported accounts.'
                                )}
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={
                                <RefreshOutlinedIcon/>
                            }
                            onClick={fetchReports}
                            disabled={loading}
                            sx={{
                                borderRadius:2.5,
                                alignSelf:{
                                    xs:'flex-start',
                                    sm:'auto'
                                }
                            }}
                        >
                            {t('Refresh')}
                        </Button>
                    </Stack>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            elevation={1}
                            sx={{
                                borderRadius:3,
                                height:'100%'
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t('Total Reports')}
                                </Typography>

                                <Typography
                                    variant="h4"
                                    fontWeight={800}
                                    sx={{mt:.5}}
                                >
                                    {reports.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            elevation={1}
                            sx={{
                                borderRadius:3,
                                height:'100%'
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t('Pending Reports')}
                                </Typography>

                                <Typography
                                    variant="h4"
                                    fontWeight={800}
                                    color="warning.main"
                                    sx={{mt:.5}}
                                >
                                    {pendingCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Card
                    elevation={1}
                    sx={{borderRadius:4}}
                >
                    <CardContent>
                        <Stack
                            direction={{
                                xs:'column',
                                sm:'row'
                            }}
                            spacing={2}
                            justifyContent="space-between"
                            alignItems={{
                                xs:'stretch',
                                sm:'center'
                            }}
                        >
                            <Typography
                                variant="h6"
                                fontWeight={800}
                            >
                                {t('User Reports')}
                            </Typography>

                            <FormControl
                                size="small"
                                sx={{
                                    minWidth:{
                                        xs:'100%',
                                        sm:190
                                    }
                                }}
                            >
                                <InputLabel>
                                    {t('Filter Status')}
                                </InputLabel>

                                <Select
                                    value={filter}
                                    label={t(
                                        'Filter Status'
                                    )}
                                    onChange={event=>
                                        setFilter(
                                            event.target.value
                                        )
                                    }
                                >
                                    <MenuItem value="all">
                                        {t('All Reports')}
                                    </MenuItem>

                                    {REPORT_STATUSES.map(
                                        reportStatus=>(
                                            <MenuItem
                                                key={reportStatus}
                                                value={reportStatus}
                                            >
                                                {t(
                                                    reportStatus
                                                )}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Stack>

                        <Divider sx={{my:2}}/>

                        {error&&(
                            <Alert
                                severity="error"
                                sx={{mb:2}}
                            >
                                {error}
                            </Alert>
                        )}

                        {loading?(
                            <Box
                                sx={{
                                    display:'flex',
                                    justifyContent:'center',
                                    py:6
                                }}
                            >
                                <CircularProgress/>
                            </Box>
                        ):filteredReports.length===0?(
                            <Box
                                sx={{
                                    py:6,
                                    textAlign:'center'
                                }}
                            >
                                <Typography
                                    fontWeight={700}
                                >
                                    {t(
                                        'No reports found.'
                                    )}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{mt:.5}}
                                >
                                    {filter==='all'
                                        ?t(
                                            'There are currently no user reports.'
                                        )
                                        :t(
                                            'No reports match the selected status.'
                                        )}
                                </Typography>
                            </Box>
                        ):(
                            <Stack spacing={1.5}>
                                {filteredReports.map(
                                    report=>{
                                        const reporter=
                                            report.reporter;

                                        const reportedUser=
                                            report.reportedUser;

                                        return(
                                            <Card
                                                key={
                                                    report._id
                                                }
                                                variant="outlined"
                                                sx={{
                                                    borderRadius:3
                                                }}
                                            >
                                                <CardContent>
                                                    <Stack
                                                        spacing={1.5}
                                                    >
                                                        <Stack
                                                            direction={{
                                                                xs:'column',
                                                                sm:'row'
                                                            }}
                                                            spacing={1.5}
                                                            justifyContent="space-between"
                                                        >
                                                            <Box
                                                                sx={{
                                                                    minWidth:0
                                                                }}
                                                            >
                                                                <Typography
                                                                    fontWeight={800}
                                                                >
                                                                    {getUserName(
                                                                        reportedUser
                                                                    )}
                                                                </Typography>

                                                                {getUserEmail(
                                                                    reportedUser
                                                                )&&(
                                                                    <Typography
                                                                        variant="body2"
                                                                        color="text.secondary"
                                                                    >
                                                                        {getUserEmail(
                                                                            reportedUser
                                                                        )}
                                                                    </Typography>
                                                                )}
                                                            </Box>

                                                            <Chip
                                                                label={
                                                                    t(
                                                                        report.status||
                                                                        'pending'
                                                                    )
                                                                }
                                                                color={
                                                                    STATUS_COLORS[
                                                                        report.status
                                                                    ]||
                                                                    'default'
                                                                }
                                                                size="small"
                                                            />
                                                        </Stack>

                                                        <Grid
                                                            container
                                                            spacing={1.5}
                                                        >
                                                            <Grid
                                                                item
                                                                xs={12}
                                                                sm={4}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    display="block"
                                                                >
                                                                    {t(
                                                                        'Reported By'
                                                                    )}
                                                                </Typography>

                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={600}
                                                                >
                                                                    {getUserName(
                                                                        reporter
                                                                    )}
                                                                </Typography>
                                                            </Grid>

                                                            <Grid
                                                                item
                                                                xs={12}
                                                                sm={4}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    display="block"
                                                                >
                                                                    {t(
                                                                        'Reason'
                                                                    )}
                                                                </Typography>

                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={600}
                                                                >
                                                                    {t(
                                                                        report.reason||
                                                                        'Other'
                                                                    )}
                                                                </Typography>
                                                            </Grid>

                                                            <Grid
                                                                item
                                                                xs={12}
                                                                sm={4}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    display="block"
                                                                >
                                                                    {t(
                                                                        'Submitted'
                                                                    )}
                                                                </Typography>

                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={600}
                                                                >
                                                                    {formatDate(
                                                                        report.createdAt
                                                                    )}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>

                                                        {report.description&&(
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{
                                                                    whiteSpace:'pre-wrap',
                                                                    wordBreak:'break-word'
                                                                }}
                                                            >
                                                                {
                                                                    report.description
                                                                }
                                                            </Typography>
                                                        )}

                                                        <Button
                                                            variant="outlined"
                                                            startIcon={
                                                                <VisibilityOutlinedIcon/>
                                                            }
                                                            onClick={()=>
                                                                openReport(
                                                                    report
                                                                )
                                                            }
                                                            sx={{
                                                                alignSelf:{
                                                                    xs:'stretch',
                                                                    sm:'flex-start'
                                                                },
                                                                borderRadius:2.5
                                                            }}
                                                        >
                                                            {t(
                                                                'Review Report'
                                                            )}
                                                        </Button>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        );
                                    }
                                )}
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            </Stack>

            <Dialog
                open={Boolean(selectedReport)}
                onClose={closeReport}
                fullWidth
                maxWidth="md"
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
                        fontWeight:800
                    }}
                >
                    {t('Review Report')}
                </DialogTitle>

                <DialogContent dividers>
                    {selectedReport&&(
                        <Stack spacing={2.5}>
                            {(actionError||
                                actionSuccess)&&(
                                <Alert
                                    severity={
                                        actionError
                                            ?'error'
                                            :'success'
                                    }
                                >
                                    {
                                        actionError||
                                        actionSuccess
                                    }
                                </Alert>
                            )}

                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {t(
                                        'Reported User'
                                    )}
                                </Typography>

                                <Typography
                                    fontWeight={800}
                                >
                                    {getUserName(
                                        selectedReport.reportedUser
                                    )}
                                </Typography>

                                {getUserEmail(
                                    selectedReport.reportedUser
                                )&&(
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {getUserEmail(
                                            selectedReport.reportedUser
                                        )}
                                    </Typography>
                                )}
                            </Box>

                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {t('Reporter')}
                                </Typography>

                                <Typography
                                    fontWeight={700}
                                >
                                    {getUserName(
                                        selectedReport.reporter
                                    )}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {t('Reason')}
                                </Typography>

                                <Typography
                                    fontWeight={700}
                                >
                                    {t(
                                        selectedReport.reason||
                                        'Other'
                                    )}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {t(
                                        'Report Description'
                                    )}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt:.5,
                                        whiteSpace:'pre-wrap',
                                        wordBreak:'break-word'
                                    }}
                                >
                                    {selectedReport.description||
                                        t(
                                            'No additional details provided.'
                                        )}
                                </Typography>
                            </Box>

                            <Divider/>

                            <TextField
                                select
                                label={t('Status')}
                                value={status}
                                onChange={event=>
                                    setStatus(
                                        event.target.value
                                    )
                                }
                                fullWidth
                                disabled={updateLoading}
                            >
                                {REPORT_STATUSES.map(
                                    reportStatus=>(
                                        <MenuItem
                                            key={reportStatus}
                                            value={reportStatus}
                                        >
                                            {t(
                                                reportStatus
                                            )}
                                        </MenuItem>
                                    )
                                )}
                            </TextField>

                            <TextField
                                label={t('Admin Note')}
                                value={adminNote}
                                onChange={event=>
                                    setAdminNote(
                                        event.target.value
                                    )
                                }
                                multiline
                                minRows={3}
                                maxRows={7}
                                fullWidth
                                disabled={updateLoading}
                                placeholder={t(
                                    'Add an internal note about this report review...'
                                )}
                            />

                            <Stack spacing={1}>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={800}
                                >
                                    {t(
                                        'Account Actions'
                                    )}
                                </Typography>

                                <Stack
                                    direction={{
                                        xs:'column',
                                        sm:'row'
                                    }}
                                    spacing={1}
                                >
                                    {getReportedUserStatus(
                                        selectedReport
                                    )==='suspended'?(
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            startIcon={
                                                <RestoreOutlinedIcon/>
                                            }
                                            onClick={
                                                handleReinstate
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                            sx={{
                                                borderRadius:2.5
                                            }}
                                        >
                                            {actionLoading
                                                ?t(
                                                    'Processing...'
                                                )
                                                :t(
                                                    'Reinstate User'
                                                )}
                                        </Button>
                                    ):(
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={
                                                <BlockOutlinedIcon/>
                                            }
                                            onClick={
                                                handleSuspend
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                            sx={{
                                                borderRadius:2.5
                                            }}
                                        >
                                            {actionLoading
                                                ?t(
                                                    'Processing...'
                                                )
                                                :t(
                                                    'Suspend User'
                                                )}
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
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
                    <Button
                        onClick={closeReport}
                        disabled={
                            updateLoading||
                            actionLoading
                        }
                        fullWidth
                        sx={{
                            borderRadius:2.5,
                            maxWidth:{
                                sm:140
                            }
                        }}
                    >
                        {t('Close')}
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={
                            updateLoading
                                ?<CircularProgress
                                    size={18}
                                    color="inherit"
                                />
                                :<CheckCircleOutlineIcon/>
                        }
                        onClick={
                            handleUpdateReport
                        }
                        disabled={
                            updateLoading||
                            actionLoading||
                            !status
                        }
                        fullWidth
                        sx={{
                            borderRadius:2.5,
                            maxWidth:{
                                sm:190
                            }
                        }}
                    >
                        {t('Save Review')}
                    </Button>
                </DialogActions>
            </Dialog>
        </PageLayout>
    );
};

export default AdminReports;