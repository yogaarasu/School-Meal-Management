import { useEffect, useState } from "react";
import { Building2, GraduationCap, School, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboard } from "@/modules/admin/api/admin-api";
import { useLanguage } from "@/modules/shared/context/language-context";
import { SCHOOL_TYPE_LABELS } from "@/modules/shared/data/constants";
import { SchoolType } from "@/modules/shared/types/domain";

export const AdminDashboardPage = () => {
  const { language, t } = useLanguage();
  const [stats, setStats] = useState({ total: 0, primary: 0, middle: 0, higher: 0 });

  useEffect(() => {
    getAdminDashboard()
      .then((response) => setStats(response.stats))
      .catch(() => setStats({ total: 0, primary: 0, middle: 0, higher: 0 }));
  }, []);

  const cards = [
    { label: t("organizers"), value: stats.total, icon: Users },
    { label: t("primaryOneToFive"), value: stats.primary, icon: School },
    { label: t("middleSixToEight"), value: stats.middle, icon: Building2 },
    { label: SCHOOL_TYPE_LABELS[SchoolType.HIGHER_SECONDARY][language], value: stats.higher, icon: GraduationCap }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">{t("adminDashboardTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("adminDashboardSub")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground">{card.label}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-3xl font-black text-primary">{card.value.toLocaleString()}</p>
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
