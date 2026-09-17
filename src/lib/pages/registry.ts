import type { ComponentType } from "react";
import { SeoSection } from "@/components/pages/SeoSection";
import { AboutUsSection } from "@/components/pages/sections/AboutUsSection";
import { BusinessHoursSection } from "@/components/pages/sections/BusinessHoursSection";
import { ContactFormSection } from "@/components/pages/sections/ContactFormSection";
import { HomeBannerSection } from "@/components/pages/sections/HomeBannerSection";
import { HomeFeaturedProjectsSection } from "@/components/pages/sections/HomeFeaturedProjectsSection";
import { HomeFeaturesSection } from "@/components/pages/sections/HomeFeaturesSection";
import { HomeWhyChooseUsSection } from "@/components/pages/sections/HomeWhyChooseUsSection";
import {
  ContactIntroSection,
  ProjectsIntroSection,
} from "@/components/pages/sections/PageIntroSections";
import { SectorsSection } from "@/components/pages/sections/SectorsSection";
import { ServicesUiSection } from "@/components/pages/sections/ServicesUiSection";
import { TermsContentSection } from "@/components/pages/sections/TermsContentSection";
import { ValuesSection } from "@/components/pages/sections/ValuesSection";
import { VisionMissionSection } from "@/components/pages/sections/VisionMissionSection";
import { sectionTitles } from "@/lib/copy/sections";
import type { ApiPageKey } from "@/lib/pages/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionComponent = ComponentType<{
  value: any;
  onChange: (value: any) => void;
}>;

export type SectionDefinition = {
  key: string;
  titleAr: string;
  component: SectionComponent;
  collapsedByDefault?: boolean;
};

const seo = (
  titleAr: string,
): SectionDefinition => ({
  key: "seo",
  titleAr,
  component: SeoSection as SectionComponent,
  collapsedByDefault: true,
});

export const pageSectionRegistry: Record<ApiPageKey, SectionDefinition[]> = {
  home: [
    {
      key: "banner",
      titleAr: sectionTitles.home.banner,
      component: HomeBannerSection as SectionComponent,
    },
    {
      key: "features",
      titleAr: sectionTitles.home.features,
      component: HomeFeaturesSection as SectionComponent,
    },
    {
      key: "why_choose_us",
      titleAr: sectionTitles.home.why_choose_us,
      component: HomeWhyChooseUsSection as SectionComponent,
    },
    {
      key: "featured_projects",
      titleAr: sectionTitles.home.featured_projects,
      component: HomeFeaturedProjectsSection as SectionComponent,
    },
    seo(sectionTitles.home.seo),
  ],
  about: [
    {
      key: "about_us",
      titleAr: sectionTitles.about.about_us,
      component: AboutUsSection as SectionComponent,
    },
    {
      key: "vision",
      titleAr: sectionTitles.about.vision,
      component: VisionMissionSection as SectionComponent,
    },
    {
      key: "mission",
      titleAr: sectionTitles.about.mission,
      component: VisionMissionSection as SectionComponent,
    },
    {
      key: "values",
      titleAr: sectionTitles.about.values,
      component: ValuesSection as SectionComponent,
    },
    {
      key: "sectors",
      titleAr: sectionTitles.about.sectors,
      component: SectorsSection as SectionComponent,
    },
    seo(sectionTitles.about.seo),
  ],
  services_index: [
    {
      key: "ui",
      titleAr: sectionTitles.services_index.ui,
      component: ServicesUiSection as SectionComponent,
    },
    seo(sectionTitles.services_index.seo),
  ],
  projects_index: [
    {
      key: "intro",
      titleAr: sectionTitles.projects_index.intro,
      component: ProjectsIntroSection as SectionComponent,
    },
    seo(sectionTitles.projects_index.seo),
  ],
  contact: [
    {
      key: "intro",
      titleAr: sectionTitles.contact.intro,
      component: ContactIntroSection as SectionComponent,
    },
    {
      key: "form",
      titleAr: sectionTitles.contact.form,
      component: ContactFormSection as SectionComponent,
    },
    {
      key: "business_hours",
      titleAr: sectionTitles.contact.business_hours,
      component: BusinessHoursSection as SectionComponent,
    },
    seo(sectionTitles.contact.seo),
  ],
  terms: [
    {
      key: "content",
      titleAr: sectionTitles.terms.content,
      component: TermsContentSection as SectionComponent,
    },
    seo(sectionTitles.terms.seo),
  ],
};
