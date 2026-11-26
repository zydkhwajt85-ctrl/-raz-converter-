import { getStore } from "@netlify/blobs";

export default async (req) => {
  const parts = new URL(req.url).pathname.split("/").filter(Boolean);
  let id = parts.pop() || "";
  if (id === "raw") id = parts.pop() || "";
  id = id.replace(/\.lua$/, "");
  if (!/^[A-Za-z0-9]{8,40}$/.test(id)) return new Response("Not found", { status: 404 });

  const code = await getStore("scripts").get(id);
  if (code === null) return new Response("Not found", { status: 404 });

  return new Response(code, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
};
