"use client";

import { useEffect, useState, useMemo } from "react";
import Nav from "@/components/Nav";
import { MapPin, User, ArrowRight, Loader2, ChevronRight, Activity, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTalukas, setExpandedTalukas] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/employee/profile").then(res => res.json()),
      fetch("/api/employee/assignments").then(res => res.json())
    ]).then(([profileData, assignmentData]) => {
      setProfile(profileData);
      if (Array.isArray(assignmentData)) {
        setAssignments(assignmentData);
        if (assignmentData.length > 0) {
           setExpandedTalukas([assignmentData[0].taluka]);
        }
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const groupedAssignments = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    assignments.forEach(a => {
      if (!groups[a.taluka]) groups[a.taluka] = [];
      groups[a.taluka].push(a);
    });
    return groups;
  }, [assignments]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Nav role="employee" />
      
      <main className="px-4 md:px-8 max-w-5xl mx-auto space-y-8 mt-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome, {profile?.name || 'User'}
            </h1>
            <p className="text-slate-500 text-sm">Review your assigned zones and profile information</p>
          </div>
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">{new Date().toLocaleDateString()}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Info */}
          <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <User className="w-5 h-5 mr-3 text-indigo-600" />
                Profile Info
              </h2>
              <Link href="/employee/profile" className="text-xs font-bold text-indigo-600 hover:underline">
                Edit Profile
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile</p>
                <p className="text-base font-bold text-slate-900">{profile?.phone || 'Not set'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vehicle</p>
                <p className="text-base font-bold text-slate-900 capitalize">{profile?.vehicle_type || 'None'}</p>
              </div>
              <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                <p className="text-sm text-slate-600 font-medium">{profile?.address || 'No address provided.'}</p>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="bg-indigo-600 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between">
            <div>
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider mb-1">Active Scope</p>
              <h2 className="text-5xl font-bold">{assignments.length}</h2>
              <p className="text-indigo-200 text-xs mt-2 font-medium">Assigned Zones</p>
            </div>
            
            <Link href="/employee/assignments" className="mt-8 w-full flex items-center justify-center space-x-2 bg-white text-indigo-700 rounded-xl py-4 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all">
              <span>Manage Zones</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Assignments */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 px-1">My Assignments</h2>

          {loading ? (
            <div className="py-20 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs font-medium text-slate-400">Loading assignments...</p>
            </div>
          ) : assignments.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedAssignments).map(([taluka, groupPins]) => {
                const isExpanded = expandedTalukas.includes(taluka);
                return (
                  <div key={taluka} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div 
                      onClick={() => setExpandedTalukas(prev => isExpanded ? prev.filter(t => t !== taluka) : [...prev, taluka])}
                      className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <ChevronRight className={cn("w-5 h-5 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                        <div>
                          <p className="font-bold text-slate-900 uppercase text-sm">{taluka}</p>
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{groupPins.length} Zones</p>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {groupPins.map((a, i) => (
                          <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                              {a.pincode[0]}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-slate-900 text-sm">{a.pincode}</p>
                              <p className="text-[10px] text-slate-400 truncate uppercase">{a.area}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
              <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No Assignments</h3>
              <p className="text-slate-400 text-sm mb-8">You haven't been assigned to any zones yet.</p>
              <Link href="/employee/assignments" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm">
                Go to Assignments
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
