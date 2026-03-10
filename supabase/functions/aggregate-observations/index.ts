import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch recent non-anonymized observations
    const { data: observations, error: fetchError } = await supabase
      .from("observations")
      .select("*")
      .eq("anonymized", false)
      .order("created_at", { ascending: false })
      .limit(500);

    if (fetchError) throw fetchError;
    if (!observations || observations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No new observations to aggregate", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processed = 0;
    const alertCandidates: Record<string, { count: number; name: string; id: string }> = {};

    for (const obs of observations) {
      // Create region key by bucketing coordinates (1-degree grid)
      const latBucket = obs.sky_dec ? Math.round(obs.sky_dec) : 0;
      const lonBucket = obs.sky_ra ? Math.round(obs.sky_ra / 15) * 15 : 0;
      const obsDate = obs.date || new Date().toISOString().split("T")[0];
      const hourBucket = new Date(obs.created_at).getUTCHours();
      const regionKey = `${latBucket}_${lonBucket}`;

      // Upsert into aggregate table
      const { error: upsertError } = await supabase.rpc("upsert_observation_aggregate", {
        p_region_key: regionKey,
        p_lat_bucket: latBucket,
        p_lon_bucket: lonBucket,
        p_obs_date: obsDate,
        p_hour_bucket: hourBucket,
        p_object_type: "constellation",
        p_object_id: obs.constellation_id,
        p_object_name: obs.constellation_name,
        p_confidence: obs.confidence || 0,
        p_brightness: obs.brightness_estimate,
        p_equipment: obs.equipment || "phone",
      });

      // Fallback: direct insert if RPC doesn't exist yet
      if (upsertError) {
        await supabase.from("sky_observations_aggregate").upsert(
          {
            region_key: regionKey,
            latitude_bucket: latBucket,
            longitude_bucket: lonBucket,
            observation_date: obsDate,
            hour_bucket: hourBucket,
            object_type: "constellation",
            object_id: obs.constellation_id,
            object_name: obs.constellation_name,
            observation_count: 1,
            avg_confidence: obs.confidence || 0,
            avg_brightness: obs.brightness_estimate,
            equipment_distribution: JSON.stringify({ [obs.equipment || "phone"]: 1 }),
          },
          { onConflict: "region_key,observation_date,hour_bucket,object_id" }
        );
      }

      // Mark as anonymized
      await supabase
        .from("observations")
        .update({ anonymized: true })
        .eq("id", obs.id);

      // Track alert candidates
      const key = `${obs.constellation_id}_${obsDate}`;
      if (!alertCandidates[key]) {
        alertCandidates[key] = { count: 0, name: obs.constellation_name, id: obs.constellation_id };
      }
      alertCandidates[key].count++;
      processed++;
    }

    // Generate alerts for trending observations (5+ in same day)
    for (const [, candidate] of Object.entries(alertCandidates)) {
      if (candidate.count >= 5) {
        await supabase.from("sky_alerts").insert({
          title: `${candidate.name} trending tonight`,
          description: `${candidate.count} observers detected ${candidate.name} in the last few hours. Great visibility conditions!`,
          alert_type: "trending",
          severity: "highlight",
          object_id: candidate.id,
          object_name: candidate.name,
          observation_count: candidate.count,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    return new Response(
      JSON.stringify({ message: "Aggregation complete", processed, alerts: Object.keys(alertCandidates).length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
