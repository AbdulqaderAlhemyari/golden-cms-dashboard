import type { ComponentType } from "react";
import { SeoSection, type SeoSectionValue } from "@/components/pages/SeoSection";
import {
  HomeBannerSection,
  type BannerSectionValue,
} from "@/components/pages/sections/HomeBannerSection";
import {
  HomeFeaturesSection,
  type FeaturesSectionValue,
} from "@/components/pages/sections/HomeFeaturesSection";
import {
  HomeFeaturedProjectsSection,
  type FeaturedProjectsValue,
} from "@/components/pages/sections/HomeFeaturedProjectsSection";
import {
  HomeWhyChooseUsSection,
  type WhyChooseUsValue,
} from "@/components/pages/sections/HomeWhyChooseUsSection";
import { sectionTitles } from "@/lib/copy/sections";
import type { ApiPageKey } from "@/lib/pages/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionComponent = ComponentType<{ value: any; onChange: (value: any) => void }>;

export type SectionDefinition = {
  key: string;
  titleAr: string;
  component: SectionComponent;
  collapsedByDefault?: boolean;
};

export const pageSectionRegistry: Partial<
  Record<ApiPageKey, SectionDefinition[]>
> = {
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
    {
      key: "seo",
      titleAr: sectionTitles.home.seo,
      component: SeoSection as SectionComponent,
      collapsedByDefault: true,
    },
  ],
};

export type {
  BannerSectionValue,
  FeaturesSectionValue,
  WhyChooseUsValue,
  FeaturedProjectsValue,
  SeoSectionValue,
};
