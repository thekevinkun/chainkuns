"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { registerOrganizer } from "@/app/actions/organizer";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

import {
  uploadImage,
  validateImageFile,
  extractFilePathFromUrl,
  deleteImage,
} from "@/lib/supabase/upload";

const OrganizerRegisterForm = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    logo_url: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error ?? "Invalid file.");
      return;
    }

    // If there's already an uploaded logo, delete it from storage first
    if (formData.logo_url) {
      const filePath = extractFilePathFromUrl(formData.logo_url, "logos");
      if (filePath) {
        deleteImage("logos", filePath);
      }
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let logo_url = null;

    if (logoFile) {
      logo_url = await uploadImage("logos", logoFile, "organizers");
      if (!logo_url) {
        setError("Failed to upload logo. Please try again.");
        setLoading(false);
        return;
      }
    }

    const result = await registerOrganizer({
      ...formData,
      logo_url,
    });

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  // Not logged in
  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Connect your wallet first</h1>
          <p className="text-muted-foreground">
            You need to sign in before applying as an organizer.
          </p>
        </div>
      </main>
    );
  }

  // Success state
  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-lg">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl font-bold">Application Submitted!</h1>
          <p className="text-muted-foreground">
            We'll review your application and notify you once approved.
          </p>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Become an Organizer</h1>
          <p className="text-muted-foreground">
            Fill out the form below to apply. Our team will review your
            application.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name */}
          <Input
            label="Display Name *"
            value={formData.display_name}
            onChange={(e) =>
              setFormData({ ...formData, display_name: e.target.value })
            }
            placeholder="e.g. Bangkok Music Festival"
            required
          />

          {/* Bio */}
          <Textarea
            label="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself or your organization..."
            required
          />

          {/* Logo URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Logo (optional) <span className="font-light">max. 5MB</span>
            </label>

            {logoPreview && (
              <Image
                src={logoPreview}
                alt="Logo preview"
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            )}

            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleLogoChange}
              className="input w-full"
            />
          </div>

          {/* Error */}
          {error && <p className="text-sm text-error">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
            className="w-full"
          >
            Submit Application
          </Button>
        </form>
      </div>
    </main>
  );
};

export default OrganizerRegisterForm;
