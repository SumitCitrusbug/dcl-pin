"use client";

import { useEffect, useState, cloneElement } from "react";
import Nav from "@/components/Nav";
import {
  User,
  Phone,
  MapPin,
  Info,
  Camera,
  Loader2,
  Smartphone,
  Car,
  ChevronDown
} from "lucide-react";
import useToast from "@/components/Toast";

export default function EmployeeProfile() {
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    alternate_phone: "",
    address: "",
    district_id: "",
    vehicle_type: "",
    vehicle_note: ""
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/employee/profile").then(res => res.json()),
      fetch("/api/districts").then(res => res.json())
    ])
      .then(([profile, dists]) => {
        if (profile) setFormData(profile);
        if (Array.isArray(dists)) setDistricts(dists);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = formData.phone.replace(/\D/g, "");
    const cleanAltPhone = formData.alternate_phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      return showToast("Phone number must be exactly 10 digits", "error");
    }
    if (cleanAltPhone && cleanAltPhone.length !== 10) {
      return showToast("Alternative phone must be exactly 10 digits", "error");
    }
    if (cleanAltPhone && cleanPhone === cleanAltPhone) {
      return showToast("Alternative phone cannot be same as primary", "error");
    }

    setSaving(true);
    const res = await fetch("/api/employee/profile", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" }
    });

    showToast(res.ok ? "Profile updated" : "Update failed", res.ok ? "success" : "error");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Nav role="employee" />

      <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 mt-4">
        <header className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white relative">
            <User className="w-12 h-12" />
            <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100">
              <Camera className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
            <p className="text-slate-500 text-sm">Update your information</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl border space-y-8">

          {/* Personal */}
          <Section title="Personal Information">
            <FormInput
              label="Full Name"
              icon={<User />}
              value={formData.name}
              onChange={(v: string) => setFormData({ ...formData, name: v })}
            />

            <FormInput
              label="Home District"
              icon={<MapPin />}
              type="select"
              options={districts.map(d => ({ label: d.name, value: d.id }))}
              value={formData.district_id}
              onChange={(v: string) => setFormData({ ...formData, district_id: v })}
              placeholder="Select District"
            />
          </Section>

          {/* Contact */}
          <Section title="Contact Details">
            <FormInput
              label="Phone"
              icon={<Smartphone />}
              value={formData.phone}
              onChange={(v: string) => setFormData({ ...formData, phone: v })}
            />

            <FormInput
              label="Alternative Phone"
              icon={<Phone />}
              value={formData.alternate_phone}
              onChange={(v: string) => setFormData({ ...formData, alternate_phone: v })}
            />
          </Section>

          {/* Logistics */}
          <Section title="Logistics">
            <FormInput
              label="Vehicle Type"
              icon={<Car />}
              type="select"
              options={[
                { label: "Bike", value: "bike" },
                { label: "Car", value: "car" },
                { label: "Other", value: "other" }
              ]}
              value={formData.vehicle_type}
              onChange={(v: string) => setFormData({ ...formData, vehicle_type: v })}
              placeholder="Select Vehicle"
            />

            <FormInput
              label="Vehicle Number"
              icon={<Info />}
              value={formData.vehicle_note}
              onChange={(v: string) => setFormData({ ...formData, vehicle_note: v })}
            />

            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500">Full Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
          </Section>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold"
          >
            {saving ? <Loader2 className="animate-spin mx-auto" /> : "Save Changes"}
          </button>
        </form>
      </main>

      {ToastComponent}
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-slate-900 border-b pb-2">{title}</h3>
      <div className="grid md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

function FormInput({ label, icon, value, onChange, type = "text", options = [], placeholder }: any) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500">{label}</label>

      <div className="relative mt-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {cloneElement(icon, { className: "w-4 h-4" })}
        </div>

        {type === "select" ? (
          <>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-9 pr-9 py-3 bg-slate-50 border rounded-xl text-slate-900"
              required
            >
              <option value="">{placeholder}</option>
              {options.map((o: any) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </>
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-9 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400"
            placeholder={placeholder}
            required
          />
        )}
      </div>
    </div>
  );
}
