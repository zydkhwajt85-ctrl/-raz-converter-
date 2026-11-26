export default async (req) => {
  const u = new URL(req.url);
  const q = (u.searchParams.get("q") || "").trim().slice(0, 80);
  const page = Math.min(Math.max(parseInt(u.searchParams.get("page") || "1", 10) || 1, 1), 50);

  const api = q
    ? `https://scriptblox.com/api/script/search?q=${encodeURIComponent(q)}&max=20&page=${page}`
    : `https://scriptblox.com/api/script/fetch?max=20&page=${page}`;

  try {
    const r = await fetch(api, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const data = await r.json();
    const scripts = (data.result && data.result.scripts) || [];
    const items = scripts.map((s) => ({
      id: s._id,
      title: s.title,
      game: (s.game && s.game.name) || "Universal",
      patched: !!s.isPatched,
      key: !!s.key,
    }));
    return Response.json(
      { items, totalPages: (data.result && data.result.totalPages) || 1 },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  } catch (e) {
    return Response.json({ error: "تعذر جلب السكربتات من الموقع الخارجي" }, { status: 502 });
  }
};
