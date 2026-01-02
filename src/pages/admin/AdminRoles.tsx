import { useState } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Shield, Calendar, ShoppingCart, QrCode, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, updateMemberRole, type OrganizationMember } from "@/services/membersService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";

const AdminRoles = () => {
  const { language, t } = useLanguage();
  
  const allPermissions = [
    { id: "events.manage", label: t.permissions.events_manage, icon: Calendar },
    { id: "tickets.view", label: t.permissions.tickets_view, icon: QrCode },
    { id: "tickets.checkin", label: t.permissions.tickets_checkin, icon: QrCode },
    { id: "orders.view", label: t.permissions.orders_view, icon: ShoppingCart },
    { id: "orders.manage", label: t.permissions.orders_manage, icon: ShoppingCart },
    { id: "users.view", label: t.permissions.users_view, icon: Settings },
    { id: "users.manage", label: t.permissions.users_manage, icon: Settings },
    { id: "exports.create", label: t.permissions.exports_create, icon: Settings },
    { id: "scanner.use", label: t.permissions.scanner_use, icon: Shield },
  ];

  const queryClient = useQueryClient();
  const [changingMember, setChangingMember] = useState<OrganizationMember | null>(null);
  
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin", "members"],
    queryFn: () => fetchMembers(),
  });

  const roleForm = useForm<ChangeRoleForm>();

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string, role: "ADMIN" | "STAFF" }) => updateMemberRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      toast.success("User role updated");
      setChangingMember(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    }
  });

  const roles = [
    {
      id: "ADMIN",
      name: t.roleNames.admin,
      users: members.filter(m => m.role === "ADMIN").length,
      color: "#ef4444",
      permissions: ["all"],
    },
    {
      id: "STAFF",
      name: t.roleNames.staff,
      users: members.filter(m => m.role === "STAFF").length,
      color: "#3b82f6",
      permissions: ["scanner.use", "tickets.checkin", "tickets.view"],
    }
  ];

  const startChangingRole = (role: string) => {
    // Just a demo: find first member of this role to "edit"
    const member = members.find(m => m.role === role);
    if (member) {
      setChangingMember(member);
      roleForm.reset({
        memberId: member.id,
        role: member.role,
      });
    } else {
      toast.info("No members with this role to edit");
    }
  };

  const handleRoleSubmit = (data: ChangeRoleForm) => {
    updateRoleMutation.mutate({ id: data.memberId, role: data.role });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.roles}</h2>
          <p className="text-muted-foreground">{t.admin.rolesDesc}</p>
        </div>
        <Button onClick={() => toast.info("Role creation coming soon")}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t.admin.createRole}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${role.color}20` }}
                    >
                      <Shield className="h-5 w-5" style={{ color: role.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {role.name}
                      </CardTitle>
                      <CardDescription>
                        {role.users} {t.admin.users}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startChangingRole(role.id)}
                  >
                    {t.common.edit}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {role.permissions[0] === "all" ? (
                    <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                      {t.admin.fullAccess}
                    </Badge>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((perm) => {
                        const permission = allPermissions.find((p) => p.id === perm);
                        if (!permission) return null;
                        return (
                          <Badge key={perm} variant="secondary">
                            {permission.label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.permissionsMatrix}</CardTitle>
          <CardDescription>{t.admin.permissionsMatrixDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left rtl:text-right p-3 font-medium">{t.admin.permission}</th>
                  {roles.map((role) => (
                    <th key={role.id} className="p-3 text-center font-medium">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPermissions.map((permission) => (
                  <tr key={permission.id} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <permission.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{permission.label}</span>
                      </div>
                    </td>
                    {roles.map((role) => (
                      <td key={role.id} className="p-3 text-center">
                        <Switch
                          checked={role.permissions[0] === "all" || role.permissions.includes(permission.id)}
                          disabled
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={!!changingMember} onOpenChange={(open) => !open && setChangingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.changeRole}</DialogTitle>
          </DialogHeader>
          <form onSubmit={roleForm.handleSubmit(handleRoleSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Member: {changingMember?.user.name || changingMember?.user.email}</Label>
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
              <Button type="button" variant="ghost" onClick={() => setChangingMember(null)}>{t.common.cancel}</Button>
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
};

export default AdminRoles;
