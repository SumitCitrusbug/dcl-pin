"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useToast from "@/components/Toast";
import { Loader2, Mail, Lock, ShieldPlus, ArrowRight } from "lucide-react";

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
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
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

        router.refresh();

        setTimeout(() => {
          router.push("/login?message=Account created successfully!");
        }, 1500);
      } else {
        const data = await res.json();
        showToast(data.error || "Registration failed", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] p-4 font-sans relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[140px]" />

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white p-8 md:p-14 rounded-[4rem] shadow-[0_50px_120px_rgba(30,41,59,0.06)] border border-slate-200/50">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-[2rem] shadow-2xl shadow-emerald-500/30 mb-8">
              <ShieldPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase mb-3">Create Account</h1>
            <p className="text-slate-400 font-bold text-sm uppercase">Join our network today</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email Address</label>
              <div className="relative mt-2">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Password</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Confirm</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                <span className="flex items-center justify-center">
                  Register <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 text-center border-t pt-6">
            <Link href="/login" className="text-emerald-600 font-bold text-sm">
              Already have an account? Login
            </Link>
          </div>

        </div>
      </div>

      {ToastComponent}
    </div>
  );
}
