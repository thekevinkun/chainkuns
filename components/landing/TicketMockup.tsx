"use client";

import { QRCodeSVG } from "qrcode.react"; // generates real QR code from string data
import { MOCK_TICKET } from "@/lib/constants";

const TicketMockup = () => {
  return (
    // Outer wrapper — handles float animation + glow
    <div className="mt-14 sm:mt-12 lg:mt-0 relative w-64 animate-float">
      {/* Ambient glow behind ticket */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent-violet/30 to-accent-cyan/30 rounded-3xl blur-2xl scale-110" />

      {/* Ticket card */}
      <div className="relative bg-bg-surface border border-border rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* ── TOP: Event banner ── */}
        <div className="h-36 bg-gradient-to-br from-accent-violet/50 to-accent-cyan/30 flex flex-col items-center justify-center gap-1 px-4">
          <span className="text-3xl">🎵</span>
          <p className="text-text-primary font-display font-bold text-center text-sm leading-tight">
            {MOCK_TICKET.eventName}
          </p>
          <p className="text-text-secondary text-xs">{MOCK_TICKET.date}</p>
        </div>

        {/* ── MIDDLE: Ticket details ── */}
        <div className="px-5 pt-4 pb-2 flex flex-col gap-3">
          {/* Row: Seat + Section */}
          <div className="flex justify-between">
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-widest mb-0.5">
                Seat
              </p>
              <p className="text-text-primary font-semibold text-sm">
                {MOCK_TICKET.seat}
              </p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary text-[10px] uppercase tracking-widest mb-0.5">
                Section
              </p>
              <p className="text-text-primary font-semibold text-sm">
                {MOCK_TICKET.section}
              </p>
            </div>
          </div>

          {/* Row: Price + Token ID */}
          <div className="flex justify-between">
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-widest mb-0.5">
                Price
              </p>
              <p className="mono-text text-sm">{MOCK_TICKET.price}</p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary text-[10px] uppercase tracking-widest mb-0.5">
                Token ID
              </p>
              <p className="mono-text text-sm">{MOCK_TICKET.tokenId}</p>
            </div>
          </div>
        </div>

        {/* ── DIVIDER: Classic torn ticket edge ── */}
        <div className="relative flex items-center my-2 px-2">
          {/* Left notch */}
          <div className="w-4 h-4 rounded-full bg-bg-base border border-border -ml-6 shrink-0" />
          {/* Dashed line */}
          <div className="flex-1 border-t border-dashed border-border mx-1" />
          {/* Right notch */}
          <div className="w-4 h-4 rounded-full bg-bg-base border border-border -mr-6 shrink-0" />
        </div>

        {/* ── BOTTOM: QR Code ── */}
        <div className="flex flex-col items-center gap-2 px-5 pb-5 pt-2">
          {/* QR code wrapped in a white background so it's scannable */}
          <div className="bg-white p-2 rounded-xl">
            <QRCodeSVG
              value={MOCK_TICKET.qrData} // encodes the ticket URL
              size={96} // px size of the QR code
              bgColor="#ffffff" // white background
              fgColor="#0a0f0f" // dark dots — matches bg-base
              level="M" // error correction level (M = medium)
            />
          </div>

          {/* Scan label */}
          <p className="text-text-secondary text-[10px] uppercase tracking-widest">
            Scan at door
          </p>

          {/* NFT verified badge */}
          <div className="badge-verified text-[10px]">
            ✓ NFT Verified on Ethereum
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketMockup;
