import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 1. Biztonsági ellenőrzés - Csak te használhatod a CRON_SECRET-tel!
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    // 2. Beérkező adatok (matchId, hazai gól, vendég gól)
    const body = await req.json();
    const { matchId, homeScore, awayScore } = body;

    // 3. Admin jogosultságú Supabase kliens (RLS megkerülése)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. Frissítjük a meccset az adatbázisban
    const { data, error } = await supabase
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: "finished", // A meccs státuszát rögtön 'finished'-re állítjuk!
      })
      .eq("id", matchId)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, updatedMatch: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
