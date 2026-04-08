import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format as formatDate } from "date-fns";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatFixed, todayISO } from "@/lib/format";
import { resolveToastErrorMessage } from "@/lib/toast-message";
import { useAuth } from "@/modules/auth/context/auth-context";
import {
  createReport,
  getOrganizerPricing,
  getReports,
  updateReport,
  type ReportInput
} from "@/modules/organizer/api/organizer-api";
import { SCHOOL_TYPE_LABELS, STOCK_ITEMS } from "@/modules/shared/data/constants";
import { useLanguage } from "@/modules/shared/context/language-context";
import { SchoolType, type DailyReport, type GlobalPricingConfig } from "@/modules/shared/types/domain";

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

export const DailyMealReportPage = () => {
  const { user, refresh } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [pricing, setPricing] = useState<GlobalPricingConfig | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [date, setDate] = useState(todayISO());
  const [section, setSection] = useState<"PRIMARY" | "MIDDLE" | "ALL">("ALL");
  const [students, setStudents] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(["rice", "dal", "oil", "chickpeas", "greenBeans", "veg", "grocery", "gas"])
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    Promise.all([getOrganizerPricing(), getReports()])
      .then(([pricingResponse, reportsResponse]) => {
        setPricing(pricingResponse.config);
        setReports(reportsResponse.reports);
      })
      .catch((error) => toast.error(resolveToastErrorMessage(error, t, "loadReportDataFailed")));
  }, []);

  useEffect(() => {
    if (!editId) {
      if (user?.organizerData?.schoolType === SchoolType.MIDDLE) {
        setSection("PRIMARY");
      } else {
        setSection("ALL");
      }
      return;
    }

    const existing = reports.find((report) => report.id === editId);
    if (existing) {
      setDate(existing.date);
      setSection(existing.section);
      setStudents(existing.studentsPresent);
      setSelectedItems(new Set(existing.itemsUsed.map((item) => item.itemId).concat(["veg", "grocery", "gas"])));
    }
  }, [editId, reports, user?.organizerData?.schoolType]);

  const activeSchoolType = useMemo<SchoolType>(() => {
    if (section === "PRIMARY") return SchoolType.PRIMARY;
    if (section === "MIDDLE") return SchoolType.MIDDLE;
    return user?.organizerData?.schoolType || SchoolType.PRIMARY;
  }, [section, user?.organizerData?.schoolType]);

  const selectedDate = useMemo(() => fromIsoDate(date), [date]);

  const calculations = useMemo(() => {
    if (!pricing) {
      return {
        items: [] as Array<{ itemId: string; quantity: number }>,
        costBreakdown: { veg: 0, grocery: 0, gas: 0 }
      };
    }

    const active = pricing[activeSchoolType];

    const quantityFor = (item: string): number => {
      if (!selectedItems.has(item)) return 0;
      if (item === "rice") return (active.riceGrams * students) / 1000;
      if (item === "dal") return (active.dalGrams * students) / 1000;
      if (item === "oil") return (active.oilMl * students) / 1000;
      if (item === "chickpeas") return (active.chickpeasGrams * students) / 1000;
      if (item === "greenBeans") return (active.greenBeansGrams * students) / 1000;
      return 0;
    };

    const costFor = (item: string): number => {
      if (!selectedItems.has(item)) return 0;
      if (item === "veg") return active.vegPrice * students;
      if (item === "grocery") return active.groceryPrice * students;
      if (item === "gas") return active.gasPrice * students;
      return 0;
    };

    return {
      items: ["rice", "dal", "oil", "chickpeas", "greenBeans"].map((itemId) => ({
        itemId,
        quantity: quantityFor(itemId)
      })),
      costBreakdown: {
        veg: costFor("veg"),
        grocery: costFor("grocery"),
        gas: costFor("gas")
      }
    };
  }, [pricing, activeSchoolType, students, selectedItems]);

  const totalCost = calculations.costBreakdown.veg + calculations.costBreakdown.grocery + calculations.costBreakdown.gas;
  const hasDuplicateForDateAndSection = useMemo(() => {
    return reports.some((report) => report.date === date && report.section === section && report.id !== editId);
  }, [reports, date, section, editId]);

  const toggleItem = (itemId: string) => {
    const next = new Set(selectedItems);
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    setSelectedItems(next);
  };

  const submitReport = async () => {
    if (!pricing) return;

    if (students <= 0) {
      toast.error(t("enterAttendance"));
      return;
    }

    if (hasDuplicateForDateAndSection) {
      toast.error(t("reportDuplicate"));
      return;
    }

    const payload: ReportInput = {
      date,
      mealId: "standard_meal",
      section,
      studentsPresent: students,
      students1to5: section === "MIDDLE" ? 0 : students,
      students6to8: section === "MIDDLE" ? students : 0,
      itemsUsed: calculations.items.filter((item) => item.quantity > 0),
      totalCost,
      costBreakdown: calculations.costBreakdown
    };

    setSaving(true);
    try {
      if (editId) {
        await updateReport(editId, payload);
      } else {
        await createReport(payload);
      }

      toast.success(t("reportSaved"));
      navigate("/submissions");
    } catch (error) {
      toast.error(resolveToastErrorMessage(error, t, "saveReportFailed"));
    } finally {
      setSaving(false);
    }
  };

  const middleSchool = user?.organizerData?.schoolType === SchoolType.MIDDLE;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border-2 lg:col-span-7">
          <CardHeader>
            <CardTitle>{t("dailyReportTitle")}</CardTitle>
            <CardDescription>{editId ? t("editExistingReport") : t("createNewDailyReport")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("date")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? formatDate(selectedDate, "PPP") : t("date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(value) => {
                        if (value) {
                          setDate(toIsoDate(value));
                        }
                      }}
                      captionLayout="dropdown"
                      startMonth={new Date(2020, 0)}
                      endMonth={new Date(2035, 11)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t("section")}</Label>
                {middleSchool ? (
                  <Select value={section} onValueChange={(value: "PRIMARY" | "MIDDLE") => setSection(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border bg-background/70 backdrop-blur-md">
                      <SelectItem value="PRIMARY">{SCHOOL_TYPE_LABELS[SchoolType.PRIMARY][language]}</SelectItem>
                      <SelectItem value="MIDDLE">{SCHOOL_TYPE_LABELS[SchoolType.MIDDLE][language]}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={t("sectionAll")} disabled />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("studentsPresent")}</Label>
              <Input type="number" min={0} value={students || ""} onChange={(event) => setStudents(Number(event.target.value || 0))} />
            </div>

            <div className="space-y-2">
              <Label>{t("itemsUsed")}</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {STOCK_ITEMS.map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    variant={selectedItems.has(item.id) ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => toggleItem(item.id)}
                  >
                    {language === "ta" ? item.nameTa : item.nameEn}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 lg:col-span-5">
          <CardHeader>
            <CardTitle>{t("autoCalculation")}</CardTitle>
            <CardDescription>{t("stockAndCostBreakdown")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-2 text-xs uppercase text-muted-foreground">{t("stockUsage")}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("item")}</TableHead>
                    <TableHead className="text-right">{t("quantity")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.items.map((item) => {
                    const meta = STOCK_ITEMS.find((stockItem) => stockItem.id === item.itemId);
                    return (
                      <TableRow key={item.itemId}>
                        <TableCell>{language === "ta" ? meta?.nameTa : meta?.nameEn}</TableCell>
                        <TableCell className="text-right font-semibold">{formatFixed(item.quantity)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase text-muted-foreground">{t("costBreakdown")}</p>
              <div className="space-y-2 rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{t("vegetables")}</span>
                  <span>Rs {formatFixed(calculations.costBreakdown.veg)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("grocery")}</span>
                  <span>Rs {formatFixed(calculations.costBreakdown.grocery)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("gas")}</span>
                  <span>Rs {formatFixed(calculations.costBreakdown.gas)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-primary px-4 py-3 text-primary-foreground">
              <p className="text-xs uppercase">{t("totalCost")}</p>
              <p className="text-2xl font-black">Rs {formatFixed(totalCost)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={submitReport} disabled={saving} className="w-full">
        <CheckCircle2 className="mr-2 h-4 w-4" />
        {saving ? t("pleaseWait") : t("saveReport")}
      </Button>
    </div>
  );
};

