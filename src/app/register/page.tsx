"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useToast from "@/components/Toast";
import { Loader2, Mail, Lock, ShieldPlus, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    } catch {
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

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-[2rem] shadow-2xl shadow-emerald-500/30 mb-8">
              <ShieldPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase mb-3">Create Account</h1>
            <p className="text-slate-400 font-bold text-sm uppercase">Join our network today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Email */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="block w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] outline-none font-bold text-sm text-black placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

              {/* Password */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="block w-full pl-14 pr-12 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-bold text-sm text-black placeholder:text-slate-400"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Confirm Key</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="block w-full pl-14 pr-12 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-bold text-sm text-black placeholder:text-slate-400"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex justify-center items-center py-6 rounded-[2.5rem] text-xs font-black uppercase text-white bg-emerald-600 hover:bg-emerald-700 transition-all"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center">
                  Register <ArrowRight className="w-4 h-4 ml-3" />
                </div>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center border-t border-slate-100 pt-10">
            <p className="text-slate-400 text-xs font-black uppercase">
              Already have an account?
              <Link href="/login" className="text-emerald-600 ml-3 hover:underline">
                Login Now
              </Link>
            </p>
          </div>

        </div>
      </div>

      {ToastComponent}
    </div>
  );
}
