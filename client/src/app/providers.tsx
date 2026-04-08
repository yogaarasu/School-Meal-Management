import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppToaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/modules/auth/context/auth-context";
import { LanguageProvider } from "@/modules/shared/context/language-context";
import { ThemeProvider } from "@/modules/shared/context/theme-context";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            {children}
            <AppToaster />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};