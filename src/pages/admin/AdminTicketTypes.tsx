import { useState } from "react";
import { useLanguage } from "@/i18n";
import { getLocalizedText } from "@/i18n/localize";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2, History, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllTicketTypes, deleteTicketType, createTicketType, updateTicketType, fetchPriceVersions, createPriceVersion, type UI_TicketType, type TicketTypePriceVersion } from "@/services/ticketTypesService";
import { fetchAllEvents } from "@/services/eventsService";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";

interface TicketTypeFormValues {
  eventId: string;
  name: string;
  sellPrice: number;
  partnerPrice: number;
  currency: string;
  quantity: number;
}

interface PriceVersionFormValues {
  currency: string;
  priceCents: number;
  startsAt?: string;
  endsAt?: string;
  reason?: string;
}

export default function AdminTicketTypes() {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<UI_TicketType | null>(null);
  const [managingPriceVersions, setManagingPriceVersions] = useState<UI_TicketType | null>(null);
  const [isAddPriceVersionOpen, setIsAddPriceVersionOpen] = useState(false);

  const createForm = useForm<TicketTypeFormValues>({
    defaultValues: {
      currency: "ILS",
      quantity: 100
    }
  });

  const editForm = useForm<TicketTypeFormValues>();
  const priceVersionForm = useForm<PriceVersionFormValues>();

  const { data: ticketTypes = [], isLoading } = useQuery({
    queryKey: ["adminTicketTypes"],
    queryFn: () => fetchAllTicketTypes(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["adminEventsList"],
    queryFn: () => fetchAllEvents(language),
  });

  const { data: priceVersions = [], isLoading: isLoadingVersions } = useQuery({
    queryKey: ["priceVersions", managingPriceVersions?.id],
    queryFn: () => managingPriceVersions ? fetchPriceVersions(managingPriceVersions.id) : Promise.resolve([]),
    enabled: !!managingPriceVersions,
  });

  const eventById = new Map(events.map((event) => [event.id, event]));
  const getEventTitle = (eventId: string) => {
    const event = eventById.get(eventId);
    if (!event) return eventId;
    return language === "ar" ? event.title.ar : event.title.en;
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTicketType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTicketTypes"] });
      toast.success("Ticket type deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete ticket type");
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createTicketType>[0]) => createTicketType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTicketTypes"] });
      toast.success("Ticket type created successfully");
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create ticket type");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Parameters<typeof updateTicketType>[1] }) => updateTicketType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTicketTypes"] });
      toast.success("Ticket type updated successfully");
      setEditingTicketType(null);
      editForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ticket type");
    },
  });

  const addPriceVersionMutation = useMutation({
    mutationFn: (data: PriceVersionFormValues) => 
      managingPriceVersions ? createPriceVersion(managingPriceVersions.id, {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
      }) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priceVersions", managingPriceVersions?.id] });
      toast.success(t.admin.priceVersionSuccess);
      setIsAddPriceVersionOpen(false);
      priceVersionForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || t.admin.priceVersionError);
    }
  });

  const handleCreateSubmit = (data: TicketTypeFormValues) => {
    createMutation.mutate({
      eventId: data.eventId,
      name: data.name,
      sellPriceCents: Math.round(data.sellPrice * 100),
      partnerPriceCents: Math.round(data.partnerPrice * 100),
      currency: data.currency,
      quantity: Number(data.quantity)
    });
  };

  const handleEditSubmit = (data: TicketTypeFormValues) => {
    if (!editingTicketType) return;
    updateMutation.mutate({
      id: editingTicketType.id,
      data: {
        name: data.name,
        sellPriceCents: Math.round(data.sellPrice * 100),
        partnerPriceCents: Math.round(data.partnerPrice * 100),
        currency: data.currency,
        quantity: Number(data.quantity)
      }
    });
  };

  const handleAddPriceVersionSubmit = (data: PriceVersionFormValues) => {
    addPriceVersionMutation.mutate(data);
  };

  const startEditing = (type: UI_TicketType) => {
    setEditingTicketType(type);
    editForm.reset({
      eventId: type.eventId,
      name: type.name,
      sellPrice: type.price,
      partnerPrice: type.partnerPrice,
      currency: type.currency,
      quantity: type.quantity
    });
  };

  const startManagingPrices = (type: UI_TicketType) => {
    setManagingPriceVersions(type);
    priceVersionForm.reset({
      currency: type.currency,
      priceCents: type.price * 100,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.ticketTypes}</h2>
          <p className="text-muted-foreground">{t.admin.ticketTypesDesc}</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t.admin.createTicketType}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.admin.createTicketType}</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Event</Label>
                <Controller
                  name="eventId"
                  control={createForm.control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {getLocalizedText(event.title, language, event.slug)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tier Name</Label>
                <Input id="name" {...createForm.register("name", { required: true })} placeholder="Regular, VIP, etc." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sellPrice">Sell Price</Label>
                  <Input id="sellPrice" type="number" step="0.01" {...createForm.register("sellPrice", { required: true, valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerPrice">Partner Price</Label>
                  <Input id="partnerPrice" type="number" step="0.01" {...createForm.register("partnerPrice", { required: true, valueAsNumber: true })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" {...createForm.register("currency", { required: true })} placeholder="ILS, USD, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" {...createForm.register("quantity", { required: true, valueAsNumber: true })} />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.common.save}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.admin.typeName}</TableHead>
                    <TableHead>{t.admin.eventName || "Event"}</TableHead>
                    <TableHead>{t.admin.basePrice}</TableHead>
                    <TableHead className="w-24">{t.admin.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ticketTypes.map((type) => {
                    const event = events.find((e) => e.id === (type as { eventId?: string }).eventId);
                    const eventTitle = event 
                      ? getLocalizedText(event.title, language, event.slug)
                      : (type as { eventId?: string }).eventId || "-";

                    return (
                      <TableRow key={type.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: type.color || "#3b82f6" }}
                            />
                            <span className="font-medium">
                              {type.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {eventTitle}
                        </TableCell>
                        <TableCell>
                          {type.price} {t.common.currency}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startManagingPrices(type)}
                              title={t.admin.managePrices}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(type)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (window.confirm(t.admin.confirmDelete || "Are you sure?")) {
                                  deleteMutation.mutate(type.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingTicketType} onOpenChange={(open) => !open && setEditingTicketType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.common.edit}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event</Label>
              <Input value={getLocalizedText(events.find(e => e.id === editingTicketType?.eventId)?.title, language, editingTicketType?.eventId || "")} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Tier Name</Label>
              <Input id="edit-name" {...editForm.register("name", { required: true })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sellPrice">Sell Price</Label>
                <Input id="edit-sellPrice" type="number" step="0.01" {...editForm.register("sellPrice", { required: true, valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-partnerPrice">Partner Price</Label>
                <Input id="edit-partnerPrice" type="number" step="0.01" {...editForm.register("partnerPrice", { required: true, valueAsNumber: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Input id="edit-currency" {...editForm.register("currency", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input id="edit-quantity" type="number" {...editForm.register("quantity", { required: true, valueAsNumber: true })} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditingTicketType(null)}>{t.common.cancel}</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.common.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!managingPriceVersions} onOpenChange={(open) => !open && setManagingPriceVersions(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.admin.priceVersions}: {managingPriceVersions?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{t.admin.priceVersions}</h3>
              <Button onClick={() => setIsAddPriceVersionOpen(true)} size="sm">
                <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {t.admin.addPriceVersion}
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.admin.price}</TableHead>
                    <TableHead>{t.admin.startsAt}</TableHead>
                    <TableHead>{t.admin.endsAt}</TableHead>
                    <TableHead>{t.admin.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingVersions ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-4"><Loader2 className="h-4 w-4 animate-spin inline ltr:mr-2 rtl:ml-2" />{t.common.loading}</TableCell></TableRow>
                  ) : priceVersions.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-4">{t.admin.noPriceVersions}</TableCell></TableRow>
                  ) : (
                    priceVersions.map((pv) => {
                      const now = new Date();
                      const start = pv.startsAt ? new Date(pv.startsAt) : null;
                      const end = pv.endsAt ? new Date(pv.endsAt) : null;
                      let status = "active";
                      if (start && start > now) status = "scheduled";
                      if (end && end < now) status = "expired";

                      return (
                        <TableRow key={pv.id}>
                          <TableCell className="font-medium">{pv.priceCents / 100} {pv.currency}</TableCell>
                          <TableCell className="text-sm">{pv.startsAt ? format(new Date(pv.startsAt), "PPp") : "-"}</TableCell>
                          <TableCell className="text-sm">{pv.endsAt ? format(new Date(pv.endsAt), "PPp") : "-"}</TableCell>
                          <TableCell>
                            <Badge className={
                              status === "active" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                              status === "scheduled" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                              "bg-muted text-muted-foreground"
                            }>
                              {status === "active" ? t.admin.active : status === "scheduled" ? t.admin.scheduled : t.admin.expired}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setManagingPriceVersions(null)}>{t.common.close}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPriceVersionOpen} onOpenChange={setIsAddPriceVersionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.addPriceVersion}</DialogTitle>
          </DialogHeader>
          <form onSubmit={priceVersionForm.handleSubmit(handleAddPriceVersionSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.admin.currency}</Label>
                <Input {...priceVersionForm.register("currency", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>{t.admin.priceCents}</Label>
                <Input type="number" {...priceVersionForm.register("priceCents", { required: true, valueAsNumber: true })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.admin.startsAt}</Label>
                <Input type="datetime-local" {...priceVersionForm.register("startsAt")} />
              </div>
              <div className="space-y-2">
                <Label>{t.admin.endsAt}</Label>
                <Input type="datetime-local" {...priceVersionForm.register("endsAt")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.admin.reason}</Label>
              <Input {...priceVersionForm.register("reason")} placeholder={t.admin.reasonPlaceholder} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAddPriceVersionOpen(false)}>{t.common.cancel}</Button>
              <Button type="submit" disabled={addPriceVersionMutation.isPending}>
                {addPriceVersionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.common.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
