import { useMemo } from "react";
import * as yup from "yup";
import { Formik } from "formik";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { Psbt } from "bitcoinjs-lib";
import { useSnackbar } from "notistack";
import { Fields, IFieldsProps } from "./forms/Fields";
import { useObservable } from "../Observable";
import { Wallet } from "../wallet/Wallet";
import { convertSatoshisToBTC, convertBTCToSatoshis } from "../utils";

export interface ISendCoinsProps {
    wallet: Wallet
    handleBack: () => void
}

const INITIAL_VALUE = {
    destinationAddr: '',
    amountInBTC: 0,
    openConfirmDialog: false
}

const SEND_FORM_FIELDS: IFieldsProps['fields'] = [
    {
        name: 'destinationAddr',
        label: 'Destination Address'
    },
    {
        name: 'amountInBTC',
        label: 'Amount in BTC',
        type: 'amount'
    }
];

export const SendCoins: React.FC<ISendCoinsProps> = ({ wallet, handleBack }) => {
    const { enqueueSnackbar } = useSnackbar();
    const balanceInSat = useObservable(wallet.balanceInSatoshis);
    const balance = useMemo(() => {
        if (!balanceInSat) return 0;
        return convertSatoshisToBTC(balanceInSat);
    }, [balanceInSat]);

    return <>
        <Formik
            initialValues={INITIAL_VALUE}
            validationSchema={yup.object({
                destinationAddr: yup.string()
                    .required("Destination address is required"),
                amountInBTC: yup.number()
                    .required("Amount is required")
                    .max(balance ?? 0, "Insufficient balamce")
            })}
            onSubmit={async (values) => {
                try {
                    const { inputs, outputs, fee } = await wallet.selectUTXOs([
                        { address: values.destinationAddr, value: convertBTCToSatoshis(values.amountInBTC) }
                    ]);
                    console.log(inputs, outputs, fee);
                    if (!inputs || !outputs) {
                        enqueueSnackbar('Cannot complete payment', { variant: 'error' });
                        return;
                    }
                    const tx = wallet.createTx(inputs, outputs);
                    console.log(tx);
                } catch (e: any) {
                    enqueueSnackbar(e.message, { variant: 'error' });
                }
            }}
        >
            {
                ({ isSubmitting, values, setErrors, setFieldValue, submitForm, validateForm }) => (
                    <>
                        <Fields fields={SEND_FORM_FIELDS} />
                        <Typography color='GrayText' variant='body2'>
                            You will have {
                                new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })
                                    .format(values.amountInBTC ? balance - values.amountInBTC : balance)
                            } BTC left
                        </Typography>

                        <Box display={'flex'} mt={4}>
                            <Button
                                disabled={isSubmitting}
                                onClick={() => handleBack()}
                                sx={{ ml: 'auto', mr: 2 }}
                            >
                                Back
                            </Button>

                            <Button
                                disabled={isSubmitting}
                                onClick={async () => {
                                    const errors = await validateForm();
                                    if (Object.keys(errors).length) {
                                        setErrors(errors);
                                        return;
                                    }

                                    setFieldValue('openConfirmDialog', true)
                                }}
                                color='primary'
                                variant='contained'
                                startIcon={
                                    isSubmitting && <CircularProgress size={20} color='inherit' />
                                }
                            >
                                Send
                            </Button>
                        </Box>

                        <Dialog
                            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
                            maxWidth="xs"
                            open={values.openConfirmDialog}
                            onClose={() => setFieldValue('openConfirmDialog', false)}
                        >
                            <DialogTitle>Confirm transfer</DialogTitle>
                            <DialogContent>
                                You are about to send <strong>{values.amountInBTC}</strong> BTC to{' '}
                                <strong>{values.destinationAddr}</strong><br /><br />
                                Are you sure you want to continue?
                            </DialogContent>
                            <DialogActions>
                                <Button autoFocus onClick={() => setFieldValue('openConfirmDialog', false)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => {
                                    setFieldValue('openConfirmDialog', false);
                                    submitForm();
                                }}>Continue</Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )
            }
        </Formik>
    </>
}
