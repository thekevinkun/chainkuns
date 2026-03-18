import Card from "@/components/ui/Card";
import type { AnalyticsCardProps } from "@/types/organizer";
import { cn } from "@/lib/utils/cn";

const AnalyticsCard = ({
  label,
  value,
  unit,
  className,
}: AnalyticsCardProps) => {
  return (
    <Card className={cn("p-6 space-y-2", className)}>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="text-3xl font-bold">
        {unit === "ETH" ? `${value.toFixed(4)} ETH` : value.toLocaleString()}
      </p>
    </Card>
  );
};

export default AnalyticsCard;
