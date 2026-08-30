import { CalendarView } from "@/components/CalendarView";

export default function CalendarPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-espresso-500 dark:text-white pl-12 lg:pl-0">Calendar</h1>
      <CalendarView />
    </div>
  );
}
