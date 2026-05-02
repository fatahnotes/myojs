import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      const r = await api.get("/users");
      setUsers(r.data);
    } catch (e) { toast.error(formatApiError(e)); }
  };
  useEffect(() => { load(); }, []);

  const updateRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      toast.success("Role updated");
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };
  const del = async (id) => {
    if (!confirm("Delete this user?")) return;
    try { await api.delete(`/users/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="overline text-[#002FA7]">— Admin</div>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tighter font-bold mt-2">User Management</h1>
      </header>
      <Card className="rounded-sm border border-gray-200 shadow-none p-0 overflow-hidden bg-white">
        <Table data-testid="users-table">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-mono text-[11px] uppercase tracking-wider">Name</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider">Email</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider">Role</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider">Affiliation</TableHead>
              <TableHead className="text-right font-mono text-[11px] uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-sm text-gray-600">{u.email}</TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(v) => updateRole(u.id, v)}>
                    <SelectTrigger data-testid={`role-select-${u.id}`} className="rounded-sm w-36 h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="author">Author</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{u.affiliation}</TableCell>
                <TableCell className="text-right">
                  <Button data-testid={`delete-user-${u.id}`} variant="ghost" size="sm" onClick={() => del(u.id)} className="text-red-600 hover:text-red-700 rounded-sm">
                    <Trash2 size={14}/>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
