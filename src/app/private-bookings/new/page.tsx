"use client";
import { useState } from "react";

type CreateBookingResponse = {
  ok?: boolean;
  bookingId?: string;
  perPerson?: number;
  total?: number;
  url?: string;
  error?: unknown;
};

export default function NewPrivateBookingPage() {
  const [coachId, setCoachId] = useState("");
  const [tableId, setTableId] = useState(1);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [sessionType, setSessionType] = useState("1on1");
  const [memberIds, setMemberIds] = useState("");

  const [result, setResult] = useState<CreateBookingResponse|null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createBooking() {
    setError(null); setResult(null);
    const members = memberIds.split(",").map(s => s.trim()).filter(Boolean);
    const res = await fetch("/api/private-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coachId, tableId: Number(tableId), startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString(), sessionType, memberIds: members }),
    });
    const json = await res.json();
    if (!res.ok) setError(json.error ? JSON.stringify(json.error) : "Error");
    else setResult(json);
  }

  return (
    <main className="p-6 max-w-2xl space-y-3">
      <h1 className="text-xl font-semibold">Create Private Booking (Demo)</h1>
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2">Coach ID
          <input className="border rounded p-2 w-full" value={coachId} onChange={e=>setCoachId(e.target.value)} placeholder="uuid" />
        </label>
        <label>Table ID
          <input className="border rounded p-2 w-full" value={tableId} onChange={e=>setTableId(Number(e.target.value))} />
        </label>
        <label>Type
          <select className="border rounded p-2 w-full" value={sessionType} onChange={e=>setSessionType(e.target.value as "1on1" | "2on1")}>
            <option value="1on1">1-on-1</option>
            <option value="2on1">2-on-1</option>
          </select>
        </label>
        <label className="col-span-2">Starts At (ISO)
          <input className="border rounded p-2 w-full" value={startsAt} onChange={e=>setStartsAt(e.target.value)} placeholder="2025-10-20T18:00:00.000Z" />
        </label>
        <label className="col-span-2">Ends At (ISO)
          <input className="border rounded p-2 w-full" value={endsAt} onChange={e=>setEndsAt(e.target.value)} placeholder="2025-10-20T19:00:00.000Z" />
        </label>
        <label className="col-span-2">Member IDs (comma-separated UUIDs)
          <input className="border rounded p-2 w-full" value={memberIds} onChange={e=>setMemberIds(e.target.value)} placeholder="uuid1, uuid2(optional)" />
        </label>
      </div>
      <button onClick={createBooking} className="px-3 py-2 rounded bg-black text-white">Create</button>
      {error && <pre className="text-red-600 text-sm">{error}</pre>}
      {result && <pre className="text-xs bg-neutral-100 p-2 rounded">{JSON.stringify(result, null, 2)}</pre>}
    </main>
  );
}
