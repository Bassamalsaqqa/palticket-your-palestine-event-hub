import { useState } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Plus, Edit, Trash2, UserCog, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, updateMemberRole, type OrganizationMember } from "@/services/membersService";
import { useForm, Controller } from "react-hook-form";

interface ChangeRoleForm {
  role: "ADMIN" | "STAFF";
}

export default function AdminStaff() {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [changingRoleMember, setChangingRoleMember] = useState<OrganizationMember | null>(null);
  
  const roleForm = useForm<ChangeRoleForm>();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin", "members"],
    queryFn: () => fetchMembers(),
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

  const staffMembers = members.filter(m => m.role === "STAFF");

  const handleAction = (action: string) => {
    toast.info(`${action} - not implemented`);
  };

  const startChangingRole = (member: OrganizationMember) => {
    setChangingRoleMember(member);
    roleForm.reset({
      role: member.role,
    });
  };

  const handleRoleSubmit = (data: ChangeRoleForm) => {
    if (!changingRoleMember) return;
    updateRoleMutation.mutate({ id: changingRoleMember.id, role: data.role });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.staff}</h2>
          <p className="text-muted-foreground">{t.admin.staffDesc}</p>
        </div>
        <Button onClick={() => toast.info("Invite functionality coming soon")}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t.admin.assignStaff}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.totalMembers || "Total Members"}
            </CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.admins || "Admins"}
            </CardTitle>
            <UserCog className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter((m) => m.role === "ADMIN").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.staff || "Staff"}
            </CardTitle>
            <UserCog className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffMembers.length}
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
                    <TableHead>{t.admin.staffMember}</TableHead>
                    <TableHead>{t.admin.role}</TableHead>
                    <TableHead>{t.admin.joined}</TableHead>
                    <TableHead className="w-24">{t.admin.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.user.name || member.user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startChangingRole(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast.info("Removal not implemented")}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
