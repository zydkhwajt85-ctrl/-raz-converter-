import { getStore } from "@netlify/blobs";

const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const rid = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => ABC[b % 62]).join("");
const err = (error, status = 400) => Response.json({ error }, { status });

export default async (req) => {
  if (req.method !== "POST") return err("Method not allowed", 405);

  let body;
  try { body = await req.json(); } catch { return err("Bad request"); }
  const code = body.code;

  if (typeof code !== "string" || !code.trim()) return err("السكربت فاضي");
  if (new TextEncoder().encode(code).length > 1_000_000) return err("السكربت كبير (الحد 1MB)", 413);

  const store = getStore("scripts");
  let id;
  do { id = rid(8); } while ((await store.get(id)) !== null);
  await store.set(id, code);

  const url = `${new URL(req.url).origin}/${id}/raw`;
  return Response.json({ url, loadstring: `loadstring(game:HttpGet("${url}"))()` });
};
