import { useEffect, useMemo, useState } from "react";
import { format as formatDate } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { monthISO } from "@/lib/format";
import { getMonthlyReport } from "@/modules/organizer/api/organizer-api";
import { useLanguage } from "@/modules/shared/context/language-context";

interface MonthlyRow {
  id: string;
  nameEn: string;
  nameTa: string;
  unitEn: string;
  unitTa: string;
  starting: number;
  added: number;
  spent: number;
  remaining: number;
}

const monthStringToDate = (value: string): Date => {
  const [yearText, monthText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!year || !month) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return new Date(year, month - 1, 1);
};

const dateToMonthString = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const MonthlyReportPage = () => {
  const { language, t } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState(monthISO());
  const [report, setReport] = useState<MonthlyRow[]>([]);

  const selectedMonthDate = useMemo(() => monthStringToDate(selectedMonth), [selectedMonth]);

  useEffect(() => {
    getMonthlyReport(selectedMonth)
      .then((response) => setReport(response.report))
      .catch(() => setReport([]));
  }, [selectedMonth]);

  const handleDownloadPdf = () => {
    const monthLabel = formatDate(selectedMonthDate, "MMMM yyyy");
    const generatedAt = formatDate(new Date(), "dd MMM yyyy, hh:mm a");

    const totals = report.reduce(
      (acc, row) => {
        acc.starting += row.starting;
        acc.added += row.added;
        acc.spent += row.spent;
        acc.remaining += row.remaining;
        return acc;
      },
      { starting: 0, added: 0, spent: 0, remaining: 0 }
    );

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 36;
    let cursorY = 32;

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1);
    doc.rect(margin, cursorY, pageWidth - margin * 2, 78);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Government of Tamil Nadu", pageWidth / 2, cursorY + 22, { align: "center" });
    doc.setFontSize(12);
    doc.text("Tamil Nadu Nutritious Meal Organisation", pageWidth / 2, cursorY + 42, { align: "center" });
    doc.setFontSize(11);
    doc.text("Monthly Stock Report", pageWidth / 2, cursorY + 60, { align: "center" });

    cursorY += 96;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Month: ${monthLabel}`, margin, cursorY);
    doc.text(`Generated On: ${generatedAt}`, pageWidth - margin, cursorY, { align: "right" });

    const tableBody =
      report.length > 0
        ? report.map((row, index) => [
            String(index + 1),
            row.nameEn,
            row.unitEn,
            row.starting.toFixed(3),
            row.added.toFixed(3),
            row.spent.toFixed(3),
            row.remaining.toFixed(3)
          ])
        : [["-", "No data available", "-", "0.000", "0.000", "0.000", "0.000"]];

    autoTable(doc, {
      startY: cursorY + 10,
      theme: "grid",
      head: [["S.No", "Item", "Unit", "Starting", "Added", "Spent", "Remaining"]],
      body: tableBody,
      foot: [["", "Total", "", totals.starting.toFixed(3), totals.added.toFixed(3), totals.spent.toFixed(3), totals.remaining.toFixed(3)]],
      styles: {
        font: "helvetica",
        fontSize: 9.5,
        cellPadding: 4,
        lineColor: [15, 23, 42],
        lineWidth: 0.6,
        textColor: [15, 23, 42]
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: "bold"
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: "bold"
      },
      columnStyles: {
        0: { cellWidth: 40, halign: "center" },
        1: { cellWidth: 150 },
        2: { cellWidth: 70, halign: "center" },
        3: { cellWidth: 74, halign: "right" },
        4: { cellWidth: 74, halign: "right" },
        5: { cellWidth: 74, halign: "right" },
        6: { cellWidth: 74, halign: "right" }
      },
      margin: { left: margin, right: margin }
    });

    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursorY + 20;
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("For official use only", margin, Math.min(finalY + 18, doc.internal.pageSize.getHeight() - 18));

    doc.save(`monthly-stock-report-${selectedMonth}.pdf`);
  };

  return (
    <Card className="border-2">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="min-w-0">
          <CardTitle>{t("monthlyStockTitle")}</CardTitle>
          <CardDescription className="break-words">{t("monthlyStockSub")}</CardDescription>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal sm:w-[220px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(selectedMonthDate, "MMMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                month={selectedMonthDate}
                selected={selectedMonthDate}
                onMonthChange={(month) => setSelectedMonth(dateToMonthString(month))}
                onSelect={(value) => {
                  if (value) {
                    setSelectedMonth(dateToMonthString(value));
                  }
                }}
                captionLayout="dropdown"
                startMonth={new Date(2020, 0)}
                endMonth={new Date(2035, 11)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={handleDownloadPdf} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t("item")}</TableHead>
              <TableHead className="text-right">{t("startingStock")}</TableHead>
              <TableHead className="text-right">{t("addedStock")}</TableHead>
              <TableHead className="text-right">{t("spentStock")}</TableHead>
              <TableHead className="text-right">{t("remaining")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <p className="font-semibold">{language === "ta" ? row.nameTa : row.nameEn}</p>
                  <p className="text-xs text-muted-foreground">{language === "ta" ? row.unitTa : row.unitEn}</p>
                </TableCell>
                <TableCell className="text-right">{row.starting.toFixed(3)}</TableCell>
                <TableCell className="text-right text-emerald-600">+{row.added.toFixed(3)}</TableCell>
                <TableCell className="text-right text-amber-600">-{row.spent.toFixed(3)}</TableCell>
                <TableCell className="text-right font-semibold">{row.remaining.toFixed(3)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
