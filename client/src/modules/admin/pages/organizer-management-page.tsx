import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  createOrganizer,
  deleteOrganizer,
  getOrganizers,
  updateOrganizer,
  type OrganizerInput
} from "@/modules/admin/api/admin-api";
import { resolveToastErrorMessage } from "@/lib/toast-message";
import { DISTRICTS, SCHOOL_TYPE_LABELS } from "@/modules/shared/data/constants";
import { useLanguage } from "@/modules/shared/context/language-context";
import { SchoolType, type Organizer } from "@/modules/shared/types/domain";

type OrganizerFormInput = Pick<
  OrganizerInput,
  "firstName" | "lastName" | "phone" | "email" | "temporaryPassword" | "schoolName" | "schoolType" | "district"
>;

const NAME_REGEX = /^[\p{L}]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const emptyForm: OrganizerFormInput = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  temporaryPassword: "",
  schoolName: "",
  schoolType: SchoolType.PRIMARY,
  district: ""
};

export const OrganizerManagementPage = () => {
  const { language, t } = useLanguage();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Organizer | null>(null);
  const [editing, setEditing] = useState<Organizer | null>(null);
  const [form, setForm] = useState<OrganizerFormInput>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof OrganizerFormInput, string>>>({});

  const loadOrganizers = async () => {
    const data = await getOrganizers();
    setOrganizers(data.organizers);
  };

  useEffect(() => {
    void loadOrganizers();
  }, []);

  const filtered = useMemo(() => {
    return organizers.filter((organizer) =>
      [organizer.id, organizer.firstName, organizer.lastName, organizer.schoolName, organizer.district, organizer.email]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [organizers, search]);

  const requiredMessage = "This field is required";

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof OrganizerFormInput, string>> = {};

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();
    const temporaryPassword = form.temporaryPassword.trim();
    const schoolName = form.schoolName.trim();
    const district = form.district.trim();

    if (!firstName) {
      nextErrors.firstName = requiredMessage;
    } else if (!NAME_REGEX.test(firstName)) {
      nextErrors.firstName = "First name must contain letters only";
    }

    if (!lastName) {
      nextErrors.lastName = requiredMessage;
    } else if (!NAME_REGEX.test(lastName)) {
      nextErrors.lastName = "Last name must contain letters only";
    }

    if (!phone) {
      nextErrors.phone = requiredMessage;
    } else if (!INDIAN_MOBILE_REGEX.test(phone)) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9";
    }

    if (!email) {
      nextErrors.email = requiredMessage;
    } else if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = t("invalidEmail");
    }

    if (!editing && !temporaryPassword) {
      nextErrors.temporaryPassword = requiredMessage;
    } else if (temporaryPassword && !PASSWORD_REGEX.test(temporaryPassword)) {
      nextErrors.temporaryPassword = t("strictPasswordHint");
    }

    if (!schoolName) {
      nextErrors.schoolName = requiredMessage;
    }

    if (!form.schoolType) {
      nextErrors.schoolType = requiredMessage;
    }

    if (!district) {
      nextErrors.district = requiredMessage;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  };

  const startEdit = (organizer: Organizer) => {
    setEditing(organizer);
    setErrors({});
    setForm({
      firstName: organizer.firstName,
      lastName: organizer.lastName,
      phone: organizer.phone,
      email: organizer.email,
      temporaryPassword: "",
      schoolName: organizer.schoolName,
      schoolType: organizer.schoolType,
      district: organizer.district
    });
    setOpen(true);
  };

  const saveForm = async () => {
    if (!validateForm()) {
      return;
    }

    const temporaryPassword = form.temporaryPassword.trim();

    try {
      const payload: OrganizerInput = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        schoolName: form.schoolName.trim(),
        schoolType: form.schoolType,
        district: form.district.trim(),
        temporaryPassword: temporaryPassword || undefined
      };

      if (editing) {
        await updateOrganizer(editing.id, payload);
        toast.success(t("organizerUpdated"));
      } else {
        const response = await createOrganizer(payload);
        toast.success(`${t("organizerCreated")} - ${t("tempPassword")}: ${response.generatedPassword}`);
      }

      setForm(emptyForm);
      setEditing(null);
      setOpen(false);
      await loadOrganizers();
    } catch (error) {
      toast.error(resolveToastErrorMessage(error, t, "saveOrganizerFailed"));
    }
  };

  const askRemoveOrganizer = (organizer: Organizer) => {
    setDeleteCandidate(organizer);
    setDeleteDialogOpen(true);
  };

  const removeOrganizer = async () => {
    if (!deleteCandidate) return;

    setDeleting(true);
    try {
      await deleteOrganizer(deleteCandidate.id);
      toast.success(t("organizerDeleted"));
      setDeleteDialogOpen(false);
      setDeleteCandidate(null);
      await loadOrganizers();
    } catch (error) {
      toast.error(resolveToastErrorMessage(error, t, "deleteOrganizerFailed"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <Card className="w-full border-2">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="min-w-0">
            <CardTitle>{t("organizers")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("organizerManageSub")}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" onClick={startCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {t("addOrganizer")}
              </Button>
            </DialogTrigger>
            <DialogContent
              className="w-[calc(100vw-20px)] max-h-[calc(100svh-20px)] max-w-[calc(100vw-20px)] p-0 sm:w-full sm:max-w-xl"
              onInteractOutside={(event) => event.preventDefault()}
              onEscapeKeyDown={(event) => event.preventDefault()}
            >
              <div className="flex max-h-[92svh] flex-col">
                <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-6">
                  <DialogTitle>{editing ? t("updateOrganizer") : t("addOrganizer")}</DialogTitle>
                  <DialogDescription>{t("organizerDialogSub")}</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>
                        {t("firstName")} <span className="text-red-500">*</span>
                      </Label>
                      <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                      {errors.firstName ? <p className="text-xs text-destructive">{errors.firstName}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t("lastName")} <span className="text-red-500">*</span>
                      </Label>
                      <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                      {errors.lastName ? <p className="text-xs text-destructive">{errors.lastName}</p> : null}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>
                        {t("phone")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                        required
                      />
                      {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>
                        {t("email")} <span className="text-red-500">*</span>
                      </Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                      {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>
                        {t("tempPassword")} {!editing ? <span className="text-red-500">*</span> : null}
                      </Label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        value={form.temporaryPassword}
                        onChange={(e) => setForm({ ...form, temporaryPassword: e.target.value })}
                        placeholder={editing ? "Leave blank to keep existing password" : ""}
                        required={!editing}
                      />
                      {errors.temporaryPassword ? <p className="text-xs text-destructive">{errors.temporaryPassword}</p> : null}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>
                        {t("schoolName")} <span className="text-red-500">*</span>
                      </Label>
                      <Input value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} required />
                      {errors.schoolName ? <p className="text-xs text-destructive">{errors.schoolName}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t("schoolType")} <span className="text-red-500">*</span>
                      </Label>
                      <Select value={form.schoolType} onValueChange={(value: SchoolType) => setForm({ ...form, schoolType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border bg-background/70 backdrop-blur-md">
                          {Object.values(SchoolType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {SCHOOL_TYPE_LABELS[type][language]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.schoolType ? <p className="text-xs text-destructive">{errors.schoolType}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t("district")} <span className="text-red-500">*</span>
                      </Label>
                      <Select value={form.district} onValueChange={(value) => setForm({ ...form, district: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("district")} />
                        </SelectTrigger>
                        <SelectContent className="border bg-background/70 backdrop-blur-md">
                          {DISTRICTS.map((district) => (
                            <SelectItem key={district.nameEn} value={district.nameEn}>
                              {language === "ta" ? district.nameTa : district.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.district ? <p className="text-xs text-destructive">{errors.district}</p> : null}
                    </div>
                  </div>
                </div>

                <DialogFooter className="shrink-0 border-t px-4 py-3 sm:px-6">
                  <Button className="w-full sm:w-auto" onClick={saveForm}>
                    {t("save")}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-hidden pt-2">
          <Input
            className="w-full min-w-0"
            placeholder={`${t("search")}...`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="w-full overflow-x-auto">
            <Table className="min-w-[780px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("firstName")}</TableHead>
                  <TableHead>{t("schoolName")}</TableHead>
                  <TableHead>{t("district")}</TableHead>
                  <TableHead>{t("schoolType")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((organizer) => (
                  <TableRow key={organizer.id}>
                    <TableCell className="font-semibold">{organizer.id}</TableCell>
                    <TableCell>
                      {organizer.firstName} {organizer.lastName}
                    </TableCell>
                    <TableCell>{organizer.schoolName}</TableCell>
                    <TableCell>{organizer.district}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{SCHOOL_TYPE_LABELS[organizer.schoolType][language]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => startEdit(organizer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => askRemoveOrganizer(organizer)}>
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

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(nextOpen) => {
          setDeleteDialogOpen(nextOpen);
          if (!nextOpen) {
            setDeleteCandidate(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("deleteConfirmOrganizer")}</DialogTitle>
            <DialogDescription>
              {deleteCandidate ? `${deleteCandidate.firstName} ${deleteCandidate.lastName} (${deleteCandidate.id})` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={removeOrganizer} disabled={deleting}>
              {deleting ? t("pleaseWait") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};