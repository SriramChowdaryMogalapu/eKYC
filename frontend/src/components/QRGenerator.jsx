import { QRCodeCanvas } from 'qrcode.react';

function QRGenerator({ verificationId }) {
    const verificationLink = `http://localhost:3000/verify/${verificationId}`;

    return (
        <div>
            <h3>Scan this QR Code</h3>
            <QRCodeCanvas value={verificationLink} size={256} />
        </div>
    );
}

export default QRGenerator;
