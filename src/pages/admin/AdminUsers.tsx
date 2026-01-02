import { useState } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, MoreHorizontal, Edit, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, updateMemberRole, type OrganizationMember } from "@/services/membersService";
import { updateUserProfile } from "@/services/usersService";
import { useForm, Controller } from "react-hook-form";

interface EditUserForm {
  name: string;
  phone: string;
}

interface ChangeRoleForm {
  role: "ADMIN" | "STAFF";
}

export default function AdminUsers() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [changingRoleMember, setChangingRoleMember] = useState<OrganizationMember | null>(null);
  
  const queryClient = useQueryClient();
  const editForm = useForm<EditUserForm>();
  const roleForm = useForm<ChangeRoleForm>();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin", "members"],
    queryFn: () => fetchMembers(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: EditUserForm }) => updateUserProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      toast.success("User profile updated");
      setEditingMember(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string, role: "ADMIN" | "STAFF" }) => updateMemberRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      toast.success("User role updated");
      setChangingRoleMember(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    }
  });

  const filteredMembers = members.filter((member) =>
    (member.user.name || "").toLowerCase().includes(search.toLowerCase()) ||
    member.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "STAFF":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const startEditing = (member: OrganizationMember) => {
    setEditingMember(member);
    editForm.reset({
      name: member.user.name || "",
      phone: member.user.phone || "",
    });
  };

  const startChangingRole = (member: OrganizationMember) => {
    setChangingRoleMember(member);
    roleForm.reset({
      role: member.role,
    });
  };

  const handleEditSubmit = (data: EditUserForm) => {
    if (!editingMember) return;
    updateProfileMutation.mutate({ id: editingMember.user.id, data });
  };

  const handleRoleSubmit = (data: ChangeRoleForm) => {
    if (!changingRoleMember) return;
    updateRoleMutation.mutate({ id: changingRoleMember.id, role: data.role });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.users}</h2>
          <p className="text-muted-foreground">{t.admin.usersDesc}</p>
        </div>
        <Button onClick={() => toast.info("Invite functionality coming soon")}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t.admin.addUser}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.admin.searchUsers}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ltr:pl-9 rtl:pr-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.admin.user}</TableHead>
                    <TableHead>{t.admin.role}</TableHead>
                    <TableHead>{t.admin.joined}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.user.name || "---"}</p>
                            <p className="text-sm text-muted-foreground">{member.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
                      </TableCell>
                      <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditing(member)}>
                              <Edit className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                              {t.common.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => startChangingRole(member)}>
                              <Shield className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                              {t.admin.changeRole}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.common.edit}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...editForm.register("name", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...editForm.register("phone")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditingMember(null)}>{t.common.cancel}</Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.common.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!changingRoleMember} onOpenChange={(open) => !open && setChangingRoleMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.changeRole}</DialogTitle>
          </DialogHeader>
          <form onSubmit={roleForm.handleSubmit(handleRoleSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Controller
                name="role"
                control={roleForm.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="STAFF">STAFF</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setChangingRoleMember(null)}>{t.common.cancel}</Button>
              <Button type="submit" disabled={updateRoleMutation.isPending}>
                {updateRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.common.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
