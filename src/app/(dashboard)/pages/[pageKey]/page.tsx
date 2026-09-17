import { notFound } from "next/navigation";
import { PlaceholderScreen } from "@/components/shell/PlaceholderScreen";
import { copy } from "@/lib/copy/ar";
import { getPageTitle, pageKeys, type PageKey } from "@/lib/nav";

type PageProps = {
  params: Promise<{ pageKey: string }>;
};

export default async function PageEditorPlaceholder({ params }: PageProps) {
  const { pageKey } = await params;

  if (!pageKeys.includes(pageKey as PageKey)) {
    notFound();
  }

  const title = getPageTitle(`/pages/${pageKey}`);

  return (
    <PlaceholderScreen
      description={`تعديل «${title}» — ${copy.pageEditorComingSoon}`}
    />
  );
}
