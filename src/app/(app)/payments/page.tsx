import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PaymentCard } from "@/components/PaymentCard";
import { FilterBar } from "@/components/FilterBar";
import Link from "next/link";

async function getPartnerIds(userId: string): Promise<string[]> {
  const links = await prisma.partnerLink.findMany({
    where: { OR: [{ sharerId: userId }, { viewerId: userId }] },
    select: { sharerId: true, viewerId: true },
  });
  return [...new Set(links.map((l) => (l.sharerId === userId ? l.viewerId : l.sharerId)))];
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; storeId?: string; from?: string; to?: string; archived?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const params = await searchParams;

  const partnerIds = await getPartnerIds(userId);

  const where: Record<string, unknown> = {
    OR: [
      { userId },
      ...(partnerIds.length > 0
        ? [{ userId: { in: partnerIds }, visibility: "SHARED" }]
        : []),
    ],
  };
  if (params.archived === "true") {
    where.archivedAt = { not: null };
  } else {
    where.archivedAt = null;
  }
  if (params.status) where.status = params.status;
  if (params.storeId) where.storeId = params.storeId;

  const plans = await prisma.paymentPlan.findMany({
    where,
    include: {
      store: true,
      vendor: true,
      user: { select: { id: true, name: true, email: true } },
      installments: { orderBy: { dueDate: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  let filtered = plans;
  if (params.from || params.to) {
    const fromDate = params.from ? new Date(params.from) : null;
    const toDate = params.to ? new Date(params.to) : null;
    filtered = plans.filter((p) =>
      p.installments.some((i) => {
        if (fromDate && i.dueDate < fromDate) return false;
        if (toDate && i.dueDate > toDate) return false;
        return true;
      })
    );
  }

  const activePlans = filtered.filter((p) =>
    p.status !== "COMPLETED"
  );
  const completedPlans = filtered.filter((p) =>
    p.status === "COMPLETED"
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-espresso-500 dark:text-white pl-12 lg:pl-0">Payments</h1>
          <div className="flex gap-4 mt-2 text-sm overflow-x-auto">
            <Link href="/payments" className={`${!params.archived ? "text-brand-500 dark:text-brand-400 font-medium" : "text-neutral-500 hover:text-brand-500"}`}>All</Link>
            <Link href="/payments/upcoming" className="text-neutral-500 hover:text-brand-500">Upcoming</Link>
            <Link href="/payments/overdue" className="text-neutral-500 hover:text-brand-500">Overdue</Link>
            <Link href="/payments/paid" className="text-neutral-500 hover:text-brand-500">Paid</Link>
            <Link href="/payments?archived=true" className={`${params.archived === "true" ? "text-brand-500 dark:text-brand-400 font-medium" : "text-neutral-500 hover:text-brand-500"}`}>Archived</Link>
          </div>
        </div>
        <Link
          href="/payments/new"
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
        >
          + New Plan
        </Link>
      </div>

      <FilterBar />

      {activePlans.length > 0 && (
        <div>
          {completedPlans.length > 0 && (
            <h2 className="text-lg font-semibold mb-3 text-neutral-500">Active</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePlans.map((plan) => (
              <PaymentCard key={plan.id} plan={plan} currentUserId={userId} />
            ))}
          </div>
        </div>
      )}

      {completedPlans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-neutral-500 flex items-center gap-2">
            Completed
            <span className="text-xs font-normal text-neutral-400">({completedPlans.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedPlans.map((plan) => (
              <PaymentCard key={plan.id} plan={plan} currentUserId={userId} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="col-span-full text-center py-12 text-neutral-400">
          {params.archived === "true" ? "No archived plans." : "No payment plans found."}
        </div>
      )}
    </div>
  );
}
