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
      matchId,
      homeTeam,
      awayTeam,
      homeCode,
      awayCode,
      kickoffAt,
      stage,
      groupName,
    } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("matches")
      .update({
        home_team: homeTeam,
        away_team: awayTeam,
        home_code: homeCode || null,
        away_code: awayCode || null,
        kickoff_at: kickoffAt,
        stage: stage,
        group_name: groupName || null,
      })
      .eq("id", matchId)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, updatedMatch: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
