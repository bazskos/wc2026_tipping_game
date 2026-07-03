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
    const { data: matches, error: matchError } = await supabaseAdmin
      .from("matches")
      .select("id, home_score, away_score")
      .eq("status", "finished")
      .not("home_score", "is", null);

    if (matchError) throw matchError;

    let processedCount = 0;

    for (const match of matches) {
      const { data: predictions, error: predError } = await supabaseAdmin
        .from("predictions")
        .select("id, user_id, home_score, away_score")
        .eq("match_id", match.id)
        .is("points", null);

      if (predError) throw predError;

      for (const pred of predictions) {
        let points = 0;

        if (
          pred.home_score === match.home_score &&
          pred.away_score === match.away_score
        ) {
          points = 3;
        } else if (
          Math.sign(pred.home_score - pred.away_score) ===
          Math.sign(match.home_score - match.away_score)
        ) {
          points = 1;
        }

        await supabaseAdmin
          .from("predictions")
          .update({ points })
          .eq("id", pred.id);

        processedCount++;
      }
    }

    const { data: allEvaluatedPreds, error: allPredsError } =
      await supabaseAdmin
        .from("predictions")
        .select(
          `
          user_id, 
          points,
          home_score,
          away_score,
          matches ( kickoff_at, home_score, away_score )
        `,
        )
        .not("points", "is", null);

    if (allPredsError) throw allPredsError;

    const userPredictions: Record<string, any[]> = {};
    for (const p of allEvaluatedPreds) {
      if (!userPredictions[p.user_id]) {
        userPredictions[p.user_id] = [];
      }
      userPredictions[p.user_id].push(p);
    }

    const userTotals: Record<
      string,
      { points: number; perfects: number; streak: number; nearMisses: number }
    > = {};

    for (const [userId, preds] of Object.entries(userPredictions)) {
      let totalPoints = 0;
      let perfects = 0;
      let currentStreak = 0;
      let nearMissesCount = 0;

      for (const p of preds) {
        totalPoints += p.points || 0;
        if (p.points === 3) perfects += 1;

        if (
          p.matches &&
          p.matches.home_score !== null &&
          p.matches.away_score !== null
        ) {
          const diff =
            Math.abs(p.home_score - p.matches.home_score) +
            Math.abs(p.away_score - p.matches.away_score);

          if (diff === 1) {
            nearMissesCount += 1;
          }
        }
      }

      const sortedPreds = preds.sort((a, b) => {
        const dateA = new Date(a.matches?.kickoff_at || 0).getTime();
        const dateB = new Date(b.matches?.kickoff_at || 0).getTime();
        return dateB - dateA;
      });

      for (const p of sortedPreds) {
        if (p.points > 0) {
          currentStreak++;
        } else {
          break;
        }
      }

      userTotals[userId] = {
        points: totalPoints,
        perfects,
        streak: currentStreak,
        nearMisses: nearMissesCount,
      };
    }

    for (const [userId, totals] of Object.entries(userTotals)) {
      await supabaseAdmin
        .from("profiles")
        .update({
          points: totals.points,
          perfect_tips: totals.perfects,
          streak: totals.streak,
          near_misses: totals.nearMisses,
        })
        .eq("id", userId);
    }

    return NextResponse.json({
      success: true,
      processed_predictions: processedCount,
      message:
        "Points, perfect tips, near misses and STREAKS updated successfully!",
    });
  } catch (error) {
    console.error("Error while calculating points:", error);
    return NextResponse.json({ error: "Inside error." }, { status: 500 });
  }
}
