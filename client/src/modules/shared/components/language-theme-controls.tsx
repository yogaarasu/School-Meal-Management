import { Languages, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/modules/shared/context/language-context";
import { useTheme } from "@/modules/shared/context/theme-context";

export const LanguageThemeControls = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setLanguage(language === "en" ? "ta" : "en")}
        className="gap-2"
        aria-label="Toggle language"
      >
        <Languages className="h-4 w-4" />
        {language === "en" ? "Tamil" : "English"}
      </Button>
    </div>
  );
};
