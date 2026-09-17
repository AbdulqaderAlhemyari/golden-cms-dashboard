import { notFound } from "next/navigation";
import { PageEditor } from "@/components/pages/PageEditor";
import { isRoutePageKey, routeToApiPageKey } from "@/lib/pages/types";

type PageProps = {
  params: Promise<{ pageKey: string }>;
};

export default async function PageEditorRoute({ params }: PageProps) {
  const { pageKey } = await params;

  if (!isRoutePageKey(pageKey)) {
    notFound();
  }

  return <PageEditor pageKey={routeToApiPageKey[pageKey]} />;
}
