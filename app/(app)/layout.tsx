import { Sidebar } from "@/components/ui/Sidebar";
import { getProfile, isAdmin } from "@/lib/profile";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <div className="min-h-screen">
      <div className="bg-blobs" />
      <div className="flex gap-5 max-w-[1400px] mx-auto p-5">
        <Sidebar isAdmin={isAdmin(profile)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
