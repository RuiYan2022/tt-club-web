import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(new URL("/api/groups/generate-sessions", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}) // defaults: today -> +8 weeks, all active groups
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

