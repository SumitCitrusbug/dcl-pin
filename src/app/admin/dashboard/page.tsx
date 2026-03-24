"use client";

import { useEffect, useState, cloneElement } from "react";
import Nav from "@/components/Nav";
import { Users, Lock, UserCheck, Shield, ChevronRight, Loader2, BarChart3 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEmployees(data);
        setLoading(false);
      });
  }, []);

  const employeeList = employees.filter(u => u.role === 'employee');
  const lockedCount = employeeList.filter(e => e.is_locked).length;
  const activeCount = employeeList.length - lockedCount;
  const adminCount = employees.filter(e => e.role === 'admin').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Nav role="admin" />
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 mt-4">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 text-sm">Manage your team and account status</p>
          </div>
          <Link href="/admin/employees" className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm">
            Manage Employees
          </Link>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Employees" value={employeeList.length} icon={<Users />} color="indigo" />
          <StatCard title="Active Accounts" value={activeCount} icon={<UserCheck />} color="emerald" />
          <StatCard title="Locked Accounts" value={lockedCount} icon={<Lock />} color="rose" />
          <StatCard title="Admins" value={adminCount} icon={<Shield />} color="slate" />
        </section>

        {/* Content Grid */}
        <section className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Recent Employees</h2>
              <Link href="/admin/employees" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                View All
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-xs font-medium text-slate-400">Loading data...</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employeeList.slice(0, 5).map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 uppercase text-xs">
                              {emp.name ? emp.name[0] : emp.email[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{emp.name || 'No Name'}</p>
                              <p className="text-xs text-slate-400">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 bg-slate-100 rounded-md">
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold",
                            emp.is_locked ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {emp.is_locked ? 'Locked' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactElement; color: 'indigo' | 'emerald' | 'rose' | 'slate' }) {
  const iconColors = {
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    rose: "text-rose-600 bg-rose-50",
    slate: "text-slate-600 bg-slate-50",
  }[color];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconColors)}>
        {cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-900 leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}
