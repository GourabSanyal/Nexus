"use client";

import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";
import { QRCodeProps } from "@/app/types/wallet/QRCodeProps";

export const QRCode = ({ value, size = 160, className }: QRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    }
  }, [value, size]);

  return <canvas ref={canvasRef} className={className} />;
};
