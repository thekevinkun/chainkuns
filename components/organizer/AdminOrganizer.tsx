import { OrganizerApprovalCard } from "@/components/organizer";
import type { Application } from "@/types/organizer";

interface AdminOrganizersProps {
  applications: Application[];
}

const AdminOrganizers = ({ applications }: AdminOrganizersProps) => {
  // Empty state
  if (applications.length === 0) {
    return (
      <main className="min-h-screen">
        <section className="border-b border-border bg-bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-cyan">
                Admin
              </span>
              <h1 className="section-heading text-text-primary">
                Organizer Applications
              </h1>
              <p className="text-text-secondary max-w-xl">
                Review and approve organizer applications.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="text-6xl">✅</span>
            <h3 className="font-display font-bold text-text-primary text-xl">
              No Pending Applications
            </h3>
            <p className="text-text-secondary text-sm">You're all caught up!</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Page header */}
      <section className="border-b border-border bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-3">
            {/* Badge */}
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-cyan">
              Admin
            </span>

            <h1 className="section-heading text-text-primary">
              Organizer Applications
            </h1>

            <p className="text-text-secondary max-w-xl">
              {applications.length} pending application
              {applications.length !== 1 ? "s" : ""} — review and approve
              organizers to let them create events.
            </p>
          </div>
        </div>
      </section>

      {/* Applications list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        {applications.map((application) => (
          <OrganizerApprovalCard
            key={application.id}
            application={application}
          />
        ))}
      </section>
    </main>
  );
};

export default AdminOrganizers;
