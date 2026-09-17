import { apiFetch } from "@/lib/api/client";
import { useApiMock } from "@/lib/api/mock";
import type {
  ApiPageKey,
  ContentLocale,
  PageResponse,
  PageSections,
} from "@/lib/pages/types";

function mockHomeSections(locale: ContentLocale): PageSections {
  const isAr = locale === "ar";
  return {
    banner: {
      title: isAr ? "الجودة التي تثق بها" : "Quality you trust",
      subtitle: isAr
        ? "حلول فحص واعتماد بمعايير عالمية"
        : "Inspection and certification solutions",
      image: null,
      buttons: [
        {
          label: isAr ? "خدماتنا" : "Our services",
          href: "/services",
        },
        {
          label: isAr ? "تواصل معنا" : "Contact us",
          href: "/contact",
        },
      ],
    },
    features: {
      sub_title: isAr ? "خدماتنا" : "Services",
      title: isAr ? "ماذا نقدّم" : "What we offer",
      description: isAr ? "ملخص سريع لخدماتنا" : "A short summary",
      list: [
        {
          icon: "check",
          title: isAr ? "الفحص" : "Inspection",
          content: isAr ? "وصف مختصر" : "Short description",
        },
      ],
    },
    why_choose_us: {
      sub_title: isAr ? "لماذا نحن" : "Why us",
      title: isAr ? "أسباب اختيار غولدن كواليتي" : "Why Golden Quality",
      list: [
        isAr ? "خبرة واسعة" : "Wide experience",
        isAr ? "معايير دقيقة" : "Precise standards",
      ],
    },
    featured_projects: {
      sub_title: isAr ? "المشاريع" : "Projects",
      title: isAr ? "مشاريع مميزة" : "Featured projects",
      view_all: isAr ? "عرض كل المشاريع" : "View all projects",
    },
    seo: {
      title: isAr ? "الرئيسية" : "Home",
      meta_title: isAr
        ? "غولدن كواليتي | الصفحة الرئيسية"
        : "Golden Quality | Home",
      description: isAr
        ? "شركة غولدن كواليتي للفحص والاعتماد"
        : "Golden Quality inspection and certification",
      image: null,
      draft: false,
    },
  };
}

export async function getPage(
  key: ApiPageKey,
  locale: ContentLocale = "ar",
): Promise<PageResponse> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 200));
    if (key === "home") {
      return { key, locale, sections: mockHomeSections(locale) };
    }
    return {
      key,
      locale,
      sections: {
        seo: {
          title: "",
          meta_title: "",
          description: "",
          image: null,
          draft: false,
        },
      },
    };
  }

  return apiFetch<PageResponse>(
    `/admin/pages/${key}?locale=${locale}`,
    { method: "GET" },
  );
}

export async function patchPage(
  key: ApiPageKey,
  body: { locale: ContentLocale; sections: PageSections },
): Promise<PageResponse> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 300));
    return { key, locale: body.locale, sections: body.sections };
  }

  return apiFetch<PageResponse>(`/admin/pages/${key}`, {
    method: "PATCH",
    body,
  });
}
