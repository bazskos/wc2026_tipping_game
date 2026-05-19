import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("points, perfect_tips, streak")
      .eq("id", user.id)
      .single();

    const { data: predictions, error } = await supabase
      .from("predictions")
      .select(
        `
        id,
        home_score,
        away_score,
        points,
        matches (
          id,
          home_team,
          away_team,
          home_code,
          away_code,
          kickoff_at,
          status,
          home_score,
          away_score,
          group_name
        )
      `,
      )
      .eq("user_id", user.id);

    if (error) throw error;

    const sortedPredictions =
      predictions?.sort((a: any, b: any) => {
        const dateA = new Date(a.matches.kickoff_at).getTime();
        const dateB = new Date(b.matches.kickoff_at).getTime();
        return dateB - dateA;
      }) || [];

    return NextResponse.json({
      profile: profile || { points: 0, perfect_tips: 0, streak: 0 },
      predictions: sortedPredictions,
    });
  } catch (error) {
    console.error("Error while fetching data:", error);
    return NextResponse.json(
      { error: "Inside error occurred" },
      { status: 500 },
    );
  }
}
