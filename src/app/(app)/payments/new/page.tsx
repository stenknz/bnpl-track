import { PaymentForm } from "@/components/PaymentForm";

export default function NewPaymentPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold dark:text-brand-100">New Payment Plan</h1>
      <PaymentForm />
    </div>
  );
}
