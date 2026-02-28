// Navigation links shown in the header
export const NAV_LINKS = [
  { href: '/events', label: 'Browse Events' },
  { href: '/marketplace', label: 'Marketplace' },
] as const

// Footer navigation groups and their respective links
export const FOOTER_LINKS = {
  Platform: [
    { href: "/events", label: "Browse Events" },
    { href: "/marketplace", label: "Resale Market" },
    { href: "/organizer/register", label: "Become an Organizer" },
  ],
  Learn: [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#faq", label: "FAQ" },
  ],
} as const;
