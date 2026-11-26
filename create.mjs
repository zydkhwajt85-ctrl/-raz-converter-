import { getStore } from "@netlify/blobs";

const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

export default async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  let code;
  try { ({ code } = await req.json()); } catch { return Response.json({ error: "Bad request" }, { status: 400 }); }

  if (typeof code !== "string" || !code.trim()) return Response.json({ error: "السكربت فاضي" }, { status: 400 });
  if (new TextEncoder().encode(code).length > 1_000_000) return Response.json({ error: "السكربت كبير (الحد 1MB)" }, { status: 413 });

  const id = hex(crypto.getRandomValues(new Uint8Array(20))); // 40 خانة عشوائية
  await getStore("scripts").set(id, code);

  const url = `${new URL(req.url).origin}/files/v1/loaders/${id}.lua`;
  return Response.json({ url, loadstring: `loadstring(game:HttpGet("${url}"))()` });
};
