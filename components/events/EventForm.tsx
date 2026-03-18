"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePublicClient, useWalletClient } from "wagmi";
import { parseEther } from "viem";
import { createEvent, updateEventContract } from "@/app/actions/event";
import { generateEventDescription } from "@/app/actions/ai";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Card, { CardBody } from "@/components/ui/Card";

import type { EventFormState } from "@/types";
import { CONTRACT_ABI, CONTRACT_BYTECODE } from "@/lib/web3/contract";
import {
  uploadImage,
  validateImageFile,
  deleteImage,
  extractFilePathFromUrl,
} from "@/lib/supabase/upload";

const EventForm = () => {
  const router = useRouter(); // for redirecting after creation
  const publicClient = usePublicClient(); // reads blockchain state
  const { data: walletClient } = useWalletClient(); // signs + sends transactions

  // ── Form Data ──
  const [formData, setFormData] = useState<EventFormState>({
    title: "",
    description: "",
    venue: "",
    event_date: "",
    total_supply: "",
    ticket_price_eth: "",
    royalty_percent: "",
    banner_image_url: null,
  });

  // ── Banner Image ──
  const [bannerFile, setBannerFile] = useState<File | null>(null); // raw file from input
  const [bannerPreview, setBannerPreview] = useState<string | null>(null); // local preview URL

  // ── UI State ──
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}); // per-field Zod errors
  const [globalError, setGlobalError] = useState<string | null>(null); // form-level error message
  const [isSubmitting, setIsSubmitting] = useState(false); // true while form is submitting
  const [isGeneratingAI, setIsGeneratingAI] = useState(false); // true while AI is generating
  const [submitStep, setSubmitStep] = useState<string | null>(null); // shows current step e.g. "Uploading banner..."

  // ── Handlers ──

  // Handles banner image file selection
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // get the selected file
    if (!file) return;

    // Validate file type + size before accepting
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setGlobalError(validation.error ?? "Invalid file.");
      return;
    }

    // If there's already an uploaded banner, delete it from storage first
    if (formData.banner_image_url) {
      const filePath = extractFilePathFromUrl(
        formData.banner_image_url,
        "banners",
      );
      if (filePath) {
        deleteImage("banners", filePath); // fire and forget — no need to await
      }
    }

    setBannerFile(file); // store the raw file for upload on submit
    setBannerPreview(URL.createObjectURL(file)); // create local preview URL
    setGlobalError(null); // clear any previous errors
  };

  // Handles AI description generation
  const handleGenerateAI = async () => {
    setIsGeneratingAI(true); // show loading state on AI button
    setGlobalError(null);

    // Call the AI server action with current form values
    const result = await generateEventDescription({
      title: formData.title,
      venue: formData.venue,
      date: formData.event_date,
    });

    if (result.success) {
      // Fill the description field with AI output
      setFormData((prev) => ({ ...prev, description: result.description }));
    } else {
      setGlobalError(result.error); // show error if AI failed
    }

    setIsGeneratingAI(false); // hide loading state
  };

  // Handles form submission — the main flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent default browser form submit
    setIsSubmitting(true);
    setFieldErrors({}); // clear previous field errors
    setGlobalError(null);

    try {
      // ── STEP 1: Upload banner image if selected ──
      let banner_image_url = formData.banner_image_url; // use existing URL if no new file

      if (bannerFile) {
        setSubmitStep("Uploading banner image..."); // update UI step indicator
        banner_image_url = await uploadImage("banners", bannerFile, "events");
        if (!banner_image_url) {
          setGlobalError("Failed to upload banner image. Please try again.");
          setIsSubmitting(false);
          setSubmitStep(null);
          return;
        }
      }

      console.log("total_supply raw:", formData.total_supply);
      console.log("total_supply parsed:", parseInt(formData.total_supply));

      // ── STEP 2: Save event to Supabase via Server Action ──
      setSubmitStep("Saving event details...");
      const eventResult = await createEvent({
        ...formData,
        banner_image_url,
        // convert empty strings to proper numbers for Zod validation
        ticket_price_eth: parseFloat(formData.ticket_price_eth),
        total_supply: parseInt(formData.total_supply),
        royalty_percent: parseFloat(formData.royalty_percent),
        event_date: new Date(formData.event_date).toISOString(), // convert to ISO string for Zod validation
      });

      if (!eventResult.success) {
        setGlobalError(eventResult.error);
        setIsSubmitting(false);
        setSubmitStep(null);
        return;
      }

      // ── STEP 3: Deploy EventTicket.sol contract via MetaMask ──
      setSubmitStep("Deploying smart contract... Please confirm in MetaMask.");

      if (!walletClient || !publicClient) {
        setGlobalError("Wallet not connected. Please connect your wallet.");
        setIsSubmitting(false);
        setSubmitStep(null);
        return;
      }

      // Deploy the contract — MetaMask will pop up asking for confirmation
      const hash = await walletClient.deployContract({
        abi: CONTRACT_ABI, // our EventTicket ABI
        bytecode: CONTRACT_BYTECODE, // compiled contract bytecode
        args: [
          formData.title, // NFT collection name
          formData.title.slice(0, 4).toUpperCase(), // symbol — first 4 chars e.g. "EAST"
          parseEther(String(formData.ticket_price_eth)), // ticketPrice in wei
          BigInt(Number(formData.total_supply)), // maxSupply
          BigInt(Number(formData.royalty_percent)), // royaltyPercent
          walletClient.account.address, // organizer wallet
        ],
      });

      // ── STEP 4: Wait for contract to be mined ──
      setSubmitStep("Waiting for transaction to confirm...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Get the deployed contract address from the receipt
      const contractAddress = receipt.contractAddress;
      if (!contractAddress) {
        setGlobalError("Contract deployment failed. Please try again.");
        setIsSubmitting(false);
        setSubmitStep(null);
        return;
      }

      // ── STEP 5: Save contract address to Supabase ──
      setSubmitStep("Saving contract address...");
      const updateResult = await updateEventContract(
        eventResult.eventId, // the event we just created
        contractAddress, // the deployed contract address
      );

      if (!updateResult.success) {
        setGlobalError(updateResult.error);
        setIsSubmitting(false);
        setSubmitStep(null);
        return;
      }

      // ── STEP 6: Redirect to manage page ──
      router.push(`/events/${eventResult.eventId}/manage`);
    } catch (error) {
      console.error("Event creation error:", error);
      setGlobalError("Something went wrong. Please try again.");
      setIsSubmitting(false);
      setSubmitStep(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* ── Page Header ── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-text-secondary">
          Fill in the details below. You'll confirm a MetaMask transaction to
          deploy your event contract.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section 1: Basic Info ── */}
        <Card>
          <CardBody className="space-y-5">
            <h2 className="font-semibold text-text-primary">Basic Info</h2>

            {/* Event Title */}
            <Input
              label="Event Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g. East Borneo Music Festival 2026"
              error={fieldErrors.title}
              required
            />

            {/* Venue */}
            <Input
              label="Venue"
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
              placeholder="e.g. Balikpapan Sports Arena"
              error={fieldErrors.venue}
              required
            />

            {/* Event Date */}
            <Input
              label="Event Date & Time"
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) =>
                setFormData({ ...formData, event_date: e.target.value })
              }
              error={fieldErrors.event_date}
              required
            />
          </CardBody>
        </Card>

        {/* ── Section 2: Description + AI ── */}
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">Description</h2>
              {/* AI Generate button — only enabled if title + venue + date are filled */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateAI}
                disabled={
                  isGeneratingAI ||
                  !formData.title ||
                  !formData.venue ||
                  !formData.event_date
                }
                isLoading={isGeneratingAI}
              >
                ✨ Generate with AI
              </Button>
            </div>

            <Textarea
              label=""
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your event... or use AI to generate one above."
              error={fieldErrors.description}
              helperText="Min 20 characters. Max 5000."
              required
            />
          </CardBody>
        </Card>

        {/* ── Section 3: Ticket Settings ── */}
        <Card>
          <CardBody className="space-y-5">
            <h2 className="font-semibold text-text-primary">Ticket Settings</h2>

            {/* Total Supply */}
            <Input
              label="Total Tickets"
              type="number"
              value={formData.total_supply ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total_supply: e.target.value, // just store the string as-is
                })
              }
              placeholder="e.g. 500"
              error={fieldErrors.total_supply}
              helperText="Max 10,000 tickets per event."
              min={1}
              max={10000}
              required
            />

            {/* Ticket Price */}
            <Input
              label="Ticket Price (ETH)"
              type="number"
              value={formData.ticket_price_eth ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ticket_price_eth: e.target.value, // just store the string as-is
                })
              }
              placeholder="e.g. 0.05"
              error={fieldErrors.ticket_price_eth}
              helperText="Price per ticket in ETH."
              min={0}
              step={0.001}
              required
            />

            {/* Royalty Percent */}
            <Input
              label="Resale Royalty (%)"
              type="number"
              value={formData.royalty_percent ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  royalty_percent: e.target.value, // just store the string as-is
                })
              }
              placeholder="e.g. 5"
              error={fieldErrors.royalty_percent}
              helperText="% you earn on every resale. Max 10%."
              min={0}
              max={10}
              step={0.1}
              required
            />
          </CardBody>
        </Card>

        {/* ── Section 4: Banner Image ── */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-semibold text-text-primary">
              Banner Image{" "}
              <span className="text-text-secondary font-normal">
                (optional)
              </span>
            </h2>

            {/* Preview — shows after file is selected */}
            {bannerPreview && (
              <div className="relative w-full h-52 rounded-lg overflow-hidden">
                <Image
                  src={bannerPreview}
                  alt="Banner preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}

            {/* File input */}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleBannerChange}
              className="input-base text-sm"
            />
            <p className="text-xs text-text-secondary">
              JPG, PNG, WebP recommended. 16:9 ratio (1280×720 minimum). Max
              5MB.
            </p>
          </CardBody>
        </Card>

        {/* ── Global Error ── */}
        {globalError && <p className="text-sm text-error">{globalError}</p>}

        {/* ── Submit Step Indicator ── */}
        {submitStep && <p className="text-sm text-accent-cyan">{submitStep}</p>}

        {/* ── Submit Button ── */}
        <Button
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="w-full"
        >
          Create Event & Deploy Contract
        </Button>
      </form>
    </div>
  );
};

export default EventForm;
