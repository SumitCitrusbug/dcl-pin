"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useToast from "@/components/Toast";
import { Loader2, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) showToast(message, "success");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      showToast("Login successful!", "success");
      const { user } = await res.json();
      setTimeout(() => {
        if (user.role === "admin") router.push("/admin/dashboard");
        else router.push("/employee/dashboard");
      }, 1000);
    } else {
      const data = await res.json();
      showToast(data.error || "Login failed", "error");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] p-4 font-sans relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
        <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-[0_45px_100px_rgba(30,41,59,0.06)] border border-slate-200/50">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/30 mb-8 transform hover:rotate-12 transition-transform duration-500">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">Welcome Back</h1>
            <p className="text-slate-400 font-bold text-sm tracking-wide uppercase opacity-80">Log in to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Email Address</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                  <Mail className="w-6 h-6" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700 shadow-inner"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Password</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                  <Lock className="w-6 h-6" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700 shadow-inner"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-6 px-4 rounded-[2rem] shadow-2xl shadow-indigo-600/30 text-xs font-black uppercase tracking-[0.4em] text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity" />
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <div className="relative z-10 flex items-center">
                   Log In <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                </div>
              )}
            </button>
          </form>
          
          <div className="mt-12 text-center border-t border-slate-100 pt-10">
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
              Don't have an account? 
              <Link href="/register" className="text-indigo-600 font-black ml-3 hover:underline underline-offset-4 decoration-2 uppercase">Register Now</Link>
            </p>
          </div>
        </div>
      </div>
      {ToastComponent}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
