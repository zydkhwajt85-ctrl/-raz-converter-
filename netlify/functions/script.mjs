
import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

export default async (req, context) => {
  const store = getStore("raz-scripts");

  if (req.method === "POST") {
    try {
      const { code } = await req.json();

      if (typeof code !== "string" || !code.trim()) {
        return Response.json({ error: "الكود فارغ" }, { status: 400 });
      }

      if (code.length > 500000) {
        return Response.json({ error: "الملف كبير جداً" }, { status: 413 });
      }

      const id = randomUUID();
      await store.set(id, code);

      const scriptUrl = `${new URL(req.url).origin}/lodsrst/${id}`;

      return Response.json({ url: scriptUrl });
    } catch {
      return Response.json(
        { error: "حدث خطأ أثناء رفع السكربت" },
        { status: 500 }
      );
    }
  }

  if (req.method === "GET") {
    const id =
      context.params?.id ||
      new URL(req.url).searchParams.get("id");

    if (!id || !/^[a-f0-9-]{36}$/i.test(id)) {
      return new Response("Invalid ID", { status: 400 });
    }

    const code = await store.get(id, { type: "text" });

    if (code === null) {
      return new Response("Script not found", { status: 404 });
    }

    return new Response(code, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=60"
      }
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: [
    "/lodsrst/:id",
    "/.netlify/functions/script"
  ]
};
