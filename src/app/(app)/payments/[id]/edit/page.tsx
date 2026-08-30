import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { PaymentForm } from "@/components/PaymentForm";

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const userId = (session.user as { id: string }).id;
  const plan = await prisma.paymentPlan.findFirst({
    where: { id, userId },
  });

  if (!plan) notFound();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold dark:text-brand-100">Edit Payment Plan</h1>
      <PaymentForm
        initialData={{
          id: plan.id,
          storeId: plan.storeId,
          vendorId: plan.vendorId,
          totalAmount: plan.totalAmount,
          installmentAmount: plan.installmentAmount,
          frequency: plan.frequency,
          startDate: plan.startDate.toISOString(),
          visibility: plan.visibility,
          title: plan.title,
          notes: plan.notes,
        }}
      />
    </div>
  );
}
