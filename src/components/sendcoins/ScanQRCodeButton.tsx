import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, IconButtonProps
} from "@mui/material";

interface IScanProps {
    onScanSuccess: (decodedText: any, decodedResult: any) => void;
    onScanFailure: (error: any) => void;
}

export const ScanQRCodeButton: React.FC<IScanProps & IconButtonProps> = ({
    onScanSuccess, onScanFailure, ...props
}) => {
    const [open, setOpen] = useState(false);
    const qrcodeScannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        if (open) {
            const html5QrcodeScanner = qrcodeScannerRef.current ??
                new Html5Qrcode("reader", false);
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            html5QrcodeScanner.start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => {
                    setOpen(false);
                    onScanSuccess(decodedText, decodedResult);
                },
                (error) => console.log(error)
            );
            qrcodeScannerRef.current = html5QrcodeScanner;
        } else {
            qrcodeScannerRef.current?.stop();
        }
    }, [open, setOpen, qrcodeScannerRef.current]);

    return <>
        <IconButton
            {...props}
            onClick={() => {
                setOpen(true);
            }}
        />

        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%' } }}
            maxWidth="xs"
            open={open}
            onClose={() => setOpen(false)}
            keepMounted
        >
            <DialogTitle>Scan QR</DialogTitle>

            <DialogContent
                id='reader'
                sx={{ height: '313px',  '& video': { position: 'absolute', left: 0 } }}
            ></DialogContent>

            <DialogActions>
                <Button autoFocus onClick={() => setOpen(false)}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    </>
}
