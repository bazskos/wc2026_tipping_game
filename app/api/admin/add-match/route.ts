import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      homeTeam,
      awayTeam,
      homeCode,
      awayCode,
      kickoffAt,
      groupName,
      stage,
    } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const matchId = Math.floor(Date.now() / 1000);

    const { data, error } = await supabase
      .from("matches")
      .insert({
        id: matchId,
        home_team: homeTeam,
        away_team: awayTeam,
        home_code: homeCode.toLowerCase(),
        away_code: awayCode.toLowerCase(),
        kickoff_at: new Date(kickoffAt).toISOString(),
        group_name: groupName,
        stage: stage,
        status: "scheduled",
        status_short: "NS",
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, match: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
