import { getStore } from "@netlify/blobs";

export default async (req) => {
  const last = new URL(req.url).pathname.split("/").pop() || "";
  const id = last.replace(/\.lua$/, "");
  if (!/^[a-f0-9]{40}$/.test(id)) return new Response("Not found", { status: 404 });

  const code = await getStore("scripts").get(id);
  if (code === null) return new Response("Not found", { status: 404 });

  return new Response(code, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
};
