import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Pool } from "npm:pg@8.11.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  action: string;
  [key: string]: any;
}

let pool: Pool;

function getPool() {
  if (!pool) {
    const dbUrl = Deno.env.get("NEON_DATABASE_URL");
    if (!dbUrl) throw new Error("NEON_DATABASE_URL not configured");
    pool = new Pool({ connectionString: dbUrl });
  }
  return pool;
}

async function queryDatabase(sql: string, values: any[] = []) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(sql, values);
    return result.rows;
  } finally {
    client.release();
  }
}

async function handleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { action } = body;

    let result;

    switch (action) {
      case "getSeries":
        result = await queryDatabase("SELECT * FROM series ORDER BY created_at DESC");
        break;

      case "getSeriesById":
        result = await queryDatabase("SELECT * FROM series WHERE id = $1", [body.id]);
        break;

      case "getSeriesImages":
        result = await queryDatabase(
          'SELECT * FROM series_images WHERE series_id = $1 ORDER BY "order"',
          [body.series_id]
        );
        break;

      case "createSeries":
        result = await queryDatabase(
          "INSERT INTO series (title, description, quote, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
          [body.title, body.description || null, body.quote || null, body.image_url || null]
        );
        break;

      case "updateSeries":
        result = await queryDatabase(
          "UPDATE series SET title = $1, description = $2, quote = $3, image_url = $4 WHERE id = $5 RETURNING *",
          [body.title, body.description || null, body.quote || null, body.image_url || null, body.id]
        );
        break;

      case "deleteSeries":
        result = await queryDatabase("DELETE FROM series WHERE id = $1", [body.id]);
        break;

      case "createSeriesImage":
        result = await queryDatabase(
          'INSERT INTO series_images (series_id, image_url, "order") VALUES ($1, $2, $3) RETURNING *',
          [body.series_id, body.image_url, body.order]
        );
        break;

      case "deleteSeriesImage":
        result = await queryDatabase("DELETE FROM series_images WHERE id = $1", [body.id]);
        break;

      case "reorderSeriesImage":
        result = await queryDatabase('UPDATE series_images SET "order" = $1 WHERE id = $2', [
          body.order,
          body.id,
        ]);
        break;

      case "getExhibitions":
        result = await queryDatabase("SELECT * FROM exhibitions ORDER BY created_at DESC");
        break;

      case "createExhibition":
        result = await queryDatabase(
          "INSERT INTO exhibitions (title, description, location, date, image_url, exhibition_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
          [
            body.title,
            body.description || null,
            body.location || null,
            body.date || null,
            body.image_url || null,
            body.exhibition_type || "solo",
          ]
        );
        break;

      case "updateExhibition":
        result = await queryDatabase(
          "UPDATE exhibitions SET title = $1, description = $2, location = $3, date = $4, image_url = $5, exhibition_type = $6 WHERE id = $7 RETURNING *",
          [
            body.title,
            body.description || null,
            body.location || null,
            body.date || null,
            body.image_url || null,
            body.exhibition_type || "solo",
            body.id,
          ]
        );
        break;

      case "deleteExhibition":
        result = await queryDatabase("DELETE FROM exhibitions WHERE id = $1", [body.id]);
        break;

      case "getSettings":
        result = await queryDatabase("SELECT * FROM site_settings");
        break;

      case "getSetting":
        result = await queryDatabase("SELECT * FROM site_settings WHERE key = $1", [body.key]);
        break;

      case "setSetting":
        result = await queryDatabase(
          "INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2 RETURNING *",
          [body.key, body.value]
        );
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

Deno.serve(handleRequest);
