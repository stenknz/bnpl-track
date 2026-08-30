import { Sidebar } from "@/components/Sidebar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const settings = await prisma.appSetting.findUnique({ where: { id: "site" } });

  return (
    <div className="flex min-h-screen bg-[#FAF6F0] dark:bg-[#120C08]">
      <Sidebar logoPath={settings?.logoPath} />
      <main className="flex-1 overflow-auto bg-[#FAF6F0] dark:bg-[#120C08]">
        {children}
      </main>
    </div>
  );
}
