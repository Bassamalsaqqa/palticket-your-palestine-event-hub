import { useState } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Edit, Trash2, DoorOpen, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllGates, deleteGate, createGate, updateGate } from "@/services/gatesService";
import { fetchAllEvents } from "@/services/eventsService";
import { useForm, Controller } from "react-hook-form";
import { Gate } from "@/types/domain";

interface CreateGateForm {
  eventId: string;
  name: string;
}

interface EditGateForm {
  name: string;
  eventId: string;
}

export default function AdminGates() {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<Gate | null>(null);

  const createForm = useForm<CreateGateForm>();
  const editForm = useForm<EditGateForm>();

  const { data: gates = [], isLoading } = useQuery({
    queryKey: ["adminGates"],
    queryFn: () => fetchAllGates(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["adminEventsListForGates"],
    queryFn: () => fetchAllEvents(language),
  });

  const eventById = new Map(events.map((event) => [event.id, event]));
  const getEventTitle = (eventId: string) => {
    const event = eventById.get(eventId);
    if (!event) return eventId;
    return language === "ar" ? event.title.ar : event.title.en;
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminGates"] });
      toast.success("Gate deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete gate");
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createGate>[0]) => createGate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminGates"] });
      toast.success("Gate created successfully");
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create gate");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Parameters<typeof updateGate>[1] }) => updateGate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminGates"] });
      toast.success("Gate updated successfully");
      setEditingGate(null);
      editForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update gate");
    }
  });

  const handleCreateSubmit = (data: CreateGateForm) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data: EditGateForm) => {
    if (!editingGate) return;
    updateMutation.mutate({ id: editingGate.id, data });
  };

  const startEditing = (gate: Gate) => {
    setEditingGate(gate);
    editForm.reset({ 
      name: gate.name,
      eventId: gate.eventId 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.gates}</h2>
          <p className="text-muted-foreground">{t.admin.gatesDesc}</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t.admin.createGate}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.admin.createGate}</DialogTitle>
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
                      <SelectTrigger><SelectValue placeholder="Select an event" /></SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>{language === "ar" ? event.title.ar : event.title.en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Gate Name</Label>
                <Input id="name" {...createForm.register("name", { required: true })} placeholder="Main Entrance, East Gate, etc." />
              </div>
              <DialogFooter><Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t.common.save}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t.admin.totalGates}</CardTitle><DoorOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{gates.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t.admin.activeGates}</CardTitle><DoorOpen className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{gates.filter((g) => g.status === "active").length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t.admin.totalStaff}</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{gates.reduce((sum, g) => sum + (g.staff || 0), 0)}</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.admin.gateName}</TableHead>
                    <TableHead>{t.admin.eventName || "Event"}</TableHead>
                    <TableHead>{t.admin.assignedStaff}</TableHead>
                    <TableHead>{t.admin.scansToday}</TableHead>
                    <TableHead>{t.admin.status}</TableHead>
                    <TableHead className="w-24">{t.admin.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gates.map((gate) => {
                    const event = events.find(e => e.id === gate.eventId);
                    const eventTitle = event ? (language === "ar" ? event.title.ar : event.title.en) : gate.eventId;
                    return (
                      <TableRow key={gate.id}>
                        <TableCell><div className="flex items-center gap-2"><DoorOpen className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{gate.name}</span></div></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{eventTitle}</TableCell>
                        <TableCell><Badge variant="secondary">{gate.staff || 0}</Badge></TableCell>
                        <TableCell>{gate.scansToday || 0}</TableCell>
                        <TableCell><Badge className={gate.status === "active" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground"}>{gate.status === "active" ? t.admin.active : t.admin.inactive}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => startEditing(gate)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { if (window.confirm(t.admin.confirmDelete || "Are you sure?")) { deleteMutation.mutate(gate.id); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      <Dialog open={!!editingGate} onOpenChange={(open) => !open && setEditingGate(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.common.edit}</DialogTitle></DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event</Label>
              <Controller
                name="eventId"
                control={editForm.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select an event" /></SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>{language === "ar" ? event.title.ar : event.title.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Gate Name</Label>
              <Input id="edit-name" {...editForm.register("name", { required: true })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditingGate(null)}>{t.common.cancel}</Button>
              <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t.common.save}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
