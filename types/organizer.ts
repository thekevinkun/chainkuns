export type OrganizerActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export interface Application {
  id: string;
  display_name: string;
  bio: string | null;
  logo_url: string | null;
  status: string;
  created_at: string | null;
  users: { wallet_address: string } | null;
}

export interface AnalyticsCardProps {
  label: string;
  value: number;
  unit?: string;
  className?: string;
}

export interface Event {
  id: string;
  title: string;
  status: string | null;
  ticket_price_eth: number;
  total_supply: number;
  created_at: string | null;
}
