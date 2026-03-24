"use client";

import { useEffect, useState, useMemo } from "react";
import Nav from "@/components/Nav";
import { ChevronRight, CheckSquare, Square, Trash2, Loader2, Pin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import useToast from "@/components/Toast";

export default function EmployeeAssignments() {
  const [districts, setDistricts] = useState<any[]>([]);
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [selectedDist, setSelectedDist] = useState<string>("");
  const [selectedPins, setSelectedPins] = useState<number[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<any[]>([]);
  const [loadingPins, setLoadingPins] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedTalukas, setExpandedTalukas] = useState<string[]>([]);
  const [expandedMyTalukas, setExpandedMyTalukas] = useState<string[]>([]);
  const [selectedRemovalPins, setSelectedRemovalPins] = useState<number[]>([]);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetch("/api/districts").then(res => res.json()).then(setDistricts);
    loadMyAssignments();
  }, []);

  const loadMyAssignments = () => {
    setLoadingAssignments(true);
    fetch("/api/employee/assignments")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCurrentAssignments(data);
          if (data.length > 0) setExpandedMyTalukas([data[0].taluka]);
        }
        setLoadingAssignments(false);
      });
  };

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

  const togglePin = (pinId: number) => {
    setSelectedPins(prev => prev.includes(pinId) ? prev.filter(id => id !== pinId) : [...prev, pinId]);
  };

  const toggleTaluka = (taluka: string, groupPins: any[]) => {
    const unassignedGroupPins = groupPins.filter(p => !currentAssignments.some(a => a.pincode_id === p.id));
    const allIds = unassignedGroupPins.map(p => p.id);
    const allSelected = allIds.every(id => selectedPins.includes(id));
    
    if (allSelected) {
      setSelectedPins(selectedPins.filter(id => !allIds.includes(id)));
    } else {
      setSelectedPins(Array.from(new Set([...selectedPins, ...allIds])));
    }
  };

  const toggleRemovalTaluka = (taluka: string, groupPins: any[]) => {
    const allIds = groupPins.map(p => p.pincode_id);
    const allSelected = allIds.every(id => selectedRemovalPins.includes(id));
    
    if (allSelected) {
      setSelectedRemovalPins(selectedRemovalPins.filter(id => !allIds.includes(id)));
    } else {
      setSelectedRemovalPins(Array.from(new Set([...selectedRemovalPins, ...allIds])));
    }
  };

  const handleAdd = async () => {
    if (selectedPins.length === 0) return;
    setActionLoading(true);
    const res = await fetch("/api/employee/assignments", {
      method: "POST",
      body: JSON.stringify({ pincode_ids: selectedPins, district_id: selectedDist }),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      showToast("Zones added successfully", "success");
      loadMyAssignments();
      setSelectedPins([]);
    }
    setActionLoading(false);
  };

  const handleRemove = async (pinIds: number[]) => {
    if (pinIds.length === 0) return;
    setActionLoading(true);
    const res = await fetch("/api/employee/assignments", {
      method: "DELETE",
      body: JSON.stringify({ pincode_ids: pinIds }),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      showToast(pinIds.length > 1 ? `${pinIds.length} zones removed` : "Zone removed", "info");
      setCurrentAssignments(prev => prev.filter(a => !pinIds.includes(a.pincode_id)));
      setSelectedRemovalPins(prev => prev.filter(id => !pinIds.includes(id)));
    }
    setActionLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Nav role="employee" />
      <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 mt-4">
        
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Manage Zones</h1>
          <p className="text-slate-500 text-sm">Add or remove assigned areas from your list</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: My Current Areas */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-slate-900">Current Assignments</h2>
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-bold border border-indigo-100 uppercase">
                    {currentAssignments.length} Total
                  </span>
                </div>
                {selectedRemovalPins.length > 0 && (
                  <button 
                    onClick={() => handleRemove(selectedRemovalPins)}
                    disabled={actionLoading}
                    className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 transition-all flex items-center space-x-2"
                  >
                    {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    <span>Remove {selectedRemovalPins.length}</span>
                  </button>
                )}
             </div>

             {loadingAssignments ? (
               <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
             ) : currentAssignments.length > 0 ? (
               <div className="space-y-4">
                 {Object.entries(groupedAssignments).map(([taluka, groupPins]) => {
                   const isExpanded = expandedMyTalukas.includes(taluka);
                   const allIds = groupPins.map(p => p.pincode_id);
                   const allSelected = allIds.every(id => selectedRemovalPins.includes(id));
                   
                   return (
                     <div key={taluka} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                        <div 
                          onClick={() => setExpandedMyTalukas(prev => isExpanded ? prev.filter(t => t !== taluka) : [...prev, taluka])}
                          className="px-5 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                           <div className="flex items-center space-x-3">
                             <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                             <span className="font-bold text-slate-900 text-sm uppercase">{taluka}</span>
                           </div>
                           <div className="flex items-center space-x-4">
                             <button 
                               onClick={(e) => { e.stopPropagation(); toggleRemovalTaluka(taluka, groupPins); }}
                               className="text-[10px] font-bold text-indigo-600 hover:underline"
                             >
                               {allSelected ? 'Deselect All' : 'Select All'}
                             </button>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{groupPins.length} Zones</span>
                           </div>
                        </div>
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 grid grid-cols-1 gap-3">
                             {groupPins.map((a, i) => {
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
                                    <div className="flex items-center space-x-3">
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
                                        isSelected ? "bg-rose-600 border-rose-600 text-white shadow-sm" : "border-slate-300"
                                      )}>
                                        {isSelected && <CheckSquare className="w-4 h-4" />}
                                      </div>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemove([a.pincode_id]); }} 
                                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
               <div className="py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                 <p className="text-slate-400 text-sm font-medium">No active zones in your list.</p>
               </div>
             )}
          </section>

          {/* Right: Add New Areas */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
             <h2 className="text-lg font-bold text-slate-900 mb-6 font-sans">Assign New Areas</h2>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between items-end ml-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select District</label>
                     {selectedDist && !loadingPins && (
                       <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{pincodes.length} Total Areas Found</span>
                     )}
                   </div>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-600 appearance-none cursor-pointer text-sm"
                      value={selectedDist}
                      onChange={(e) => setSelectedDist(e.target.value)}
                    >
                      <option value="">Choose District...</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {selectedDist && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                       {loadingPins ? (
                         <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                       ) : (
                          Object.entries(groupedPincodes).map(([taluka, pins]) => {
                            const isExpanded = expandedTalukas.includes(taluka);
                            const unassignedPins = pins.filter(p => !currentAssignments.some(a => a.pincode_id === p.id));
                            const allTalukaSelected = unassignedPins.length > 0 && unassignedPins.every(p => selectedPins.includes(p.id));
                            
                            return (
                              <div key={taluka} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                <div 
                                  className="px-5 py-4 flex justify-between items-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                                  onClick={() => setExpandedTalukas(prev => isExpanded ? prev.filter(t => t !== taluka) : [...prev, taluka])}
                                >
                                   <div className="flex items-center space-x-3">
                                      <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                                      <span className="font-bold text-slate-900 text-sm uppercase">{taluka}</span>
                                   </div>
                                   {unassignedPins.length > 0 && (
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); toggleTaluka(taluka, pins); }}
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
                                            onClick={() => !isAssigned && togglePin(p.id)}
                                            className={cn(
                                              "p-3 rounded-xl border flex justify-between items-center transition-all",
                                              isAssigned ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed" : 
                                              isSelected ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm" : "bg-white border-slate-200 cursor-pointer hover:border-indigo-300 shadow-sm"
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
                                              <div className={cn("w-5 h-5 rounded flex items-center justify-center border transition-all", isSelected ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" : "border-slate-300")}>
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
                      onClick={handleAdd}
                      disabled={selectedPins.length === 0 || actionLoading}
                      className="w-full flex items-center justify-center py-5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                       {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                         <>
                           Add {selectedPins.length} Selected Zones
                         </>
                       )}
                    </button>
                  </div>
                )}
             </div>
          </section>
        </div>
      </main>
      {ToastComponent}
    </div>
  );
}
