import { useState } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Loader2, Globe, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllEvents, deleteEvent, createEvent, updateEvent, fetchCategories, fetchCities } from "@/services/eventsService";
import { fetchAllVenues } from "@/services/venuesService";
import { useForm, Controller } from "react-hook-form";
import { Event } from "@/types/domain";

type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

interface EventFormValues {
  slug: string;
  startTime: string;
  venueId?: string;
  categoryId?: string;
  cityId?: string;
  status: EventStatus;
  nameEn: string;
  descEn: string;
  summaryEn: string;
  nameAr: string;
  descAr: string;
  summaryAr: string;
}

export default function AdminEvents() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const queryClient = useQueryClient();
  
  const createForm = useForm<EventFormValues>({
    defaultValues: { status: "DRAFT" }
  });
  
  const editForm = useForm<EventFormValues>();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["adminEvents", language],
    queryFn: () => fetchAllEvents(language),
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["adminVenues", language],
    queryFn: () => fetchAllVenues(language),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["adminCategories", language],
    queryFn: () => fetchCategories(language),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["adminCities", language],
    queryFn: () => fetchCities(language),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEvents", language] });
      toast.success("Event deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete event");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createEvent>[0]) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEvents", language] });
      toast.success("Event created successfully");
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Parameters<typeof updateEvent>[1] }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEvents", language] });
      toast.success("Event updated successfully");
      setEditingEvent(null);
      editForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update event");
    },
  });

  const handleCreateSubmit = (data: EventFormValues) => {
    createMutation.mutate({
      slug: data.slug,
      startTime: new Date(data.startTime).toISOString(),
      venueId: data.venueId || undefined,
      categoryId: data.categoryId || undefined,
      cityId: data.cityId || undefined,
      translations: [
        { locale: 'en', name: data.nameEn, description: data.descEn, summary: data.summaryEn },
        { locale: 'ar', name: data.nameAr, description: data.descAr, summary: data.summaryAr },
      ]
    });
  };

  const handleEditSubmit = (data: EventFormValues) => {
    if (!editingEvent) return;
    updateMutation.mutate({
      id: editingEvent.id,
      data: {
        slug: data.slug,
        startTime: new Date(data.startTime).toISOString(),
        venueId: data.venueId || undefined,
        categoryId: data.categoryId || undefined,
        cityId: data.cityId || undefined,
        status: data.status,
        translations: [
          { locale: 'en', name: data.nameEn, description: data.descEn, summary: data.summaryEn },
          { locale: 'ar', name: data.nameAr, description: data.descAr, summary: data.summaryAr },
        ]
      }
    });
  };

  const toggleStatus = (event: Event) => {
    const newStatus: EventStatus = event.status === "past" ? "PUBLISHED" : (event.status === "upcoming" || event.status === "ongoing" ? "DRAFT" : "PUBLISHED");
    // status mapping is a bit loose here since UI uses upcoming/ongoing/past while backend uses DRAFT/PUBLISHED
    // Let's just do a simple toggle for demo purposes
    const targetStatus: EventStatus = event.status === "upcoming" ? "DRAFT" : "PUBLISHED";
    
    updateMutation.mutate({
      id: event.id,
      data: { status: targetStatus }
    });
  };

  const startEditing = (event: Event) => {
    setEditingEvent(event);
    editForm.reset({
      slug: event.slug,
      startTime: event.date + "T" + event.time,
      venueId: event.venueId,
      categoryId: event.categoryId || categories.find(c => c.id === event.category)?.id,
      cityId: event.cityId || cities.find(c => c.name.en === event.venue.city.en)?.id,
      status: event.status === "upcoming" ? "PUBLISHED" : "DRAFT", 
      nameEn: event.title.en,
      nameAr: event.title.ar,
      descEn: event.description.en,
      descAr: event.description.ar,
      summaryEn: event.title.en,
      summaryAr: event.title.ar,
    });
  };

  const filteredEvents = events.filter((event) => {
    const title = language === "ar" ? event.title.ar : event.title.en;
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "ongoing": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "past": return "bg-muted text-muted-foreground";
      case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.events}</h2>
          <p className="text-muted-foreground">{t.admin.eventsDesc}</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t.admin.createEvent}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.admin.createEvent}</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Event Slug</Label>
                  <Input id="slug" {...createForm.register("slug", { required: true })} placeholder="my-awesome-event" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="datetime-local" {...createForm.register("startTime", { required: true })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Venue</Label>
                  <Controller
                    name="venueId"
                    control={createForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                        <SelectContent>{venues.map((v) => (<SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>))}</SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Controller
                    name="categoryId"
                    control={createForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name[language] || c.name.en}</SelectItem>))}</SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Controller
                    name="cityId"
                    control={createForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                        <SelectContent>{cities.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name[language] || c.name.en}</SelectItem>))}</SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">English Details</h3>
                <div className="space-y-2"><Label>Name</Label><Input {...createForm.register("nameEn", { required: true })} /></div>
                <div className="space-y-2"><Label>Summary</Label><Input {...createForm.register("summaryEn")} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea {...createForm.register("descEn")} /></div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Arabic Details</h3>
                <div className="space-y-2"><Label>Name (Arabic)</Label><Input {...createForm.register("nameAr", { required: true })} dir="rtl" /></div>
                <div className="space-y-2"><Label>Summary (Arabic)</Label><Input {...createForm.register("summaryAr")} dir="rtl" /></div>
                <div className="space-y-2"><Label>Description (Arabic)</Label><Textarea {...createForm.register("descAr")} dir="rtl" /></div>
              </div>

              <DialogFooter><Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t.common.save}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t.admin.searchEvents} value={search} onChange={(e) => setSearch(e.target.value)} className="ltr:pl-9 rtl:pr-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.admin.eventName}</TableHead>
                    <TableHead>{t.admin.date}</TableHead>
                    <TableHead>{t.admin.venue}</TableHead>
                    <TableHead>{t.admin.status}</TableHead>
                    <TableHead>{t.admin.ticketsSold}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={event.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                          <span className="font-medium">{language === "ar" ? event.title.ar : event.title.en}</span>
                        </div>
                      </TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{language === "ar" ? event.venue.city.ar : event.venue.city.en}</TableCell>
                      <TableCell><Badge className={getStatusColor(event.status)}>{event.status}</Badge></TableCell>
                      <TableCell>{event.ticketTiers.reduce((sum, t) => sum + (t.total - t.available), 0)} / {event.ticketTiers.reduce((sum, t) => sum + t.total, 0)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => toggleStatus(event)} title={event.status === "upcoming" ? "Unpublish" : "Publish"}>
                            {event.status === "upcoming" ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.info("View details - not implemented")}><Eye className="h-4 w-4 ltr:mr-2 rtl:ml-2" />{t.common.view}</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => startEditing(event)}><Edit className="h-4 w-4 ltr:mr-2 rtl:ml-2" />{t.common.edit}</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { if (window.confirm(t.admin.confirmDelete || "Are you sure?")) { deleteMutation.mutate(event.id); } }} className="text-destructive"><Trash2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />{t.common.delete}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t.common.edit}</DialogTitle></DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="edit-slug">Event Slug</Label><Input id="edit-slug" {...editForm.register("slug", { required: true })} /></div>
              <div className="space-y-2"><Label htmlFor="edit-startTime">Start Time</Label><Input id="edit-startTime" type="datetime-local" {...editForm.register("startTime", { required: true })} /></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={editForm.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">DRAFT</SelectItem>
                        <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                        <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Venue</Label>
                <Controller
                  name="venueId"
                  control={editForm.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                      <SelectContent>{venues.map((v) => (<SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>))}</SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  name="categoryId"
                  control={editForm.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name[language] || c.name.en}</SelectItem>))}</SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Controller
                  name="cityId"
                  control={editForm.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent>{cities.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name[language] || c.name.en}</SelectItem>))}</SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">English Details</h3>
              <div className="space-y-2"><Label>Name</Label><Input {...editForm.register("nameEn", { required: true })} /></div>
              <div className="space-y-2"><Label>Summary</Label><Input {...editForm.register("summaryEn")} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea {...editForm.register("descEn")} /></div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Arabic Details</h3>
              <div className="space-y-2"><Label>Name (Arabic)</Label><Input {...editForm.register("nameAr", { required: true })} dir="rtl" /></div>
              <div className="space-y-2"><Label>Summary (Arabic)</Label><Input {...editForm.register("summaryAr")} dir="rtl" /></div>
              <div className="space-y-2"><Label>Description (Arabic)</Label><Textarea {...editForm.register("descAr")} dir="rtl" /></div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditingEvent(null)}>{t.common.cancel}</Button>
              <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t.common.save}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}