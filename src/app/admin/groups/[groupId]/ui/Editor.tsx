"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Group = {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  capacity: number | null;
  rate_per_session_cents: number | null;
  active: boolean;
};

type ScheduleRow = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location?: string | null;
};

export default function Editor({ groupId, group, schedule }: { groupId: string; group: Group; schedule: ScheduleRow[] }) {
  const [form, setForm] = useState<Group>(group);
  const [rows, setRows] = useState<ScheduleRow[]>(schedule);
  const [syncFrom, setSyncFrom] = useState<string>("");
  const [syncTo, setSyncTo] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function update<K extends keyof Group>(key: K, value: Group[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addRow() {
    setRows((r) => [...r, { day_of_week: 1, start_time: "16:30", end_time: "19:30", location: group.location ?? "" }]);
  }
  function removeRow(idx: number) {
    setRows((r) => r.filter((_, i) => i !== idx));
  }
  function setRow(idx: number, patch: Partial<ScheduleRow>) {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        start_date: form.start_date,
        end_date: form.end_date,
        location: form.location,
        capacity: form.capacity,
        rate_per_session_cents: form.rate_per_session_cents,
        active: form.active,
        schedule: rows.map(r => ({
          day_of_week: Number(r.day_of_week),
          start_time: r.start_time,
          end_time: r.end_time,
          location: r.location ?? null,
        })),
        changeFrom: syncFrom || undefined,
        changeTo: syncTo || undefined,
      };
      const res = await fetch(`/api/admin/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        alert("Save failed: " + JSON.stringify(json));
      } else {
        alert("Saved" + (json.sync ? " & synced" : ""));
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <div className="max-w-3xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Group · {form.name}</h1>
        <button onClick={save} disabled={saving} className="px-3 py-2 rounded bg-black text-white">
          {saving ? "Saving..." : "Save"}
        </button>
      </header>

      <section className="grid gap-3">
        <label className="block">Name
          <input className="border rounded p-2 w-full" value={form.name} onChange={e=>update("name", e.target.value)} />
        </label>
        <label className="block">Description
          <textarea className="border rounded p-2 w-full" value={form.description ?? ""} onChange={e=>update("description", e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>Start date
            <input type="date" className="border rounded p-2 w-full" value={form.start_date} onChange={e=>update("start_date", e.target.value)} />
          </label>
          <label>End date
            <input type="date" className="border rounded p-2 w-full" value={form.end_date} onChange={e=>update("end_date", e.target.value)} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label>Location
            <input className="border rounded p-2 w-full" value={form.location ?? ""} onChange={e=>update("location", e.target.value)} />
          </label>
          <label>Capacity
            <input type="number" className="border rounded p-2 w-full" value={form.capacity ?? 0} onChange={e=>update("capacity", Number(e.target.value))} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label>Rate per session (cents)
            <input type="number" className="border rounded p-2 w-full" value={form.rate_per_session_cents ?? 0} onChange={e=>update("rate_per_session_cents", Number(e.target.value))} />
          </label>
          <label className="flex items-center gap-2">Active
            <input type="checkbox" checked={form.active} onChange={e=>update("active", e.target.checked)} />
          </label>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Weekly Schedule</h2>
          <button onClick={addRow} className="px-2 py-1 rounded bg-black text-white text-sm">Add Row</button>
        </div>
        <div className="grid gap-2">
          {rows.map((r, idx) => (
            <div key={idx} className="border rounded-xl p-3 grid grid-cols-12 gap-2 items-center">
              <select className="border rounded p-2 col-span-2" value={r.day_of_week} onChange={e=>setRow(idx, { day_of_week: Number(e.target.value) })}>
                {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
              <input className="border rounded p-2 col-span-2" value={r.start_time} onChange={e=>setRow(idx, { start_time: e.target.value })} placeholder="HH:MM" />
              <span className="text-center">→</span>
              <input className="border rounded p-2 col-span-2" value={r.end_time} onChange={e=>setRow(idx, { end_time: e.target.value })} placeholder="HH:MM" />
              <input className="border rounded p-2 col-span-3" value={r.location ?? ""} onChange={e=>setRow(idx, { location: e.target.value })} placeholder="Location" />
              <button onClick={() => removeRow(idx)} className="px-2 py-1 text-sm underline col-span-1">Remove</button>
            </div>
          ))}
          {rows.length === 0 && <div className="text-sm text-neutral-500">No schedule rows. Add at least one.</div>}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Save & Sync (optional)</h2>
        <p className="text-sm text-neutral-600">Provide a date-time window to regenerate sessions for this group. Only future sessions without attendance or payments will be deleted before regeneration.</p>
        <div className="grid grid-cols-2 gap-3">
          <label>Change window FROM
            <input type="datetime-local" className="border rounded p-2 w-full" value={syncFrom} onChange={e=>setSyncFrom(e.target.value ? new Date(e.target.value).toISOString() : "")} />
          </label>
          <label>… TO
            <input type="datetime-local" className="border rounded p-2 w-full" value={syncTo} onChange={e=>setSyncTo(e.target.value ? new Date(e.target.value).toISOString() : "")} />
          </label>
        </div>
        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="px-3 py-2 rounded bg-black text-white">Save{(syncFrom && syncTo) ? " & Sync" : ""}</button>
          <button onClick={() => { setSyncFrom(""); setSyncTo(""); }} className="px-3 py-2 rounded border">Clear window</button>
        </div>
      </section>
    </div>
  );
}
