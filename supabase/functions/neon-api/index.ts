import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import pg from "npm:pg@8.11.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: string;
  [key: string]: any;
}

// Correctly initialize the pool with any type to bypass the editor's type error
let pool: any;

function getPool() {
  if (!pool) {
    const dbUrl = Deno.env.get("NEON_DATABASE_URL");
    if (!dbUrl) {
      throw new Error("NEON_DATABASE_URL not configured");
    }
    pool = new pg.Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function queryDatabase(sql: string, values: any[] = []) {
  const p = getPool();
  const client = await p.connect();
  try {
    const result = await client.query(sql, values);
    return result.rows;
  } finally {
    client.release();
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { action } = body;

    let result: any;

    switch (action) {
      case "getSeries":
        result = await queryDatabase(
          "SELECT * FROM series ORDER BY created_at ASC"
        );
        break;

      case "getSeriesById":
        result = await queryDatabase(
          "SELECT * FROM series WHERE id = $1",
          [body.id]
        );
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
        result = await queryDatabase(
          "DELETE FROM series WHERE id = $1",
          [body.id]
        );
        break;

      case "createSeriesImage":
        result = await queryDatabase(
          'INSERT INTO series_images (series_id, image_url, "order", caption) VALUES ($1, $2, $3, $4) RETURNING *',
          [body.series_id, body.image_url, body.order, body.caption || null]
        );
        break;

      case "deleteSeriesImage":
        result = await queryDatabase(
          "DELETE FROM series_images WHERE id = $1",
          [body.id]
        );
        break;

      case "reorderSeriesImage":
        result = await queryDatabase(
          'UPDATE series_images SET "order" = $1 WHERE id = $2',
          [body.order, body.id]
        );
        break;

      case "updateSeriesImageCaption":
        result = await queryDatabase(
          "UPDATE series_images SET caption = $1 WHERE id = $2 RETURNING *",
          [body.caption || null, body.id]
        );
        break;

      case "getExhibitions":
        result = await queryDatabase(
          "SELECT * FROM exhibitions ORDER BY created_at ASC"
        );
        break;

      case "createExhibition":
        result = await queryDatabase(
          "INSERT INTO exhibitions (title, description, location, date, exhibition_type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
          [body.title, body.description || null, body.location || null, body.date || null, body.exhibition_type || "solo"]
        );
        break;

      case "updateExhibition":
        result = await queryDatabase(
          "UPDATE exhibitions SET title = $1, description = $2, location = $3, date = $4, exhibition_type = $5 WHERE id = $6 RETURNING *",
          [body.title, body.description || null, body.location || null, body.date || null, body.exhibition_type || "solo", body.id]
        );
        break;

      case "deleteExhibition":
        result = await queryDatabase(
          "DELETE FROM exhibitions WHERE id = $1",
          [body.id]
        );
        break;

      case "getSettings":
        result = await queryDatabase("SELECT * FROM site_settings");
        break;

      case "setSetting":
        result = await queryDatabase(
          "INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2 RETURNING *",
          [body.key, body.value]
        );
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
