import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function timeAgo(dateString: string) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / 1000,
  );
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const { data: predictions, error: predError } = await supabaseAdmin
      .from("predictions")
      .select(
        `
        id, created_at, home_score, away_score, user_id,
        matches!inner ( home_team, away_team, status )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(4);

    if (predError) throw predError;

    const {
      data: { users },
      error: usersError,
    } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw usersError;

    const activities = predictions.map((p: any) => {
      const user = users.find((u) => u.id === p.user_id);
      const userName =
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "Player";
      const initial = userName.substring(0, 2).toUpperCase();
      const avatarUrl =
        user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

      const isSecret = p.matches.status === "scheduled";

      return {
        id: p.id,
        userName,
        initial,
        avatarUrl,
        homeTeam: p.matches.home_team,
        awayTeam: p.matches.away_team,
        homeScore: isSecret ? "?" : p.home_score,
        awayScore: isSecret ? "?" : p.away_score,
        isSecret,
        timeAgo: timeAgo(p.created_at),
      };
    });

    return NextResponse.json({ data: activities });
  } catch (error) {
    console.error("Activity API Error:", error);
    return NextResponse.json(
      { error: "Error while fetching activity" },
      { status: 500 },
    );
  }
}
