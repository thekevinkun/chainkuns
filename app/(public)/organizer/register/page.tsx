import type { Metadata } from "next";
import { OrganizerRegisterForm } from "@/components/organizer";

export const metadata: Metadata = {
  title: "Become an Organizer — Chainkuns",
  robots: { index: false, follow: false },
};

export default function OrganizerRegisterPage() {
  return <OrganizerRegisterForm />;
}
