import { ProjectEditForm } from "@/components/projects/ProjectEditForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectEditPage({ params }: PageProps) {
  const { id } = await params;
  return <ProjectEditForm projectId={id} />;
}
