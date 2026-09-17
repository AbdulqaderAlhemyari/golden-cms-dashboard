import Link from "next/link";
import { copy } from "@/lib/copy/ar";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectEditPlaceholder({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col items-start gap-4 p-6 md:p-8">
      <p className="text-base text-muted">{copy.projectEditComingSoon}</p>
      <p className="text-sm text-muted">#{id}</p>
      <Link href="/projects" className="btn-secondary">
        {copy.nav.projects}
      </Link>
    </div>
  );
}
