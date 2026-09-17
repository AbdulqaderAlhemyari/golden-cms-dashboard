import { AuthProvider } from "@/components/auth/AuthProvider";
import { EditorChromeProvider } from "@/components/editor/EditorChromeContext";
import { AppToaster } from "@/components/feedback/AppToaster";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { DashboardShell } from "@/components/shell/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <QueryProvider>
        <EditorChromeProvider>
          <DashboardShell>{children}</DashboardShell>
          <AppToaster />
        </EditorChromeProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
