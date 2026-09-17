import { copy } from "@/lib/copy/ar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-bold leading-relaxed text-foreground md:text-2xl">
            {copy.appTitle}
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
