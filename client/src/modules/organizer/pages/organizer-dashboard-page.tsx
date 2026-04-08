import { useEffect, useMemo, useState } from "react";
import { format as formatDate } from "date-fns";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CalendarIcon, ClipboardList, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/modules/auth/context/auth-context";
import { getReports } from "@/modules/organizer/api/organizer-api";
import { useLanguage } from "@/modules/shared/context/language-context";
import type { DailyReport } from "@/modules/shared/types/domain";

const toIsoDate = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fromIsoDate = (value: string): Date | undefined => {
  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) {
    return undefined;
  }

  const candidate = new Date(year, month - 1, day);
  return Number.isNaN(candidate.getTime()) ? undefined : candidate;
};

export const OrganizerDashboardPage = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    getReports()
      .then((response) => setReports(response.reports))
      .catch(() => setReports([]));
  }, []);

  const selectedDateValue = useMemo(() => fromIsoDate(selectedDate), [selectedDate]);

  const summary = useMemo(() => {
    const source = selectedDate ? reports.filter((report) => report.date === selectedDate) : reports;

    return source.reduce(
      (acc, report) => {
        acc.totalPrimary += report.students1to5;
        acc.totalMiddle += report.students6to8;
        acc.totalAll += report.studentsPresent;
        return acc;
      },
      { totalPrimary: 0, totalMiddle: 0, totalAll: 0 }
    );
  }, [reports, selectedDate]);

  const summaryScopeLabel = selectedDateValue
    ? language === "ta"
      ? `${formatDate(selectedDateValue, "PPP")} தேதிக்கான மாணவர் சுருக்கம்`
      : `Student totals for ${formatDate(selectedDateValue, "PPP")}`
    : language === "ta"
      ? "அனைத்து தேதிகளுக்கான மாணவர் சுருக்கம்"
      : "Student totals for all dates";

  const cards = [
    { label: t("totalOneToEight"), value: summary.totalAll, icon: Users },
    { label: t("primaryOneToFive"), value: summary.totalPrimary, icon: ClipboardList },
    { label: t("middleSixToEight"), value: summary.totalMiddle, icon: BarChart3 }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-black">{t("organizerPortal")}</h1>
          <p className="text-sm text-muted-foreground">{user?.organizerData?.schoolName}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal sm:w-[280px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDateValue ? formatDate(selectedDateValue, "PPP") : t("date")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto max-w-[calc(100vw-16px)] p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDateValue}
                onSelect={(value) => setSelectedDate(value ? toIsoDate(value) : "")}
                captionLayout="dropdown"
                startMonth={new Date(2020, 0)}
                endMonth={new Date(2035, 11)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={() => setSelectedDate("")} className="sm:w-auto">
            {t("resetDate")}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">{summaryScopeLabel}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">{t("actions")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button asChild className="justify-between">
            <Link to="/daily-report">
              {t("submitDailyReport")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-between">
            <Link to="/stock">
              {t("stockLedger")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
