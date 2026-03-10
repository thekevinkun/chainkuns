"use client";

import { QRCodeSVG } from "qrcode.react";

interface TicketQRProps {
  value: string; // the data to encode in the QR code
  size?: number; // optional size prop, defaults to 180
  level?: "L" | "M" | "Q" | "H"; // optional error correction level, defaults to "H"
}

const TicketQR = ({ value, size, level }: TicketQRProps) => {
  return <QRCodeSVG value={value} size={size} level={level} />;
};

export default TicketQR;
