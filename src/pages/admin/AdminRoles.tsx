import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Shield, Calendar, ShoppingCart, QrCode, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchMembers } from "@/services/membersService";

const allPermissions = [
  { id: "events.manage", label: "Manage Events", labelAr: "إدارة الفعاليات", icon: Calendar },
  { id: "tickets.view", label: "View Tickets", labelAr: "عرض التذاكر", icon: QrCode },
  { id: "tickets.checkin", label: "Check-in Tickets", labelAr: "تسجيل دخول التذاكر", icon: QrCode },
  { id: "orders.view", label: "View Orders", labelAr: "عرض الطلبات", icon: ShoppingCart },
  { id: "orders.manage", label: "Manage Orders", labelAr: "إدارة الطلبات", icon: ShoppingCart },
  { id: "users.view", label: "View Users", labelAr: "عرض المستخدمين", icon: Settings },
  { id: "users.manage", label: "Manage Users", labelAr: "إدارة المستخدمين", icon: Settings },
  { id: "exports.create", label: "Create Exports", labelAr: "إنشاء التصديرات", icon: Settings },
  { id: "scanner.use", label: "Use Scanner", labelAr: "استخدام الماسح", icon: Shield },
];

export default function AdminRoles() {
  const { language, t } = useLanguage();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin", "members"],
    queryFn: () => fetchMembers(),
  });

  const roles = [
    {
      id: "ADMIN",
      name: "Admin",
      nameAr: "مسؤول",
      users: members.filter(m => m.role === "ADMIN").length,
      color: "#ef4444",
      permissions: ["all"],
    },
    {
      id: "STAFF",
      name: "Staff",
      nameAr: "طاقم عمل",
      users: members.filter(m => m.role === "STAFF").length,
      color: "#3b82f6",
      permissions: ["scanner.use", "tickets.checkin", "tickets.view"],
    }
  ];

  const handleAction = (action: string) => {
    toast.info(`${action} - not implemented`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.roles}</h2>
          <p className="text-muted-foreground">{t.admin.rolesDesc}</p>
        </div>
        <Button onClick={() => handleAction("Create role")}>
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
                        {language === "ar" ? role.nameAr : role.name}
                      </CardTitle>
                      <CardDescription>
                        {role.users} {t.admin.users}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("Edit role")}
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
                            {language === "ar" ? permission.labelAr : permission.label}
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
                      {language === "ar" ? role.nameAr : role.name}
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
                        <span>{language === "ar" ? permission.labelAr : permission.label}</span>
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
    </div>
  );
}