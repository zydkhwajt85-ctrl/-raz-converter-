export default async (req) => {
  const id = new URL(req.url).pathname.split("/").pop().replace(/\.lua$/, "");
  if (!/^[a-f0-9]{24}$/i.test(id)) return new Response("Not found", { status: 404 });
  try {
    const r = await fetch(`https://scriptblox.com/api/script/raw/${id}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!r.ok) return new Response("Not found", { status: 404 });
    return new Response(await r.text(), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return new Response("Error", { status: 502 });
  }
};
