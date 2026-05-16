import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const countryToIsoCode: Record<string, string> = {
  USA: "us",
  Canada: "ca",
  Mexico: "mx",
  France: "fr",
  England: "gb-eng",
  Spain: "es",
  Germany: "de",
  Portugal: "pt",
  Netherlands: "nl",
  Italy: "it",
  Belgium: "be",
  Croatia: "hr",
  Switzerland: "ch",
  Denmark: "dk",
  Serbia: "rs",
  Poland: "pl",
  Hungary: "hu",
  Austria: "at",
  Scotland: "gb-sct",
  Wales: "gb-wls",
  Ukraine: "ua",
  Turkey: "tr",
  Sweden: "se",
  Argentina: "ar",
  Brazil: "br",
  Uruguay: "uy",
  Colombia: "co",
  Ecuador: "ec",
  Venezuela: "ve",
  Peru: "pe",
  Chile: "cl",
  Paraguay: "py",
  Morocco: "ma",
  Senegal: "sn",
  Egypt: "eg",
  Nigeria: "ng",
  Algeria: "dz",
  "Ivory Coast": "ci",
  Cameroon: "cm",
  Ghana: "gh",
  "South Africa": "za",
  Japan: "jp",
  "South Korea": "kr",
  Iran: "ir",
  "Saudi Arabia": "sa",
  Australia: "au",
  Qatar: "qa",
  "New Zealand": "nz",
  Uzbekistan: "uz",
  "Costa Rica": "cr",
  Panama: "pa",
  Jamaica: "jm",
  Honduras: "hn",
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing API_FOOTBALL_KEY environment variable." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?league=1&season=2026",
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-apisports-key": apiKey,
        },
      },
    );

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      return NextResponse.json({
        message: "Not received any matches.",
      });
    }

    let updatedCount = 0;

    for (const item of data.response) {
      const fixture = item.fixture;
      const league = item.league;
      const teams = item.teams;
      const goals = item.goals;
      const scoreObj = item.score;

      let matchStatus = "scheduled";
      if (
        ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(fixture.status.short)
      ) {
        matchStatus = "live";
      } else if (["FT", "AET", "PEN"].includes(fixture.status.short)) {
        matchStatus = "finished";
      }

      const { error } = await supabaseAdmin.from("matches").upsert(
        {
          id: fixture.id,
          home_team: teams.home.name,
          away_team: teams.away.name,
          home_code: countryToIsoCode[teams.home.name] || "un",
          away_code: countryToIsoCode[teams.away.name] || "un",
          kickoff_at: fixture.date,
          group_name: league.round,
          stage: "Group Stage",
          status: matchStatus,
          status_short: fixture.status.short,
          home_score: goals.home,
          away_score: goals.away,
          home_penalty: scoreObj?.penalty?.home ?? null,
          away_penalty: scoreObj?.penalty?.away ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error(`Error a ${fixture.id} while saving the match:`, error);
      } else {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} match is successfully updated!`,
    });
  } catch (error) {
    console.error("Synchronizing error:", error);
    return NextResponse.json(
      { error: "Inside error while synchronizing data." },
      { status: 500 },
    );
  }
}
