export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-espresso-500 dark:bg-[#120C08] p-4">
      {children}
    </div>
  );
}
