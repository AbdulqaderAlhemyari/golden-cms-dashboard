import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppToaster } from "@/components/feedback/AppToaster";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        </div>
        <AppToaster />
      </div>
    </AuthProvider>
  );
}
