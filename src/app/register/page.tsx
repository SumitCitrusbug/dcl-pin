"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useToast from "@/components/Toast";
import { Loader2, Mail, Lock, UserPlus, ShieldPlus, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return showToast("Passwords do not match", "error");
    }
    
    setLoading(true);
    
    const res = await fetch("/api/users/create", {
      method: "POST",
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        role: "employee"
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
  showToast("Account created successfully!", "success");

  router.refresh(); // force data revalidation

  setTimeout(() => {
    router.push("/login?message=Account created successfully!");
  }, 1500);
    }
    } else {
      const data = await res.json();
      showToast(data.error || "Registration failed", "error");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] p-4 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-12">
        <div className="bg-white p-8 md:p-14 rounded-[4rem] shadow-[0_50px_120px_rgba(30,41,59,0.06)] border border-slate-200/50">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-[2rem] shadow-2xl shadow-emerald-500/30 mb-8 transform hover:-rotate-12 transition-transform duration-500">
              <ShieldPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3">Create Account</h1>
            <p className="text-slate-400 font-bold text-sm tracking-widest uppercase opacity-80">Join our network today</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Email Address</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors pointer-events-none">
                  <Mail className="w-6 h-6" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@company.com"
                  className="block w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700 shadow-inner"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Password</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="block w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700 shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Confirm Key</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="block w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700 shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-6 px-4 rounded-[2.5rem] shadow-2xl shadow-emerald-600/30 text-xs font-black uppercase tracking-[0.4em] text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity" />
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <div className="relative z-10 flex items-center">
                   Register <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                </div>
              )}
            </button>
          </form>
          
          <div className="mt-12 text-center border-t border-slate-100 pt-10">
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
              Already have an account? 
              <Link href="/login" className="text-emerald-600 font-black ml-3 hover:underline underline-offset-4 decoration-2 uppercase">Login Now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
