"use client";

import { ContactSettingsForm } from "@/components/settings/ContactSettingsForm";
import { CtaSettingsForm } from "@/components/settings/CtaSettingsForm";
import { MenuSettingsForm } from "@/components/settings/MenuSettingsForm";
import { SeoSettingsForm } from "@/components/settings/SeoSettingsForm";
import { SiteSettingsForm } from "@/components/settings/SiteSettingsForm";
import { SocialSettingsForm } from "@/components/settings/SocialSettingsForm";
import type { SettingsGroup } from "@/lib/nav";

type SettingsGroupViewProps = {
  group: SettingsGroup;
};

export function SettingsGroupView({ group }: SettingsGroupViewProps) {
  switch (group) {
    case "site":
      return <SiteSettingsForm />;
    case "contact":
      return <ContactSettingsForm />;
    case "menu":
      return <MenuSettingsForm />;
    case "social":
      return <SocialSettingsForm />;
    case "cta":
      return <CtaSettingsForm />;
    case "seo":
      return <SeoSettingsForm />;
    default:
      return null;
  }
}
