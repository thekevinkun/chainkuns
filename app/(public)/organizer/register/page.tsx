import type { Metadata } from "next";
import { OrganizerRegisterForm } from "@/components/organizer";

export const metadata: Metadata = {
  title: "Become an Organizer",
  robots: { index: false, follow: false },
};

export default function OrganizerRegisterPage() {
  return <OrganizerRegisterForm />;
}
