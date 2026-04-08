import { useState } from "react";
import { Languages, LayoutDashboard, LogOut, Menu, Moon, Settings, ShieldCheck, Sun, Users, X } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/modules/shared/context/language-context";
import { useTheme } from "@/modules/shared/context/theme-context";
import { usePwaInstallPrompt } from "@/modules/shared/hooks/use-pwa-install-prompt";
import type { AuthUser } from "@/modules/shared/types/domain";

interface AdminLayoutProps {
  user: AuthUser;
  onLogout: () => Promise<void>;
}

const navItems = [
  { to: "/", label: "dashboard", icon: LayoutDashboard },
  { to: "/organizers", label: "organizers", icon: Users },
  { to: "/pricing", label: "pricing", icon: Settings }
] as const;

export const AdminLayout = ({ user, onLogout }: AdminLayoutProps) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [installLoading, setInstallLoading] = useState(false);

  const { canInstall, installDialogOpen, isInstalled, openInstallDialog, promptInstall, setInstallDialogOpen } =
    usePwaInstallPrompt();

  const closeMobile = () => setMobileOpen(false);
  const openLogoutDialog = () => {
    closeMobile();
    setLogoutOpen(true);
  };

  const profileEmail = user.email || "admin@schoolmeal.tn.gov";
  const profileInitial = (user.name?.trim().charAt(0) || "U").toUpperCase();

  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await onLogout();
      setLogoutOpen(false);
      closeMobile();
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleInstall = async () => {
    setInstallLoading(true);
    try {
      await promptInstall();
    } finally {
      setInstallLoading(false);
    }
  };

  return (
    <>
      <div className="h-screen overflow-hidden md:grid md:grid-cols-[280px_minmax(0,1fr)]">
        <div
          className={[
            "fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 md:hidden",
            mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          ].join(" ")}
          aria-hidden={!mobileOpen}
          onClick={closeMobile}
        />

        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-hidden border-r bg-card/95 p-4 backdrop-blur will-change-transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:w-auto md:translate-x-0 md:bg-card/90",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          ].join(" ")}
        >
          <div className="mb-4 flex items-center justify-between md:hidden">
            <p className="text-sm font-semibold">{t("menu")}</p>
            <Button variant="outline" size="icon" onClick={closeMobile}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Link to="/" className="rounded-xl border bg-background p-4" onClick={closeMobile}>
            <div className="flex items-center gap-3">
              <img
                src="/tn-nmo-logo.png"
                alt="TN NMO logo"
                className="h-10 w-10 shrink-0 rounded-lg border bg-white/80 object-cover p-1"
              />
              <div>
                <p className="text-xs uppercase text-muted-foreground">{t("stateAdmin")}</p>
                <p className="font-semibold leading-tight">TN NMO</p>
              </div>
            </div>
          </Link>

          <div className="mt-4 border-t" />
          <nav className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    [
                      "flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium",
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {t(item.label)}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 border-t pt-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setLanguage(language === "en" ? "ta" : "en")}
            >
              <Languages className="h-4 w-4" />
              {language === "en" ? "தமிழ்" : "English"}
            </Button>

            <Button variant="outline" className="w-full justify-start gap-2" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light Theme" : "Dark Theme"}
            </Button>

            <Button variant="destructive" className="w-full justify-start" onClick={openLogoutDialog}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </Button>

            <div className="rounded-xl border bg-background p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{profileEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="h-screen min-w-0 overflow-y-auto overflow-x-hidden">
          <header className="sticky top-0 z-20 border-b bg-background/90 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="md:hidden" onClick={() => setMobileOpen((prev) => !prev)}>
                  <Menu className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={openInstallDialog}
                  className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-accent/60"
                  aria-label="Open app install options"
                >
                  <span className="h-8 w-8 overflow-hidden rounded-full border bg-white/90">
                    <img src="/tn-nmo-logo.png" alt="TN NMO app" className="h-full w-full object-cover" />
                  </span>
                  <p className="text-sm font-bold tracking-wide text-primary">TN NMO</p>
                </button>
              </div>

              <div className="flex min-w-0 items-center">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {profileInitial}
                </div>
              </div>
            </div>
          </header>

          <main className="container max-w-7xl overflow-x-hidden py-4 sm:py-6">
            <Outlet />
          </main>
        </div>
      </div>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="w-[calc(100vw-24px)] max-h-[calc(100svh-24px)] max-w-[calc(100vw-24px)] overflow-y-auto sm:w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{language === "ta" ? "வெளியேற உறுதிப்படுத்தவும்" : "Confirm Logout"}</DialogTitle>
            <DialogDescription>
              {language === "ta" ? "நீங்கள் வெளியேற விரும்புகிறீர்களா?" : "Are you sure you want to log out?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              {language === "ta" ? "ரத்து செய்" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={confirmLogout} disabled={logoutLoading}>
              {logoutLoading ? (language === "ta" ? "தயவு செய்து காத்திருக்கவும்..." : "Please wait...") : t("logout")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
        <DialogContent className="w-[calc(100vw-24px)] max-h-[calc(100svh-24px)] max-w-[calc(100vw-24px)] overflow-y-auto sm:w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{language === "ta" ? "ஆப் நிறுவல்" : "App Installation"}</DialogTitle>
            <DialogDescription>
              {isInstalled
                ? language === "ta"
                  ? "இந்த ஆப் ஏற்கனவே நிறுவப்பட்டுள்ளது."
                  : "This app is already installed on your device."
                : canInstall
                  ? language === "ta"
                    ? "இந்த ஆப்பை முகப்பு திரையில் சேர்க்கலாம்."
                    : "You can add this app to your home screen."
                  : language === "ta"
                    ? "இந்த உலாவியில் நேரடி நிறுவல் இல்லை. உலாவி பட்டியலில் Add to Home Screen தேர்வு செய்யவும்."
                    : "Direct install is not available in this browser. Use your browser menu and choose Add to Home Screen."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setInstallDialogOpen(false)}>
              {language === "ta" ? "மூடு" : "Close"}
            </Button>
            {canInstall ? (
              <Button onClick={handleInstall} disabled={installLoading}>
                {installLoading
                  ? language === "ta"
                    ? "தயவு செய்து காத்திருக்கவும்..."
                    : "Please wait..."
                  : language === "ta"
                    ? "முகப்பில் சேர்"
                    : "Add to Home Screen"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

