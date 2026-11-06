const MODEL = "gemini-3.8-flash";
const ALLOWED_ORIGIN = "https://mediakopena-arch.github.io";
const MAX_BODY_BYTES = 12_000;

function reply(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin,
      "Vary": "Origin",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (origin !== ALLOWED_ORIGIN) return new Response("Forbidden", { status: 403 });
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
      }});
    }
    if (new URL(request.url).pathname !== "/analyze") return reply({ error: "Rute tidak ditemukan." }, 404, origin);
    if (request.method !== "POST") return reply({ error: "Gunakan POST." }, 405, origin);
    if (!env.GEMINI_API_KEY) return reply({ error: "API key belum diatur oleh admin." }, 503, origin);
    const length = Number(request.headers.get("Content-Length") || 0);
    if (length > MAX_BODY_BYTES) return reply({ error: "Ringkasan terlalu besar." }, 413, origin);

    let rawBody;
    try { rawBody = await request.text(); } catch { return reply({ error: "Format permintaan tidak valid." }, 400, origin); }
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return reply({ error: "Ringkasan terlalu besar." }, 413, origin);
    let body;
    try { body = JSON.parse(rawBody); } catch { return reply({ error: "Format permintaan tidak valid." }, 400, origin); }
    if (!body || typeof body.summary !== "object" || body.summary === null || Array.isArray(body.summary)) {
      return reply({ error: "Ringkasan tidak valid." }, 400, origin);
    }
    const summaryJson = JSON.stringify(body.summary);
    if (summaryJson.length > MAX_BODY_BYTES) return reply({ error: "Ringkasan terlalu besar." }, 413, origin);

    const prompt = "Bertindak sebagai analis risiko portofolio koperasi yang berhati-hati. Analisis angka agregat berikut dalam bahasa Indonesia. Jangan menyimpulkan kesalahan atau menyarankan penolakan kredit. Bedakan fakta angka dan kemungkinan penyebab. Tulis: (1) 3 temuan utama, (2) perubahan dari periode lalu jika tersedia, (3) tiga pemeriksaan lanjutan yang konkret, (4) keterbatasan data. Jangan minta identitas nasabah. Angka berasal dari laporan lokal dan bisa tidak lengkap. Data JSON agregat: " + summaryJson;
    try {
      const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 900 } })
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        const message = upstream.status === 429 ? "Kuota analisis sedang habis. Coba lagi nanti." : "Gemini gagal memproses analisis. Admin dapat memeriksa API key dan kuota.";
        return reply({ error: message }, upstream.status === 429 ? 429 : 502, origin);
      }
      const text = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
      if (!text) return reply({ error: "Gemini tidak mengembalikan hasil." }, 502, origin);
      return reply({ text }, 200, origin);
    } catch {
      return reply({ error: "Backend tidak dapat menghubungi Gemini." }, 502, origin);
    }
  }
};
