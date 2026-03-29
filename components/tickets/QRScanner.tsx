// ============================================
// QRScanner Component — Chainkuns
// Used by organizers at the door to scan tickets
// Opens the device camera, reads the QR code,
// calls useTicket() on blockchain, then mirrors to Supabase
// QR code encodes: { tokenId, contractAddress }
// ============================================
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ABI } from "@/lib/web3/contract";
import { validateTicket, preValidateTicket } from "@/app/actions/ticket";

interface QRData {
  tokenId: number;
  contractAddress: string;
}

type ScanState =
  | "idle"
  | "scanning"
  | "validating"
  | "confirming"
  | "success"
  | "error";

const QRScanner = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scannedData, setScannedData] = useState<QRData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    writeContract,
    data: txHash,
    isPending,
    isError: isTxError,
    error: txError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // ── Handle transaction errors from wagmi ──
  useEffect(() => {
    if (isTxError && txError) {
      setScanState("error");
      setErrorMessage(
        txError.message.includes("User rejected")
          ? "Transaction cancelled in MetaMask."
          : "Blockchain transaction failed. Please try again.",
      );
    }
  }, [isTxError, txError]);

  // ── Handle receipt errors (gas too high, etc.) ──
  useEffect(() => {
    if (isReceiptError) {
      setScanState("error");
      setErrorMessage("Transaction failed on-chain. Please try again.");
    }
  }, [isReceiptError]);

  const startCamera = async () => {
    setErrorMessage("");
    setScanState("scanning");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        scanFrame();
      }
    } catch (err) {
      setScanState("error");
      setErrorMessage("Camera access denied. Please allow camera permissions.");
      console.error("[QRScanner] Camera error:", err);
    }
  };

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      stopCamera();

      try {
        const parsed = JSON.parse(code.data) as QRData;
        if (
          parsed.tokenId === undefined ||
          parsed.tokenId === null ||
          !parsed.contractAddress
        ) {
          throw new Error("Invalid QR code format");
        }
        setScannedData(parsed);
        handlePreValidate(parsed); // pre-validate BEFORE MetaMask
      } catch {
        setScanState("error");
        setErrorMessage("Invalid QR code. This is not a Chainkuns ticket.");
      }
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  // ── Pre-validate ticket before calling MetaMask ──
  const handlePreValidate = async (data: QRData) => {
    setScanState("validating"); // show checking state

    const result = await preValidateTicket({
      token_id: data.tokenId,
      contract_address: data.contractAddress,
    });

    if (!result.success) {
      // Ticket is invalid — show error WITHOUT opening MetaMask
      setScanState("error");
      setErrorMessage(result.error);
      return;
    }

    // Ticket is valid — now open MetaMask
    setScanState("confirming");
    handleValidate(data);
  };

  const handleValidate = (data: QRData) => {
    try {
      writeContract({
        address: data.contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "useTicket",
        args: [BigInt(data.tokenId)],
      });
    } catch (err) {
      setScanState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Blockchain call failed.",
      );
    }
  };

  // ── Mirror to Supabase after blockchain confirms ──
  useEffect(() => {
    if (isConfirmed && scannedData) {
      validateTicket({
        token_id: scannedData.tokenId,
        contract_address: scannedData.contractAddress,
      }).then((result) => {
        if (result.success) {
          setScanState("success");
          router.refresh(); // refresh page to update stats immediately
        } else {
          setScanState("error");
          setErrorMessage(
            result.error ?? "Failed to update ticket in database.",
          );
        }
      });
    }
  }, [isConfirmed, scannedData, router]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleReset = () => {
    setScannedData(null);
    setErrorMessage("");
    setScanState("idle");
  };

  return (
    <div className="card-surface p-6 flex flex-col gap-5">
      <h3 className="font-display font-bold text-text-primary text-lg">
        Scan Ticket QR Code
      </h3>

      {/* IDLE */}
      {scanState === "idle" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <span className="text-5xl">📷</span>
          <p className="text-text-secondary text-sm text-center">
            Point your camera at the attendee&apos;s ticket QR code to validate
            entry.
          </p>
          <button onClick={startCamera} className="btn-primary">
            Open Camera
          </button>
        </div>
      )}

      {/* SCANNING */}
      {scanState === "scanning" && (
        <div className="flex flex-col gap-4">
          <div className="relative rounded-xl overflow-hidden bg-bg-base aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-accent-cyan rounded-xl opacity-70" />
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="bg-bg-base/80 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-accent-cyan text-xs font-semibold animate-pulse">
                  Scanning...
                </span>
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <button
            onClick={() => {
              stopCamera();
              setScanState("idle");
            }}
            className="btn-ghost"
          >
            Cancel
          </button>
        </div>
      )}

      {/* VALIDATING — checking ticket before MetaMask */}
      {scanState === "validating" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <span className="text-5xl animate-pulse">🔍</span>
          <p className="text-text-primary font-semibold">Checking ticket...</p>
          {scannedData && (
            <p className="mono-text text-sm text-text-secondary">
              Token #{scannedData.tokenId}
            </p>
          )}
        </div>
      )}

      {/* CONFIRMING — MetaMask open or waiting for blockchain */}
      {scanState === "confirming" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <span className="text-5xl animate-pulse">⛓</span>
          <p className="text-text-primary font-semibold">
            {isPending
              ? "Confirm in MetaMask..."
              : "Confirming on blockchain..."}
          </p>
          {scannedData && (
            <p className="mono-text text-sm text-text-secondary">
              Token #{scannedData.tokenId}
            </p>
          )}
        </div>
      )}

      {/* SUCCESS */}
      {scanState === "success" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <span className="text-5xl">✅</span>
          <p className="text-text-primary font-display font-bold text-xl">
            Ticket Valid!
          </p>
          {scannedData && (
            <p className="mono-text text-sm text-text-secondary">
              Token #{scannedData.tokenId} — marked as used
            </p>
          )}
          {txHash && (
            <Link
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary text-xs hover:opacity-80 transition-opacity"
            >
              View transaction ↗
            </Link>
          )}
          <button onClick={handleReset} className="btn-primary mt-2">
            Scan Next Ticket
          </button>
        </div>
      )}

      {/* ERROR */}
      {scanState === "error" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <span className="text-5xl">❌</span>
          <p className="text-text-primary font-semibold">Validation Failed</p>
          <p className="text-error text-sm text-center">{errorMessage}</p>
          <button onClick={handleReset} className="btn-primary mt-2">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
