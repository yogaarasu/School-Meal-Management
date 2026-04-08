import { useEffect, useMemo, useState } from "react";
import { format as formatDate } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
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
import { addStockEntry, deleteStockEntry, getStockLedger } from "@/modules/organizer/api/organizer-api";
import { STOCK_ITEMS } from "@/modules/shared/data/constants";
import { useLanguage } from "@/modules/shared/context/language-context";
import type { StockLedgerEntry } from "@/modules/shared/types/domain";

const trackedStockItems = STOCK_ITEMS.filter((item) => ["rice", "dal", "oil", "chickpeas", "greenBeans"].includes(item.id));

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

export const StockManagementPage = () => {
  const { language, t } = useLanguage();
  const [ledger, setLedger] = useState<StockLedgerEntry[]>([]);
  const [date, setDate] = useState(todayISO());
  const [itemId, setItemId] = useState("rice");
  const [quantity, setQuantity] = useState(0);
  const [description, setDescription] = useState("");

  const selectedDate = useMemo(() => fromIsoDate(date), [date]);

  const loadLedger = async () => {
    const data = await getStockLedger();
    setLedger(data.ledger);
  };

  useEffect(() => {
    void loadLedger();
  }, []);

  const currentStock = useMemo(() => {
    return trackedStockItems.map((item) => {
      const total = ledger
        .filter((entry) => entry.itemId === item.id)
        .reduce((sum, entry) => (entry.type === "IN" ? sum + entry.quantity : sum - entry.quantity), 0);

      return { ...item, balance: Math.max(0, total) };
    });
  }, [ledger]);

  const addEntry = async () => {
    if (quantity <= 0) {
      toast.error(t("quantityPositive"));
      return;
    }

    try {
      await addStockEntry({ date, itemId, quantity, description });
      toast.success(t("stockAdded"));
      setQuantity(0);
      setDescription("");
      await loadLedger();
    } catch (error) {
      toast.error(resolveToastErrorMessage(error, t, "addStockFailed"));
    }
  };

  const removeEntry = async (entryId: string) => {
    if (!window.confirm(t("deleteConfirmStock"))) {
      return;
    }

    try {
      await deleteStockEntry(entryId);
      toast.success(t("stockDeleted"));
      await loadLedger();
    } catch (error) {
      toast.error(resolveToastErrorMessage(error, t, "deleteStockFailed"));
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>{t("currentStockTitle")}</CardTitle>
          <CardDescription>{t("currentStockSub")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {currentStock.map((item) => (
            <div key={item.id} className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">{language === "ta" ? item.nameTa : item.nameEn}</p>
              <p className="mt-2 text-3xl font-black text-primary">{formatFixed(item.balance)}</p>
              <p className="text-xs text-muted-foreground">{language === "ta" ? item.unitTa : item.unitEn}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <Card className="min-w-0 border-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              {t("addStockTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label>{t("item")}</Label>
              <Select value={itemId} onValueChange={setItemId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border bg-background/70 backdrop-blur-md">
                  {trackedStockItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {language === "ta" ? item.nameTa : item.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("quantity")}</Label>
              <Input
                type="number"
                step="0.001"
                value={quantity || ""}
                onChange={(event) => setQuantity(Number(event.target.value || 0))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("description")}</Label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <Button onClick={addEntry} className="w-full">
              {t("save")}
            </Button>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-2 lg:col-span-8">
          <CardHeader>
            <CardTitle>{t("stockHistory")}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[680px] [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("item")}</TableHead>
                  <TableHead>{t("quantity")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger
                  .slice()
                  .sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)))
                  .map((entry) => {
                    const item = STOCK_ITEMS.find((stockItem) => stockItem.id === entry.itemId);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{language === "ta" ? item?.nameTa : item?.nameEn}</TableCell>
                        <TableCell className={entry.type === "IN" ? "text-emerald-600" : "text-amber-600"}>
                          {entry.type === "IN" ? "+" : "-"} {formatFixed(entry.quantity)}
                        </TableCell>
                        <TableCell>{entry.type === "IN" ? t("addedStock") : t("spentStock")}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="destructive" onClick={() => removeEntry(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};