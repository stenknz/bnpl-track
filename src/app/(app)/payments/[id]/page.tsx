import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { InstallmentTimeline } from "@/components/InstallmentTimeline";
import { PlanActions } from "@/components/PlanActions";
import { formatDate } from "@/lib/formatDate";
import { SafeImage } from "@/components/SafeImage";

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const plan = await prisma.paymentPlan.findFirst({
    where: {
      id,
      OR: [
        { userId },
        {
          visibility: "SHARED",
          user: {
            OR: [
              { partnersGiven: { some: { viewerId: userId } } },
              { partnersRecv: { some: { sharerId: userId } } },
            ],
          },
        },
      ],
    },
    include: {
      store: true,
      vendor: true,
      user: { select: { id: true, name: true, email: true } },
      installments: { orderBy: { dueDate: "asc" } },
    },
  });

  if (!plan) notFound();

  const isOwner = plan.userId === userId;
  const totalPaid = plan.installments.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const progress = plan.totalAmount > 0 ? Math.round((totalPaid / plan.totalAmount) * 100) : 0;
  const allPaid = plan.installments.length > 0 && plan.installments.every((i) => i.status === "PAID");

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/payments" className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold dark:text-brand-100">Payment Details</h1>
      </div>

            <div className="ledger-card p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
            <SafeImage
              src={plan.store?.logoPath}
              alt={plan.store?.name || "Store"}
              className="w-full h-full object-contain"
              fallback={<span className="text-2xl font-bold text-brand-500">
                {(plan.store?.name || "U")[0]}
              </span>}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold dark:text-brand-100">{plan.title || plan.store?.name || "Untitled Plan"}</h2>
              <StatusBadge status={plan.status} />
              {plan.archivedAt && <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-full font-medium">Archived</span>}
              {plan.vendor?.logoPath && (
                <SafeImage src={plan.vendor.logoPath} alt={plan.vendor.name} className="h-6 w-auto" fallback={null} />
              )}
            </div>
            <p className="text-sm text-neutral-500">
              {plan.frequency.charAt(0) + plan.frequency.slice(1).toLowerCase()} payments
              &middot; Started {formatDate(plan.startDate)}
              {!isOwner && (
                 <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-500 dark:text-brand-400 text-xs font-medium">
                  Shared by {plan.user.name || plan.user.email}
                </span>
              )}
            </p>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/payments/${plan.id}/edit`}
                className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-brand-50 hover:text-brand-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <div>
            <p className="text-sm text-neutral-500">Total</p>
            <p className="text-xl font-bold dark:text-brand-100">${plan.totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Paid</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${totalPaid.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Remaining</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">${(plan.totalAmount - totalPaid).toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-neutral-500">Progress</span>
            <span className="font-medium dark:text-brand-100">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {plan.notes && (
          <div className="mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-sm text-neutral-500">{plan.notes}</p>
          </div>
        )}

        {isOwner && (
          <div className="mt-4">
            <PlanActions planId={plan.id} isArchived={!!plan.archivedAt} allPaid={allPaid} />
          </div>
        )}
      </div>

      <div className="ledger-card p-5">
        <h3 className="font-semibold mb-4 dark:text-brand-100">Installments</h3>
        <InstallmentTimeline installments={plan.installments} />
      </div>
    </div>
  );
}
