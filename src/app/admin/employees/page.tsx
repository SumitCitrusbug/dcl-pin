"use client";

import { useEffect, useState, useMemo } from "react";
import Nav from "@/components/Nav";
import { Users, Lock, Unlock, Search, Trash2, Loader2, ChevronRight, CheckSquare, Square, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import useToast from "@/components/Toast";

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<number | null>(null);
  const [selectedDist, setSelectedDist] = useState<string>("");
  const [selectedPins, setSelectedPins] = useState<number[]>([]);
  const [selectedRemovalPins, setSelectedRemovalPins] = useState<number[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPins, setLoadingPins] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedTalukas, setExpandedTalukas] = useState<string[]>([]);
  const [expandedMyTalukas, setExpandedMyTalukas] = useState<string[]>([]);
  const { showToast, ToastComponent } = useToast();

  const loadUsers = async () => {
  const res = await fetch("/api/users", { cache: "no-store" });
  const data = await res.json();
  setEmployees(data);
};

useEffect(() => {
  loadUsers();
  fetch("/api/districts").then(res => res.json()).then(setDistricts);
}, []);

  useEffect(() => {
    if (selectedEmp) {
      setLoadingAssignments(true);
      setSelectedPins([]);
      setSelectedRemovalPins([]);
      fetch(`/api/employee/assignments?userId=${selectedEmp}`)
        .then(res => res.json())
        .then(data => {
          setCurrentAssignments(Array.isArray(data) ? data : []);
          if (data && data.length > 0) setExpandedMyTalukas([data[0].taluka]);
          setLoadingAssignments(false);
        });
    } else {
      setCurrentAssignments([]);
    }
  }, [selectedEmp]);

  useEffect(() => {
    if (selectedDist) {
      setLoadingPins(true);
      setSelectedPins([]);
      fetch(`/api/pincodes?district_id=${selectedDist}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPincodes(data);
            if (data.length > 0) setExpandedTalukas([data[0].taluka]);
          }
          setLoadingPins(false);
        });
    } else {
      setPincodes([]);
    }
  }, [selectedDist]);

  const groupedPincodes = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    pincodes.forEach(p => {
      if (!groups[p.taluka]) groups[p.taluka] = [];
      groups[p.taluka].push(p);
    });
    return groups;
  }, [pincodes]);

  const groupedAssignments = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    currentAssignments.forEach(a => {
      if (!groups[a.taluka]) groups[a.taluka] = [];
      groups[a.taluka].push(a);
    });
    return groups;
  }, [currentAssignments]);

  const toggleLock = async (userId: number, currentLocked: boolean) => {
    const res = await fetch("/api/admin/lock", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, is_locked: !currentLocked }),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      setEmployees(emps => emps.map(e => e.id === userId ? { ...e, is_locked: !currentLocked } : e));
      showToast(currentLocked ? "Account unlocked" : "Account locked", "success");
    }
  };

  const handleAssign = async () => {
    if (!selectedEmp || !selectedDist || selectedPins.length === 0) return;
    setActionLoading(true);
    const res = await fetch("/api/admin/assign", {
      method: "POST",
      body: JSON.stringify({ employee_id: selectedEmp, district_id: selectedDist, pincode_ids: selectedPins }),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      showToast("Zones assigned successfully!", "success");
      fetch(`/api/employee/assignments?userId=${selectedEmp}`).then(res => res.json()).then(setCurrentAssignments);
      setSelectedPins([]);
    }
    setActionLoading(false);
  };

  const handleRemove = async (pinIds: number[]) => {
    if (!selectedEmp || pinIds.length === 0) return;
    setActionLoading(true);
    const res = await fetch("/api/admin/assign", {
      method: "DELETE",
      body: JSON.stringify({ employee_id: selectedEmp, pincode_ids: pinIds }),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      showToast(pinIds.length > 1 ? `${pinIds.length} zones removed` : "Assignment removed", "info");
      setCurrentAssignments(prev => prev.filter(a => !pinIds.includes(a.pincode_id)));
      setSelectedRemovalPins(prev => prev.filter(id => !pinIds.includes(id)));
    }
    setActionLoading(false);
  };

  const toggleRemovalTaluka = (taluka: string, assignments: any[]) => {
    const allIds = assignments.map(a => a.pincode_id);
    const allSelected = allIds.every(id => selectedRemovalPins.includes(id));
    if (allSelected) {
      setSelectedRemovalPins(selectedRemovalPins.filter(id => !allIds.includes(id)));
    } else {
      setSelectedRemovalPins(Array.from(new Set([...selectedRemovalPins, ...allIds])));
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.role === 'employee' && 
    (e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || e.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedEmployeeData = employees.find(e => e.id === selectedEmp);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <Nav role="admin" />
      <main className="p-4 md:p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* Left Side: Employee List */}
        <div className="lg:col-span-4 space-y-6">
          <h1 className="text-2xl font-bold text-slate-900">Manage Team</h1>
          
          <div className="relative group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:border-indigo-600 outline-none text-sm font-medium"
            />
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin">
            {filteredEmployees.map(emp => (
              <div 
                key={emp.id} 
                onClick={() => setSelectedEmp(emp.id)}
                className={cn(
                  "p-4 rounded-xl bg-white border transition-all cursor-pointer flex justify-between items-center",
                  selectedEmp === emp.id ? "border-indigo-600 ring-2 ring-indigo-50" : "border-slate-200 shadow-sm"
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                    selectedEmp === emp.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {emp.name ? emp.name[0] : emp.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{emp.name || 'No Name'}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{emp.email}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLock(emp.id, emp.is_locked); }}
                  className={cn(
                    "p-2 rounded-lg transition-colors border shadow-sm",
                    emp.is_locked ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  )}
                >
                  {emp.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Assignment Management */}
        <div className="lg:col-span-8">
          {selectedEmp ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Employee Context Cell */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Selected Employee</p>
                      <h2 className="text-xl font-bold text-slate-900">{selectedEmployeeData?.name || selectedEmployeeData?.email || 'User'}</h2>
                      <p className="text-slate-500 text-xs">{selectedEmployeeData?.email}</p>
                    </div>
                   <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-700 font-bold text-xs border border-indigo-100">
                     {currentAssignments.length} Assignments
                   </div>
                 </div>

                  {/* Profile Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Info</p>
                      <p className="text-xs font-bold text-slate-700">{selectedEmployeeData?.phone || 'No Phone'}</p>
                      {selectedEmployeeData?.alternate_phone && <p className="text-[10px] text-slate-400 font-medium">Alt: {selectedEmployeeData.alternate_phone}</p>}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logistics</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-bold text-slate-700 capitalize">{selectedEmployeeData?.vehicle_type || 'No Vehicle'}</p>
                        {selectedEmployeeData?.vehicle_note && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">{selectedEmployeeData.vehicle_note}</span>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-h-12 overflow-y-auto">{selectedEmployeeData?.address || 'No address provided'}</p>
                    </div>
                  </div>
              </div>

              {/* Current Assignments */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Assigned Zones</h3>
                  {selectedRemovalPins.length > 0 && (
                    <button 
                      onClick={() => handleRemove(selectedRemovalPins)}
                      disabled={actionLoading}
                      className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 transition-all flex items-center space-x-2"
                    >
                      {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      <span>Remove {selectedRemovalPins.length} Selected</span>
                    </button>
                  )}
                </div>

                {loadingAssignments ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                ) : Object.keys(groupedAssignments).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedAssignments).map(([taluka, assignments]) => {
                      const isExpanded = expandedMyTalukas.includes(taluka);
                      const allIds = assignments.map(a => a.pincode_id);
                      const allSelected = allIds.every(id => selectedRemovalPins.includes(id));

                      return (
                        <div key={taluka} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                          <div 
                            onClick={() => setExpandedMyTalukas(prev => isExpanded ? prev.filter(t => t !== taluka) : [...prev, taluka])}
                            className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                          >
                             <div className="flex items-center space-x-3">
                               <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                               <span className="font-bold text-slate-900 text-sm uppercase">{taluka}</span>
                             </div>
                             <div className="flex items-center space-x-4">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); toggleRemovalTaluka(taluka, assignments); }}
                                 className="text-[10px] font-bold text-indigo-600 hover:underline"
                               >
                                 {allSelected ? 'Deselect All' : 'Select All'}
                               </button>
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{assignments.length} Zones</span>
                             </div>
                          </div>
                          {isExpanded && (
                            <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                               {assignments.map((a, i) => {
                                 const isSelected = selectedRemovalPins.includes(a.pincode_id);
                                 return (
                                   <div 
                                     key={i} 
                                     onClick={() => setSelectedRemovalPins(prev => isSelected ? prev.filter(id => id !== a.pincode_id) : [...prev, a.pincode_id])}
                                     className={cn(
                                       "bg-white p-3 rounded-xl border flex items-center justify-between group cursor-pointer transition-all",
                                       isSelected ? "border-rose-300 bg-rose-50/30" : "border-slate-100 shadow-sm"
                                     )}
                                   >
                                      <div className="flex items-center space-x-3 overflow-hidden">
                                        <div className={cn(
                                          "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px]",
                                          isSelected ? "bg-rose-100 text-rose-600" : "bg-indigo-50 text-indigo-600"
                                        )}>
                                          {a.pincode[0]}
                                        </div>
                                        <div className="overflow-hidden">
                                          <p className={cn("font-bold text-xs", isSelected ? "text-rose-900" : "text-slate-900")}>{a.pincode}</p>
                                          <p className="text-[9px] text-slate-400 truncate uppercase font-bold">{a.area}</p>
                                          <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-tighter">{a.taluka}</span>
                                            <span className="text-[8px] bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-500 font-bold uppercase tracking-tighter">{a.district_name}</span>
                                          </div>
                                       </div>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <div className={cn(
                                          "w-5 h-5 rounded flex items-center justify-center border transition-all",
                                          isSelected ? "bg-rose-600 border-rose-600 text-white shadow-sm" : "border-slate-300 shadow-sm"
                                        )}>
                                          {isSelected && <CheckSquare className="w-4 h-4" />}
                                        </div>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleRemove([a.pincode_id]); }} 
                                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all font-medium"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                   </div>
                                 );
                               })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-8 italic">No zones assigned yet.</p>
                )}
              </div>

              {/* Assignment Tool */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                 <h3 className="text-lg font-bold text-slate-900 mb-6 font-sans">Assign New Zones</h3>
                 <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end ml-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select District</label>
                        {selectedDist && !loadingPins && (
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{pincodes.length} Total Areas Found</span>
                        )}
                      </div>
                      <select 
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-600 appearance-none cursor-pointer text-sm font-medium"
                        value={selectedDist}
                        onChange={(e) => setSelectedDist(e.target.value)}
                      >
                        <option value="">Choose District...</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>

                    {selectedDist && (
                      <div className="space-y-6">
                        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                           {loadingPins ? (
                             <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                           ) : (
                              Object.entries(groupedPincodes).map(([taluka, pins]) => {
                                const isExpanded = expandedTalukas.includes(taluka);
                                const unassignedPins = pins.filter(p => !currentAssignments.some(a => a.pincode_id === p.id));
                                const allTalukaSelected = unassignedPins.length > 0 && unassignedPins.every(p => selectedPins.includes(p.id));
                                
                                return (
                                  <div key={taluka} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-slate-50/30">
                                    <div 
                                      className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                                      onClick={() => setExpandedTalukas(prev => isExpanded ? prev.filter(t => t !== taluka) : [...prev, taluka])}
                                    >
                                       <div className="flex items-center space-x-3">
                                          <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                                          <span className="font-bold text-slate-900 text-sm uppercase">{taluka}</span>
                                       </div>
                                       {unassignedPins.length > 0 && (
                                         <button 
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             const ids = unassignedPins.map(p => p.id);
                                             if (allTalukaSelected) {
                                               setSelectedPins(selectedPins.filter(id => !ids.includes(id)));
                                             } else {
                                               setSelectedPins(Array.from(new Set([...selectedPins, ...ids])));
                                             }
                                           }}
                                           className="text-[10px] font-bold text-indigo-600 hover:underline"
                                         >
                                           {allTalukaSelected ? 'Deselect All' : 'Select All'}
                                         </button>
                                       )}
                                    </div>

                                    {isExpanded && (
                                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                                         {pins.map(p => {
                                           const isAssigned = currentAssignments.some(a => a.pincode_id === p.id);
                                           const isSelected = selectedPins.includes(p.id);
                                           return (
                                              <div 
                                                key={p.id} 
                                                onClick={() => !isAssigned && setSelectedPins(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                                                className={cn(
                                                  "p-3 rounded-xl border flex justify-between items-center transition-all shadow-sm",
                                                  isAssigned ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed" : 
                                                  isSelected ? "bg-indigo-50 border-indigo-600 text-indigo-700" : "bg-white border-slate-200 cursor-pointer hover:border-indigo-300"
                                                )}
                                              >
                                                <div className="overflow-hidden">
                                                <p className="text-sm font-bold truncate">{p.pincode}</p>
                                                <p className="text-[9px] font-medium text-slate-400 truncate uppercase mt-0.5 font-bold">{p.area}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                  <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-tighter">{p.taluka}</span>
                                                </div>
                                             </div>
                                                {!isAssigned && (
                                                  <div className={cn("w-5 h-5 rounded flex items-center justify-center border transition-all shadow-sm", isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300")}>
                                                    {isSelected && <CheckSquare className="w-4 h-4" />}
                                                  </div>
                                                )}
                                              </div>
                                           );
                                         })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                           )}
                        </div>

                        <button 
                          onClick={handleAssign}
                          disabled={selectedPins.length === 0 || actionLoading}
                          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                           {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `Assign ${selectedPins.length} Selected Zones`}
                        </button>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed text-center shadow-sm">
              <Users className="w-12 h-12 text-slate-200 mb-4" />
              <h2 className="text-xl font-bold text-slate-800">Select Employee</h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">Click on an employee from the left list to manage their zone assignments.</p>
            </div>
          )}
        </div>
      </main>
      {ToastComponent}
    </div>
  );
}
