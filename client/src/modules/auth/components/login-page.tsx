import { useState } from "react";
import { Languages, Moon, ShieldCheck, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/modules/auth/context/auth-context";
import { useLanguage } from "@/modules/shared/context/language-context";
import { useTheme } from "@/modules/shared/context/theme-context";
import { resolveToastErrorMessage } from "@/lib/toast-message";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = t("invalidEmail");
    }

    if (!PASSWORD_REGEX.test(password)) {
      nextErrors.password = t("strictPasswordHint");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      toast.success(t("loginSuccess"));
      navigate("/");
    } catch (error) {
      toast.error(resolveToastErrorMessage(error, t, "loginFail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setLanguage(language === "en" ? "ta" : "en")}
          aria-label="Toggle language"
        >
          <Languages className="h-4 w-4" />
          {language === "en" ? "தமிழ்" : "English"}
        </Button>
      </div>

      <Card className="w-full max-w-md border-2 bg-card/95 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black leading-tight">{t("title")}</CardTitle>
          <CardDescription className="text-sm">{t("loginSubtitle")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@schoolmeal.tn.gov"
                autoComplete="username"
                required
              />
              {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("pleaseWait") : t("login")}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">{t("continueText")}</p>
        </CardContent>
      </Card>
    </div>
  );
};



