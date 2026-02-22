import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

type Language = 'en' | 'ar';

const translations = {
    en: {
        appTitle: "Workspace Command Center",
        appSubtitle: "Data Persistence | i18n",
        switchLang: "🌐 Switch to Arabic (AR)",
        navDashboard: "Dashboard",
        navProjects: "Projects",
        navChecker: "Tasks (Checker)",
        navIDE: "Development Environment",
        navDevEnv: "Development Environment", // Added
        navProfile: "Profile",
        navSettings: "Settings",
        systemUser: "System Admin", // Added
        greetingHeading: "Welcome, System Admin 👾",
        greetingSub: "Command Center Analytics Live.",
        levelLabel: "Level 24",
        levelSub: "Remaining for next level: 450 XP",
        totalXp: "Total Earned Points",
        streakLabel: "14 Days",
        streakSub: "Consecutive Coding Streak",
        sprintsDeployments: "Sprints & Deployments",
        newSprintTitle: "New Sprint Title...",
        initProject: "+ Initialize Project",
        projectNomen: "Project Title",
        dirMount: "Directory Mount",
        commitOrigin: "Commit Origin",
        close: "Close",
        projectEndsIn: "Ends in: 12 hours",
        activeProjects: "Active Projects",
        tasksValidated: "Tasks Validated",
        noProjects: "No active projects in this sprint.",
        noSprints: "No Sprints Found - Inject Macro Payload to Begin",
        abortTelemetry: "⟵ Abort to Dashboard",
        sequenceProgress: "Sequence Progress",
        completedSuffix: "Completed",
        tasksTitle: "Evaluation Tasks (Auto-Checker)",
        mandatoryLabel: "Mandatory",
        advancedLabel: "Advanced",
        globalHeuristics: "Global Constraints",
        flags: "Flags",
        restrictedDomains: "Forbidden Functions",
        enforcedParadigms: "Enforced Paradigms",
        missionObjectives: "Mission Objectives",
        whitelistedSyscalls: "Whitelisted Syscalls",
        sourceOrigin: "Source Code",
        expectedTelemetry: "Expected Output",
        noObjectives: "No Mission Objectives Detected.",
        terminateUplink: "[-] Terminate Uplink",
        establishUplink: "[+] Establish Bulk JSON Uplink",
        loading: "Loading Holographic Interface...",
        errorFetch: "[ERROR] Core systems offline. Fetch failed.",
        noneSet: "None Set"
    },
    ar: {
        appTitle: "مركز قيادة مساحة العمل",
        appSubtitle: "حفظ البيانات | تعدد اللغات",
        switchLang: "🌐 التبديل إلى الإنجليزية (EN)",
        navDashboard: "لوحة القيادة",
        navProjects: "المشاريع",
        navChecker: "المهام (Checker)",
        navIDE: "بيئة التطوير",
        navDevEnv: "بيئة التطوير", // Added
        navProfile: "الملف الشخصي",
        navSettings: "الإعدادات",
        systemUser: "مدير النظام", // Added
        greetingHeading: "مرحباً، مدير النظام 👾",
        greetingSub: "مركز القيادة فعال وقيد التشغيل.",
        levelLabel: "المستوى 24",
        levelSub: "المتبقي للمستوى القادم: 450 XP",
        totalXp: "إجمالي النقاط المكتسبة",
        streakLabel: "14 يوم",
        streakSub: "سلسلة البرمجة المتتالية (Streak)",
        sprintsDeployments: "السباقات والنشر",
        newSprintTitle: "عنوان السباق الجديد...",
        initProject: "+ بدء المشروع",
        projectNomen: "اسم المشروع",
        dirMount: "مسار التثبيت",
        commitOrigin: "تأكيد المصدر",
        close: "إغلاق",
        projectEndsIn: "ينتهي في: 12 ساعة",
        activeProjects: "المشاريع النشطة",
        tasksValidated: "المهام المعتمدة",
        noProjects: "لا توجد مشاريع نشطة حاليا.",
        noSprints: "لم يتم العثور على سباقات - قم بحقن بيانات للبدء",
        abortTelemetry: "⟵ العودة للوحة القيادة",
        sequenceProgress: "تقدم التسلسل",
        completedSuffix: "مكتمل",
        tasksTitle: "مهام التقييم (Auto-Checker)",
        mandatoryLabel: "إلزامي",
        advancedLabel: "متقدم",
        globalHeuristics: "القيود العامة",
        flags: "الإشارات",
        restrictedDomains: "الدوال الممنوعة",
        enforcedParadigms: "النماذج المفروضة",
        missionObjectives: "أهداف المهمة",
        whitelistedSyscalls: "نداءات النظام المسموح بها",
        sourceOrigin: "مصدر الكود",
        expectedTelemetry: "المخرجات المتوقعة",
        noObjectives: "لم يتم اكتشاف أهداف مهمة.",
        terminateUplink: "[-] إنهاء الاتصال",
        establishUplink: "[+] إنشاء اتصال JSON شامل",
        loading: "جاري تحميل الواجهة الهولوغرافية...",
        errorFetch: "[خطأ] الأنظمة الأساسية غير متصلة. فشل الجلب.",
        noneSet: "غير محدد"
    }
};

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: keyof typeof translations.en) => string;
    getLocalizedText: (obj: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Defaulting to Arabic natively to match user request template priority
    const [language, setLanguage] = useState<Language>('ar');

    useEffect(() => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
    };

    const t = (key: keyof typeof translations.en) => {
        return translations[language][key] || translations.en[key] || "ERROR_MISSING_KEY";
    };

    const getLocalizedText = (obj: any) => {
        if (!obj) return "UNTITLED";
        if (typeof obj === 'string') return obj;
        return obj?.[language] || obj?.en || "UNTITLED";
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t, getLocalizedText }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
