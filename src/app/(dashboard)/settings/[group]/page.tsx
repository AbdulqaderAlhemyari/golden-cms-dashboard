import { notFound } from "next/navigation";
import { SettingsGroupView } from "@/components/settings/SettingsGroupView";
import {
  settingsGroups,
  type SettingsGroup,
} from "@/lib/nav";

type PageProps = {
  params: Promise<{ group: string }>;
};

export default async function SettingsGroupPage({ params }: PageProps) {
  const { group } = await params;

  if (!settingsGroups.includes(group as SettingsGroup)) {
    notFound();
  }

  return <SettingsGroupView group={group as SettingsGroup} />;
}
