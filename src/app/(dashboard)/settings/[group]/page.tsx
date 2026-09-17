import { notFound } from "next/navigation";
import { PlaceholderScreen } from "@/components/shell/PlaceholderScreen";
import { copy } from "@/lib/copy/ar";
import {
  getPageTitle,
  settingsGroups,
  type SettingsGroup,
} from "@/lib/nav";

type PageProps = {
  params: Promise<{ group: string }>;
};

export default async function SettingsPlaceholder({ params }: PageProps) {
  const { group } = await params;

  if (!settingsGroups.includes(group as SettingsGroup)) {
    notFound();
  }

  const title = getPageTitle(`/settings/${group}`);

  return (
    <PlaceholderScreen
      description={`«${title}» — ${copy.settingsComingSoon}`}
    />
  );
}
