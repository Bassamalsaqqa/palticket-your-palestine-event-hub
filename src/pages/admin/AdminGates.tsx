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
import { fetchAllGates, deleteGate, createGate } from "@/services/gatesService";
import { fetchAllEvents } from "@/services/eventsService";
import { useForm, Controller } from "react-hook-form";

interface CreateGateForm {
  eventId: string;
  name: string;
}

export default function AdminGates() {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { register, handleSubmit, control, reset } = useForm<CreateGateForm>();

  const { data: gates = [], isLoading } = useQuery({
    queryKey: ["adminGates"],
    queryFn: () => fetchAllGates(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["adminEventsListForGates"],
    queryFn: () => fetchAllEvents(language),
  });

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
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create gate");
    }
  });

  const onSubmit = (data: CreateGateForm) => {
    createMutation.mutate(data);
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Event</Label>
                <Controller
                  name="eventId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {language === "ar" ? event.title.ar : event.title.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Gate Name</Label>
                <Input id="name" {...register("name", { required: true })} placeholder="Main Entrance, East Gate, etc." />
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.totalGates}
            </CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.activeGates}
            </CardTitle>
            <DoorOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gates.filter((g) => g.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.totalStaff}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gates.reduce((sum, g) => sum + (g.staff || 0), 0)}
            </div>
          </CardContent>
        </Card>
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
                    <TableHead>{t.admin.gateName}</TableHead>
                    <TableHead>{t.admin.event}</TableHead>
                    <TableHead>{t.admin.assignedStaff}</TableHead>
                    <TableHead>{t.admin.scansToday}</TableHead>
                    <TableHead>{t.admin.status}</TableHead>
                    <TableHead className="w-24">{t.admin.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gates.map((gate) => {
                    const event = events.find((e) => e.id === gate.eventId);
                    const eventTitle = event 
                      ? (language === "ar" ? event.title.ar : event.title.en)
                      : gate.eventId;

                    return (
                      <TableRow key={gate.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {gate.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{eventTitle}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{gate.staff || 0}</Badge>
                        </TableCell>
                        <TableCell>{gate.scansToday || 0}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              gate.status === "active"
                                ? "bg-green-500/10 text-green-600 border-green-500/20"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {gate.status === "active" ? t.admin.active : t.admin.inactive}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toast.info("Edit - not implemented")}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (window.confirm(t.admin.confirmDelete || "Are you sure?")) {
                                  deleteMutation.mutate(gate.id);
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
    </div>
  );
}