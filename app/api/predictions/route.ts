import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, homeScore, awayScore } = body;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You are not logged in!" },
        { status: 401 },
      );
    }

    // --- 🚨 BACKEND LOCKING ---
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("kickoff_at, status")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: "The match does not exist!" },
        { status: 404 },
      );
    }

    const now = new Date().getTime();
    const kickoffTime = new Date(match.kickoff_at).getTime();

    // If the match has already started or finished
    if (
      match.status === "live" ||
      match.status === "finished" ||
      now >= kickoffTime
    ) {
      return NextResponse.json(
        { error: "Too late, because the prediction phase has ended!" },
        { status: 403 },
      );
    }
    // --------------------------------------------------

    const { data, error } = await supabase.from("predictions").upsert(
      {
        user_id: user.id,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,match_id" },
    );

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Could not save your prediction." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Prediction saved successfully!",
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Inside server error." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json({ error: "Missing matchId" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ data: null });
    }

    const { data, error } = await supabase
      .from("predictions")
      .select("home_score, away_score")
      .eq("match_id", matchId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Database error while reading:", error);
      return NextResponse.json(
        { error: "Error while reading" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
