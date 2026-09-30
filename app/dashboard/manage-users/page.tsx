"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, THead, TRow, TH, TD, Empty } from "@/components/ui/bits";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const d = await fetch("/api/users").then((r) => r.json()).catch(() => ({ users: [] }));
    setUsers(d.users || []);
  }
  useEffect(() => { const t = setTimeout(() => load(), 0); return () => clearTimeout(t); }, []);

  async function changeRole(id: string, role: string) {
    const r = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, role }) });
    setMsg(r.ok ? `Role updated to ${role}.` : "Update failed");
    load();
  }

  async function remove(id: string, email: string) {
    if (!confirm(`Remove user ${email}?`)) return;
    const r = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
    setMsg(r.ok ? "User removed." : "Delete failed");
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold">Manage Users</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{users.length} users · change roles or remove accounts.</p>
      {msg && <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{msg}</p>}
      {users.length === 0 ? <div className="mt-3"><Empty title="No users" /></div> : (
        <Table>
          <THead><TRow><TH>User</TH><TH>Email</TH><TH>Role</TH><TH>Coins</TH><TH>Actions</TH></TRow></THead>
          <tbody>
            {users.map((u: Record<string, unknown>) => (
              <TRow key={String(u._id)}>
                <TD>
                  <span className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={String(u.image || "/avatar.png")} alt="" className="h-7 w-7 rounded-full object-cover" />
                    <span className="font-semibold">{String(u.name)}</span>
                  </span>
                </TD>
                <TD className="text-xs">{String(u.email)}</TD>
                <TD>
                  <select value={String(u.role)} onChange={(e) => changeRole(String(u._id), e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800">
                    <option value="worker">Worker</option>
                    <option value="buyer">Buyer</option>
                    <option value="admin">Admin</option>
                  </select>
                </TD>
                <TD className="font-bold">{Number(u.coins)}</TD>
                <TD><Button size="sm" variant="destructive" onClick={() => remove(String(u._id), String(u.email))}>Remove</Button></TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
