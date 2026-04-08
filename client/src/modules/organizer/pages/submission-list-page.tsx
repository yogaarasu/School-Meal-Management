import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format as formatDate } from "date-fns";
import { CalendarIcon, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatFixed } from "@/lib/format";
import { resolveToastErrorMessage } from "@/lib/toast-message";
import { deleteReport, getReports } from "@/modules/organizer/api/organizer-api";
import { SCHOOL_TYPE_LABELS, STOCK_ITEMS } from "@/modules/shared/data/constants";
import { useLanguage } from "@/modules/shared/context/language-context";
import { SchoolType, type DailyReport } from "@/modules/shared/types/domain";

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

export const SubmissionListPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [searchDate, setSearchDate] = useState("");
  const [period, setPeriod] = useState("all");
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DailyReport | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selectedSearchDate = useMemo(() => fromIsoDate(searchDate), [searchDate]);

  const loadReports = async () => {
    const data = await getReports();
    setReports(data.reports);
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const filtered = useMemo(() => {
    let items = [...reports];

    if (searchDate) {
      items = items.filter((report) => report.date === searchDate);
    } else if (period !== "all") {
      const days = Number(period);
      const cutOff = new Date();
      cutOff.setDate(cutOff.getDate() - days);
      const cutOffIso = toIsoDate(cutOff);
      items = items.filter((report) => report.date >= cutOffIso);
    }

    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [reports, searchDate, period]);

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const reportId = deleteTarget.id;

    setDeleting(true);
    try {
      await deleteReport(reportId);
      setReports((previous) => previous.filter((report) => report.id !== reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      setDeleteTarget(null);
      toast.success(t("reportDeleted"));
      void loadReports();
    } catch (error) {
      toast.error(resolveToastErrorMessage(error, t, "deleteReportFailed"));
    } finally {
      setDeleting(false);
    }
  };

  const sectionLabel = (section: DailyReport["section"]): string => {
    if (section === "PRIMARY") {
      return SCHOOL_TYPE_LABELS[SchoolType.PRIMARY][language];
    }

    if (section === "MIDDLE") {
      return SCHOOL_TYPE_LABELS[SchoolType.MIDDLE][language];
    }

    return t("sectionAll");
  };

  const detailsDateLabel = useMemo(() => {
    if (!selectedReport) {
      return "";
    }
    const parsed = fromIsoDate(selectedReport.date);
    return formatDate(parsed ?? new Date(selectedReport.date), "PPP");
  }, [selectedReport]);

  return (
    <>
      <Card className="overflow-hidden border-2">
        <CardHeader>
          <CardTitle>{t("submissionHistory")}</CardTitle>
          <CardDescription>{t("submissionSub")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedSearchDate ? formatDate(selectedSearchDate, "PPP") : t("date")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedSearchDate}
                  onSelect={(value) => setSearchDate(value ? toIsoDate(value) : "")}
                  captionLayout="dropdown"
                  startMonth={new Date(2020, 0)}
                  endMonth={new Date(2035, 11)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border bg-background/70 backdrop-blur-md">
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="6">{t("last6Days")}</SelectItem>
                <SelectItem value="30">{t("last30Days")}</SelectItem>
                <SelectItem value="60">{t("last60Days")}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setSearchDate("")}>{t("resetDate")}</Button>
          </div>

          <div className="w-full overflow-x-auto">
            <Table className="min-w-[760px] [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap [&_td]:align-middle">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("section")}</TableHead>
                  <TableHead className="text-right">{t("students")}</TableHead>
                  <TableHead className="text-right">{t("cost")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((report) => (
                  <TableRow
                    key={report.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <TableCell className="font-semibold">{report.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sectionLabel(report.section)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{report.studentsPresent}</TableCell>
                    <TableCell className="text-right">Rs {formatFixed(report.totalCost)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/daily-report?edit=${report.id}`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteTarget(report);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedReport)} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="flex w-[calc(100vw-20px)] max-h-[calc(100svh-20px)] max-w-[calc(100vw-20px)] flex-col overflow-hidden p-0 sm:max-w-3xl">
          {selectedReport ? (
            <>
              <DialogHeader className="border-b px-5 py-4">
                <DialogTitle>{language === "ta" ? "அறிக்கை விவரங்கள்" : "Report Details"}</DialogTitle>
                <DialogDescription>{detailsDateLabel}</DialogDescription>
              </DialogHeader>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{t("section")}</p>
                    <p className="mt-1 font-semibold">{sectionLabel(selectedReport.section)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{t("studentsPresent")}</p>
                    <p className="mt-1 font-semibold">{selectedReport.studentsPresent}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{t("primaryOneToFive")}</p>
                    <p className="mt-1 font-semibold">{selectedReport.students1to5}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{t("middleSixToEight")}</p>
                    <p className="mt-1 font-semibold">{selectedReport.students6to8}</p>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="mb-3 text-sm font-semibold">{t("itemsUsed")}</p>
                  <div className="space-y-2">
                    {selectedReport.itemsUsed.map((entry) => {
                      const stockItem = STOCK_ITEMS.find((item) => item.id === entry.itemId);
                      const itemName = language === "ta" ? stockItem?.nameTa : stockItem?.nameEn;
                      const unit = language === "ta" ? stockItem?.unitTa : stockItem?.unitEn;

                      return (
                        <div key={entry.itemId} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
                          <span>{itemName ?? entry.itemId}</span>
                          <span className="font-semibold">
                            {formatFixed(entry.quantity)} {unit ?? ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="mb-3 text-sm font-semibold">{t("costBreakdown")}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>{t("vegetables")}</span>
                      <span className="font-semibold">Rs {formatFixed(selectedReport.costBreakdown.veg)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t("grocery")}</span>
                      <span className="font-semibold">Rs {formatFixed(selectedReport.costBreakdown.grocery)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t("gas")}</span>
                      <span className="font-semibold">Rs {formatFixed(selectedReport.costBreakdown.gas)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-primary px-4 py-3 text-primary-foreground">
                  <p className="text-xs uppercase">{t("totalCost")}</p>
                  <p className="text-2xl font-black">Rs {formatFixed(selectedReport.totalCost)}</p>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="w-[calc(100vw-20px)] max-w-[calc(100vw-20px)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{language === "ta" ? "அறிக்கை நீக்கம்" : "Delete Report"}</DialogTitle>
            <DialogDescription>
              {language === "ta" ? "இந்த அறிக்கையை நீக்க விரும்புகிறீர்களா?" : "Are you sure you want to delete this report?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()} disabled={deleting}>
              {deleting ? t("pleaseWait") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

