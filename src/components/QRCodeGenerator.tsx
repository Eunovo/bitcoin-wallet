import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export const QRCodeGenerator: React.FC<{ data: any }> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !data) return;

        QRCode.toCanvas(canvasRef.current, data, function (error) {
            if (error) console.error(error);
        });
    }, [data, canvasRef.current]);

    return <canvas ref={canvasRef}></canvas>
}
