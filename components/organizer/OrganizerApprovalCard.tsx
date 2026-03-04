"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { approveOrganizer, rejectOrganizer } from "@/app/actions/organizer";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";
import { WalletAddress } from "@/components/web3";

import { Application } from "@/types/organizer";

const OrganizerApprovalCard = ({
  application,
}: {
  application: Application;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setLoading("approve");
    setError(null);
    const result = await approveOrganizer(application.id);
    if (!result.success) setError(result.error);
    else router.refresh();
    setLoading(null);
  }

  async function handleReject() {
    setLoading("reject");
    setError(null);
    const result = await rejectOrganizer(application.id);
    if (!result.success) setError(result.error);
    else router.refresh();
    setLoading(null);
  }

  return (
    <Card className="p-0">
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left — avatar + info */}
          <div className="flex items-start gap-4">
            {application.logo_url ? (
              <Image
                src={application.logo_url}
                alt={application.display_name}
                width={90}
                height={90}
                className="rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <Avatar
                address={application.users?.wallet_address ?? "0x000"}
                size={56}
              />
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-text-primary">
                  {application.display_name}
                </h2>
                <Badge variant="pending" dot>
                  Pending
                </Badge>
              </div>
              {application.users?.wallet_address && (
                <WalletAddress address={application.users.wallet_address} />
              )}
              {application.created_at && (
                <p className="text-xs text-text-secondary">
                  Applied in{" "}
                  {new Date(application.created_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {application.bio && (
          <p className="text-sm text-text-secondary leading-relaxed border-t border-border pt-4">
            {application.bio}
          </p>
        )}

        {/* Error */}
        {error && <p className="text-sm text-error">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3 border-t border-border pt-4">
          <Button
            onClick={handleApprove}
            isLoading={loading === "approve"}
            disabled={loading !== null}
            className="flex-1"
          >
            Approve
          </Button>
          <Button
            onClick={handleReject}
            isLoading={loading === "reject"}
            disabled={loading !== null}
            variant="secondary"
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default OrganizerApprovalCard;
