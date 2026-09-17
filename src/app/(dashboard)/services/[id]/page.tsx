import { ServiceEditForm } from "@/components/services/ServiceEditForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServiceEditPage({ params }: PageProps) {
  const { id } = await params;
  return <ServiceEditForm serviceId={id} />;
}
