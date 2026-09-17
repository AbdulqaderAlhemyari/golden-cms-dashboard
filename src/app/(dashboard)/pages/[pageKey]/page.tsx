import { notFound } from "next/navigation";
import { PageEditor } from "@/components/pages/PageEditor";
import { PlaceholderScreen } from "@/components/shell/PlaceholderScreen";
import { copy } from "@/lib/copy/ar";
import { isRoutePageKey, routeToApiPageKey } from "@/lib/pages/types";
import { getPageTitle } from "@/lib/nav";

type PageProps = {
  params: Promise<{ pageKey: string }>;
};

export default async function PageEditorRoute({ params }: PageProps) {
  const { pageKey } = await params;

  if (!isRoutePageKey(pageKey)) {
    notFound();
  }

  const apiKey = routeToApiPageKey[pageKey];

  // Phase 4: home is fully wired; other pages land in Phase 5
  if (apiKey === "home") {
    return <PageEditor pageKey="home" />;
  }

  const title = getPageTitle(`/pages/${pageKey}`);
  return (
    <PlaceholderScreen
      description={`تعديل «${title}» — ${copy.pageEditorComingSoon}`}
    />
  );
}
