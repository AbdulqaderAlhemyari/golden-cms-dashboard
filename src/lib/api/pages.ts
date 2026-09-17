import { apiFetch } from "@/lib/api/client";
import { useApiMock } from "@/lib/api/mock";
import type {
  ApiPageKey,
  ContentLocale,
  PageResponse,
  PageSections,
} from "@/lib/pages/types";

function emptySeo(locale: ContentLocale, title: string): PageSections["seo"] {
  const isAr = locale === "ar";
  return {
    title,
    meta_title: title,
    description: isAr ? "وصف الصفحة" : "Page description",
    image: null,
    draft: false,
  };
}

function mockSections(key: ApiPageKey, locale: ContentLocale): PageSections {
  const isAr = locale === "ar";

  if (key === "home") {
    return {
      banner: {
        title: isAr ? "الجودة التي تثق بها" : "Quality you trust",
        subtitle: isAr
          ? "حلول فحص واعتماد بمعايير عالمية"
          : "Inspection and certification solutions",
        image: null,
        buttons: [
          { label: isAr ? "خدماتنا" : "Our services", href: "/services" },
          { label: isAr ? "تواصل معنا" : "Contact us", href: "/contact" },
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
      seo: emptySeo(locale, isAr ? "الرئيسية" : "Home"),
    };
  }

  if (key === "about") {
    return {
      about_us: {
        subtitle: isAr ? "من نحن" : "About us",
        title: isAr ? "غولدن كواليتي" : "Golden Quality",
        content: isAr ? "نص تعريفي بالشركة." : "Company introduction.",
        image: null,
      },
      vision: {
        subtitle: isAr ? "رؤيتنا" : "Vision",
        icon: "star",
        content: isAr ? "نص الرؤية." : "Vision text.",
      },
      mission: {
        subtitle: isAr ? "رسالتنا" : "Mission",
        icon: "shield",
        content: isAr ? "نص الرسالة." : "Mission text.",
      },
      values: {
        subtitle: isAr ? "قيمنا" : "Values",
        title: isAr ? "ما نؤمن به" : "What we believe",
        list: [
          {
            icon: "heart",
            label: isAr ? "الجودة" : "Quality",
            description: isAr ? "وصف" : "Description",
          },
        ],
      },
      sectors: {
        enable: true,
        subtitle: isAr ? "القطاعات" : "Sectors",
        title: isAr ? "نخدم عدة قطاعات" : "Sectors we serve",
        list: [
          {
            icon: "building",
            label: isAr ? "النفط والغاز" : "Oil & Gas",
            description: "",
          },
        ],
      },
      seo: emptySeo(locale, isAr ? "من نحن" : "About"),
    };
  }

  if (key === "services_index") {
    return {
      ui: {
        know_more: isAr ? "اعرف المزيد" : "Know more",
        close: isAr ? "إغلاق" : "Close",
      },
      seo: emptySeo(locale, isAr ? "خدماتنا" : "Services"),
    };
  }

  if (key === "projects_index") {
    return {
      intro: {
        intro: isAr
          ? "تعرّف على أبرز مشاريعنا."
          : "Explore our featured projects.",
      },
      seo: emptySeo(locale, isAr ? "مشاريعنا" : "Projects"),
    };
  }

  if (key === "contact") {
    return {
      intro: {
        intro: isAr ? "يسعدنا تواصلكم معنا." : "We would love to hear from you.",
      },
      form: {
        heading: isAr ? "أرسل رسالة" : "Send a message",
        name: isAr ? "الاسم" : "Name",
        name_placeholder: isAr ? "اسمك الكامل" : "Your full name",
        email: isAr ? "البريد الإلكتروني" : "Email",
        email_placeholder: "name@example.com",
        phone: isAr ? "الهاتف" : "Phone",
        phone_placeholder: "+966…",
        subject: isAr ? "الموضوع" : "Subject",
        message: isAr ? "الرسالة" : "Message",
        submit: isAr ? "إرسال" : "Send",
        sending: isAr ? "جاري الإرسال…" : "Sending…",
        success: isAr ? "تم إرسال رسالتك." : "Message sent.",
        error: isAr ? "تعذّر الإرسال." : "Could not send.",
        success_title: isAr ? "شكراً لك" : "Thank you",
        error_title: isAr ? "حدث خطأ" : "Something went wrong",
        modal_ok: isAr ? "حسناً" : "OK",
      },
      business_hours: {
        enable: true,
        title: isAr ? "ساعات العمل" : "Business hours",
        hours: isAr ? "الأحد–الخميس ٩ص–٥م" : "Sun–Thu 9am–5pm",
      },
      seo: emptySeo(locale, isAr ? "اتصل بنا" : "Contact"),
    };
  }

  // terms
  return {
    content: {
      content: isAr
        ? "نص الشروط والسياسات يظهر هنا."
        : "Terms and policy content goes here.",
    },
    seo: emptySeo(locale, isAr ? "الشروط والسياسات" : "Terms"),
  };
}

export async function getPage(
  key: ApiPageKey,
  locale: ContentLocale = "ar",
): Promise<PageResponse> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 200));
    return { key, locale, sections: mockSections(key, locale) };
  }

  return apiFetch<PageResponse>(`/admin/pages/${key}?locale=${locale}`, {
    method: "GET",
  });
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
