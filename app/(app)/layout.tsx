import { Sidebar } from "@/components/ui/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="bg-blobs" />
      <div className="flex gap-5 max-w-[1400px] mx-auto p-5">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
