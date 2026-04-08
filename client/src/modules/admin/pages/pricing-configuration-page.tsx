import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPricingConfig, updatePricingConfig } from "@/modules/admin/api/admin-api";
import { SCHOOL_TYPE_LABELS } from "@/modules/shared/data/constants";
import { useLanguage } from "@/modules/shared/context/language-context";
import { SchoolType, type GlobalPricingConfig, type PortionConfig } from "@/modules/shared/types/domain";
import { resolveToastErrorMessage } from "@/lib/toast-message";

const pricingFields: Array<{ key: keyof PortionConfig; labelEn: string; labelTa: string; step?: string }> = [
  { key: "riceGrams", labelEn: "Rice (g)", labelTa: "அரிசி (கிராம்)" },
  { key: "dalGrams", labelEn: "Dal (g)", labelTa: "பருப்பு (கிராம்)" },
  { key: "oilMl", labelEn: "Oil (ml)", labelTa: "எண்ணெய் (மி.லி.)" },
  { key: "chickpeasGrams", labelEn: "Chickpeas (g)", labelTa: "கொண்டைக்கடலை (கிராம்)" },
  { key: "greenBeansGrams", labelEn: "Green Beans (g)", labelTa: "பச்சைப்பயறு (கிராம்)" },
  { key: "vegPrice", labelEn: "Vegetables (Rs)", labelTa: "காய்கறிகள் (ரூ)", step: "0.01" },
  { key: "groceryPrice", labelEn: "Grocery (Rs)", labelTa: "மளிகை (ரூ)", step: "0.01" },
  { key: "gasPrice", labelEn: "Gas (Rs)", labelTa: "எரிவாயு (ரூ)", step: "0.01" }
];

export const PricingConfigurationPage = () => {
  const { language, t } = useLanguage();
  const [activeType, setActiveType] = useState<SchoolType>(SchoolType.PRIMARY);
  const [config, setConfig] = useState<GlobalPricingConfig | null>(null);

  useEffect(() => {
    getPricingConfig()
      .then((response) => setConfig(response.config))
      .catch((error) => toast.error(resolveToastErrorMessage(error, t, "loadPricingFailed")));
  }, []);

  const updateField = (schoolType: SchoolType, key: keyof PortionConfig, value: number) => {
    if (!config) return;

    setConfig({
      ...config,
      [schoolType]: {
        ...config[schoolType],
        [key]: value
      }
    });
  };

  const saveConfig = async () => {
    if (!config) return;

    try {
      const response = await updatePricingConfig(config);
      setConfig(response.config);
      toast.success(t("pricingUpdated"));
    } catch (error) {
      toast.error(resolveToastErrorMessage(error, t, "savePricingFailed"));
    }
  };

  if (!config) {
    return <div className="rounded-md border bg-card p-4">{t("loadingPricing")}</div>;
  }

  return (
    <Card className="border-2">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="min-w-0">
          <CardTitle>{t("pricing")}</CardTitle>
          <CardDescription className="break-words">{t("pricingSub")}</CardDescription>
        </div>
        <Button className="h-10 w-full sm:w-auto" onClick={saveConfig}>
          <Save className="mr-2 h-4 w-4" />
          {t("save")}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeType} onValueChange={(value) => setActiveType(value as SchoolType)}>
          <TabsList className="mb-6 grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-3">
            {Object.values(SchoolType).map((schoolType) => (
              <TabsTrigger
                key={schoolType}
                value={schoolType}
                className="h-10 w-full min-w-0 truncate rounded-md border bg-card px-3 text-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {SCHOOL_TYPE_LABELS[schoolType][language]}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.values(SchoolType).map((schoolType) => (
            <TabsContent key={schoolType} value={schoolType} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pricingFields.map((field) => (
                <div key={field.key} className="space-y-2 rounded-lg border bg-muted/30 p-4">
                  <Label>{language === "ta" ? field.labelTa : field.labelEn}</Label>
                  <Input
                    type="number"
                    step={field.step || "1"}
                    value={config[schoolType][field.key]}
                    onChange={(event) => updateField(schoolType, field.key, Number(event.target.value || 0))}
                  />
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};




