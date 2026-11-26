import { getStore } from "@netlify/blobs";

const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
const err = (error, status = 400) => Response.json({ error }, { status });

export default async (req) => {
  if (req.method !== "POST") return err("Method not allowed", 405);

  let body;
  try { body = await req.json(); } catch { return err("Bad request"); }
  const { code, publish } = body;

  if (typeof code !== "string" || !code.trim()) return err("السكربت فاضي");
  if (new TextEncoder().encode(code).length > 1_000_000) return err("السكربت كبير (الحد 1MB)", 413);

  const title = String(body.title || "").trim().slice(0, 60);
  const map = String(body.map || "").trim().slice(0, 60);
  if (publish && (!title || !map)) return err("اكتب اسم السكربت واسم الماب عشان تنشره");

  const id = hex(crypto.getRandomValues(new Uint8Array(20)));
  await getStore("scripts").set(id, code);
  if (publish) await getStore("published").setJSON(id, { title, map, createdAt: Date.now() });

  const url = `${new URL(req.url).origin}/files/v1/loaders/${id}.lua`;
  return Response.json({ url, loadstring: `loadstring(game:HttpGet("${url}"))()` });
};
