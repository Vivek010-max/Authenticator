import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, UploadCloud, Sun, Moon } from "lucide-react";
import { useEffect, useState, forwardRef } from "react";
import Toggleswitch from "../../src/ui/ToggelSwitch"; 

const Button = forwardRef(
  (
    {
      asChild,
      children,
      className = "",
      variant = "primary",
      ...rest
    },
    ref
  ) => {
    // Choose variant styling
    let base =
      "inline-flex items-center justify-center font-semibold rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-700";
    let style = "";

    switch (variant) {
      case "primary":
        style =
          "bg-blue-700 text-white hover:bg-blue-800 shadow-sm";
        break;
      case "secondary":
        style =
          "bg-slate-100 text-slate-900 hover:bg-slate-200";
        break;
      case "outline":
        style =
          "bg-transparent border border-blue-700 text-blue-700 hover:bg-blue-50";
        break;
      case "ghost":
        style =
          "bg-transparent text-slate-700 hover:bg-slate-100";
        break;
      default:
        style =
          "bg-blue-700 text-white hover:bg-blue-800 shadow-sm";
    }

    const merged = `${base} ${style} ${className}`;

    if (asChild) {
      // For Link or other custom child
      const child = Array.isArray(children) ? children : children;
      return child && React.cloneElement(child, { className: merged, ref, ...rest });
    }
    return (
      <button ref={ref} className={merged} {...rest}>
        {children}
      </button>
    );
  }
);

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch { return 'light'; }
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  const anchor = (hash) => (location.pathname === "/" ? `#${hash}` : `/#${hash}`);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60`}>
      {/* Government identity bar */}
      <div className="h-8 border-b border-slate-200 bg-slate-100/60 text-xs text-slate-700">
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{lang === "en" ? "Government Portal" : "सरकारी पोर्टल"}</span>
            <span className="hidden sm:inline">{lang === "en" ? "Ministry of Higher Education" : "उच्च शिक्षा विभाग"}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className={`rounded px-2 py-0.5 ${lang === "en" ? "bg-blue-700/10 text-blue-700" : ""}`} onClick={() => setLang("en")}>EN</button>
            <span className="text-gray-400">|</span>
            <button className={`rounded px-2 py-0.5 ${lang === "hi" ? "bg-blue-700/10 text-blue-700" : ""}`} onClick={() => setLang("hi")}>हिं</button>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-blue-700/10 text-blue-700">
            <img src="/logo.ico" alt="logo " className="h-8 w-8 rounded-3xl" />
          </span>
          <span className="font-extrabold tracking-tight text-lg text-slate-900">Trustra</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href={anchor("features")} className="text-slate-700 hover:text-slate-900">{lang === "en" ? "Features" : "विशेषताएँ"}</a>
          <a href={anchor("how")} className="text-slate-700 hover:text-slate-900">{lang === "en" ? "How it works" : "कैसे काम करता है"}</a>
          <a href={anchor("dashboards")} className="text-slate-700 hover:text-slate-900">{lang === "en" ? "Dashboards" : "डैशबोर्ड"}</a>
          <a href={anchor("security")} className="text-slate-700 hover:text-slate-900">{lang === "en" ? "Security" : "सुरक्षा"}</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href={anchor("contact")} className="hidden sm:inline text-sm text-slate-500 hover:text-slate-900">{lang === "en" ? "Contact" : "संपर्क"}</a>
          <Button variant="ghost" className="hidden md:inline">
            <Link to="/login">{lang === "en" ? "Login" : "लॉगिन"}</Link>
          </Button>
          <Button variant="secondary" className="hidden md:inline">
            <Link to="/register">{lang === "en" ? "Register" : "रजिस्टर"}</Link>
          </Button>
          
          
          <Button variant="primary" className="md:inline-flex 
          md:ml-2 h-12 px-4 text-sm bg-blue-700 text-white hover:bg-blue-800">
            <Link to="/upload-verification"><UploadCloud className="mr-2 h-4 w-4" /> {lang === "en" ? "Verify Document" : "प्रमाणपत्र सत्यापित करें"}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
