import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PaymentCard } from "@/components/PaymentCard";
import Link from "next/link";

async function getPartnerIds(userId: string): Promise<string[]> {
  const links = await prisma.partnerLink.findMany({
    where: { OR: [{ sharerId: userId }, { viewerId: userId }] },
    select: { sharerId: true, viewerId: true },
  });
  return [...new Set(links.map((l) => (l.sharerId === userId ? l.viewerId : l.sharerId)))];
}

export default async function PaidPaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const partnerIds = await getPartnerIds(userId);

  const plans = await prisma.paymentPlan.findMany({
    where: {
      OR: [
        { userId, status: { not: "CANCELLED" }, archivedAt: null },
        ...(partnerIds.length > 0
          ? [{ userId: { in: partnerIds }, visibility: "SHARED", status: { not: "CANCELLED" }, archivedAt: null }]
          : []),
      ],
    },
    include: {
      store: true,
      vendor: true,
      user: { select: { id: true, name: true, email: true } },
      installments: { orderBy: { dueDate: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const paid = plans.filter((p) =>
    p.installments.every((i) => i.status === "PAID")
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-brand-100">Paid Payments</h1>
          <div className="flex gap-4 mt-2 text-sm overflow-x-auto">
          <Link href="/payments" className="text-neutral-500 hover:text-brand-500">All</Link>
          <Link href="/payments/upcoming" className="text-neutral-500 hover:text-brand-500">Upcoming</Link>
          <Link href="/payments/overdue" className="text-neutral-500 hover:text-brand-500">Overdue</Link>
          <Link href="/payments/paid" className="text-brand-500 dark:text-brand-400 font-medium">Paid</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paid.map((plan) => (
          <PaymentCard key={plan.id} plan={plan} currentUserId={userId} />
        ))}
        {paid.length === 0 && (
          <div className="col-span-full text-center py-12 text-neutral-400">No fully paid plans yet.</div>
        )}
      </div>
    </div>
  );
}
