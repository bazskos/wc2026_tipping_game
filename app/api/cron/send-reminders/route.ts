import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("❌ Hibás cron kulcs!");
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const now = Date.now();
    const startTime = new Date(now).toISOString();
    const endTime = new Date(now + 120 * 60 * 1000).toISOString();

    console.log(`🔍 Keresés: ${startTime} és ${endTime} között.`);

    const { data: matches, error: matchError } = await supabaseAdmin
      .from("matches")
      .select("id, home_team, away_team, kickoff_at")
      .eq("status", "scheduled")
      .gte("kickoff_at", startTime)
      .lte("kickoff_at", endTime);

    if (matchError) {
      console.error("❌ Supabase hiba:", matchError);
      throw matchError;
    }

    if (!matches || matches.length === 0) {
      console.log("ℹ️ Nincs meccs ebben az idősávban.");
      return NextResponse.json({ message: "No match found." });
    }

    console.log(`⚽ Talált meccsek: ${matches.length} db.`);

    const {
      data: { users },
      error: usersError,
    } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw usersError;

    let emailsSent = 0;

    for (const match of matches) {
      const { data: predictions } = await supabaseAdmin
        .from("predictions")
        .select("user_id")
        .eq("match_id", match.id);

      const predictedUserIds = predictions?.map((p) => p.user_id) || [];
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, wants_reminders");

      const missingUsers = users.filter(
        (user) => !predictedUserIds.includes(user.id),
      );
      console.log(
        `📩 Meccs: ${match.home_team} vs ${match.away_team}. Tippek hiányoznak: ${missingUsers.length} felhasználótól.`,
      );

      for (const user of missingUsers) {
        if (!user.email) continue;

        const userProfile = profiles?.find((p) => p.id === user.id);
        if (userProfile && userProfile.wants_reminders === false) {
          console.log(`⏩ ${user.email} kihagyva (nem kér értesítést).`);
          continue;
        }

        console.log(`✉️ E-mail küldése ide: ${user.email}`);
        await resend.emails.send({
          from: "World Cup 2026 <onboarding@resend.dev>",
          to: user.email,
          subject: `⏳ Emlékeztető: ${match.home_team} vs ${match.away_team} hamarosan kezdődik!`,
          html: `<h1>Soon starting!</h1><p>Tip now at ${appUrl}</p>`,
        });

        emailsSent++;
      }
    }

    console.log(`✅ Kész! Összesen elküldve: ${emailsSent} e-mail.`);
    return NextResponse.json({
      success: true,
      message: `Sent ${emailsSent} emails.`,
    });
  } catch (error) {
    console.error("❌ E-mail hiba:", error);
    return NextResponse.json({ error: "Error." }, { status: 500 });
  }
}
