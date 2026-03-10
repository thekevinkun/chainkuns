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
import jsQR from "jsqr"; // reads QR codes from image pixel data
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ABI } from "@/lib/web3/contract"; // contract ABI
import { validateTicket } from "@/app/actions/ticket"; // Server Action — mirrors to Supabase

// Shape of data encoded in the QR code
interface QRData {
  tokenId: number; // NFT token ID on-chain
  contractAddress: string; // the event's contract address
}

// Possible states for the scanner UI
type ScanState =
  | "idle" // waiting for user to start
  | "scanning" // camera open, looking for QR
  | "confirming" // found QR, sending blockchain tx
  | "success" // ticket validated
  | "error"; // something went wrong

const QRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null); // camera video stream
  const canvasRef = useRef<HTMLCanvasElement>(null); // hidden canvas for pixel analysis
  const streamRef = useRef<MediaStream | null>(null); // camera stream reference for cleanup
  const rafRef = useRef<number>(0); // requestAnimationFrame handle for cleanup

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scannedData, setScannedData] = useState<QRData | null>(null); // parsed QR data
  const [errorMessage, setErrorMessage] = useState<string>("");

  // wagmi — calls useTicket() on the contract
  const { writeContract, data: txHash, isPending } = useWriteContract();

  // wagmi — waits for blockchain confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  // ── Start camera ──
  const startCamera = async () => {
    setErrorMessage("");
    setScanState("scanning");

    try {
      // Request camera access — prefer back camera on mobile (better for scanning)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // environment = back camera
      });

      streamRef.current = stream; // save for cleanup

      // Attach stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        scanFrame(); // start scanning frames
      }
    } catch (err) {
      setScanState("error");
      setErrorMessage("Camera access denied. Please allow camera permissions.");
      console.error("[QRScanner] Camera error:", err);
    }
  };

  // ── Stop camera ──
  const stopCamera = useCallback(() => {
    // Cancel the animation frame loop
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Stop all camera tracks — releases the camera
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // ── Scan each frame for a QR code ──
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the hidden canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the pixel data — jsQR needs this to find the QR code
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Try to find a QR code in this frame
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      // Found a QR code — stop scanning
      stopCamera();

      try {
        // Parse the JSON encoded in the QR: { tokenId, contractAddress }
        const parsed = JSON.parse(code.data) as QRData;

        if (parsed.tokenId === undefined || parsed.tokenId === null || !parsed.contractAddress) {
          throw new Error("Invalid QR code format");
        }

        setScannedData(parsed);
        setScanState("confirming");
        handleValidate(parsed); // trigger blockchain validation
      } catch {
        setScanState("error");
        setErrorMessage("Invalid QR code. This is not a Chainkuns ticket.");
      }
      return;
    }

    // No QR found yet — check the next frame
    rafRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  // ── Validate ticket on blockchain + Supabase ──
  const handleValidate = (data: QRData) => {
    try {
      // Step 1 — call useTicket() on the blockchain (permanent, trustless)
      // This marks the ticket as used on-chain — cannot be reversed
      writeContract({
        address: data.contractAddress as `0x${string}`, // the event's contract
        abi: CONTRACT_ABI,
        functionName: "useTicket", // marks ticket as used
        args: [BigInt(data.tokenId)], // which token to mark
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
      // Step 2 — mirror to Supabase so TicketSalesTable shows it as used
      validateTicket({
        token_id: scannedData.tokenId,
        contract_address: scannedData.contractAddress,
      }).then((result) => {
        if (result.success) {
          setScanState("success");
        } else {
          setScanState("error");
          setErrorMessage(
            result.error ?? "Failed to update ticket in database.",
          );
        }
      });
    }
  }, [isConfirmed, scannedData]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => stopCamera(); // stop camera when component unmounts
  }, [stopCamera]);

  // ── Reset to scan another ticket ──
  const handleReset = () => {
    setScannedData(null);
    setErrorMessage("");
    setScanState("idle");
  };

  // ── Render ──
  return (
    <div className="card-surface p-6 flex flex-col gap-5">
      <h3 className="font-display font-bold text-text-primary text-lg">
        Scan Ticket QR Code
      </h3>

      {/* IDLE — show start button */}
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

      {/* SCANNING — show live camera feed */}
      {scanState === "scanning" && (
        <div className="flex flex-col gap-4">
          <div className="relative rounded-xl overflow-hidden bg-bg-base aspect-video">
            {/* Live camera video */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline // required on iOS to prevent fullscreen
              muted // muted is required for autoplay
            />
            {/* Scanning overlay — shows a targeting frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-accent-cyan rounded-xl opacity-70" />
            </div>
            {/* Scanning indicator */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="bg-bg-base/80 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-accent-cyan text-xs font-semibold animate-pulse">
                  Scanning...
                </span>
              </div>
            </div>
          </div>

          {/* Hidden canvas — jsQR reads pixels from here */}
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

      {/* CONFIRMING — waiting for blockchain */}
      {(scanState === "confirming" || isPending || isConfirming) && (
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

      {/* SUCCESS — ticket validated */}
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

      {/* ERROR — something went wrong */}
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
