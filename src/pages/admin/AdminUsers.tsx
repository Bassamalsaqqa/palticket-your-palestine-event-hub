import { useState } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

const mockUsers = [
  { id: "1", name: "Ahmad Hassan", email: "ahmad@email.com", role: "admin", orders: 5, joined: "2024-06-15" },
  { id: "2", name: "Sara Khalil", email: "sara@email.com", role: "user", orders: 12, joined: "2024-08-20" },
  { id: "3", name: "Omar Nasser", email: "omar@email.com", role: "organizer", orders: 3, joined: "2024-09-10" },
  { id: "4", name: "Layla Mahmoud", email: "layla@email.com", role: "user", orders: 8, joined: "2024-10-05" },
  { id: "5", name: "Khaled Ali", email: "khaled@email.com", role: "scanner", orders: 0, joined: "2024-11-12" },
  { id: "6", name: "Nadia Yousef", email: "nadia@email.com", role: "user", orders: 15, joined: "2024-07-22" },
];

export default function AdminUsers() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "organizer":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "scanner":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleAction = (action: string) => {
    toast.info(`${action} - not implemented`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.users}</h2>
          <p className="text-muted-foreground">{t.admin.usersDesc}</p>
        </div>
        <Button onClick={() => handleAction("Create user")}>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.user}</TableHead>
                  <TableHead>{t.admin.role}</TableHead>
                  <TableHead>{t.admin.orders}</TableHead>
                  <TableHead>{t.admin.joined}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{user.orders}</TableCell>
                    <TableCell>{user.joined}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("Edit")}>
                            <Edit className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            {t.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Change role")}>
                            <Shield className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            {t.admin.changeRole}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction("Delete")}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            {t.common.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
