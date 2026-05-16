import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const { data: matches } = await supabaseAdmin
      .from("matches")
      .select("*")
      .in("status", ["scheduled", "live"])
      .order("kickoff_at", { ascending: true });

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, name, avatar_url");

    const matchIds = matches?.map((m) => m.id) || [];
    const { data: predictions } = await supabaseAdmin
      .from("predictions")
      .select("*")
      .in("match_id", matchIds);

    return NextResponse.json({
      success: true,
      data: {
        matches: matches || [],
        profiles: profiles || [],
        predictions: predictions || [],
      },
    });
  } catch (error) {
    console.error("Admin data fetch error:", error);
    return NextResponse.json({ error: "Belső szerverhiba" }, { status: 500 });
  }
}
