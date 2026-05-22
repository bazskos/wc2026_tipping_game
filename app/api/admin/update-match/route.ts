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
      homeScore,
      awayScore,
      homeScoreAet,
      awayScoreAet,
      homePenalty,
      awayPenalty,
      statusShort,
    } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const updateData: any = {
      home_score: homeScore,
      away_score: awayScore,
      status: "finished",
      status_short: statusShort || "FT",
    };

    if (
      homeScoreAet !== undefined &&
      awayScoreAet !== undefined &&
      homeScoreAet !== "" &&
      awayScoreAet !== ""
    ) {
      updateData.home_score_aet = parseInt(homeScoreAet);
      updateData.away_score_aet = parseInt(awayScoreAet);
    } else {
      updateData.home_score_aet = null;
      updateData.away_score_aet = null;
    }

    if (
      homePenalty !== undefined &&
      awayPenalty !== undefined &&
      homePenalty !== "" &&
      awayPenalty !== ""
    ) {
      updateData.home_penalty = parseInt(homePenalty);
      updateData.away_penalty = parseInt(awayPenalty);
    } else {
      updateData.home_penalty = null;
      updateData.away_penalty = null;
    }

    const { data, error } = await supabase
      .from("matches")
      .update(updateData)
      .eq("id", matchId)
      .select();
    if (error) throw error;
    return NextResponse.json({ success: true, updatedMatch: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
