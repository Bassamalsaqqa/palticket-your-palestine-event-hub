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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllTicketTypes, deleteTicketType, createTicketType, updateTicketType, type UI_TicketType } from "@/services/ticketTypesService";
import { fetchAllEvents } from "@/services/eventsService";
import { useForm, Controller } from "react-hook-form";

interface TicketTypeFormValues {
  eventId: string;
  name: string;
  sellPrice: number;
  partnerPrice: number;
  currency: string;
  quantity: number;
}

export default function AdminTicketTypes() {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<UI_TicketType | null>(null);

  const createForm = useForm<TicketTypeFormValues>({
    defaultValues: {
      currency: "ILS",
      quantity: 100
    }
  });

  const editForm = useForm<TicketTypeFormValues>();

  const { data: ticketTypes = [], isLoading } = useQuery({
    queryKey: ["adminTicketTypes"],
    queryFn: () => fetchAllTicketTypes(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["adminEventsList"],
    queryFn: () => fetchAllEvents(language),
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
    </div>
  );
}
