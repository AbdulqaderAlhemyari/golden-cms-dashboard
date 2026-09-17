import Link from "next/link";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PlaceholderScreen } from "@/components/shell/PlaceholderScreen";
import { copy } from "@/lib/copy/ar";

export default function ProjectsPage() {
  return (
    <PlaceholderScreen description={copy.placeholderHint}>
      <EmptyState
        message={copy.noProjects}
        action={
          <Link href="/projects/new" className="btn-primary">
            {copy.addProject}
          </Link>
        }
      />
    </PlaceholderScreen>
  );
}
