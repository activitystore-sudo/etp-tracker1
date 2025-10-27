import { db } from '../../helpers/db';
import { schema, OutputType } from "./create_POST.schema";
import superjson from 'superjson';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { Insertable, Selectable } from "kysely";
import { DB, Players } from '../../helpers/schema';

export async function handle(request: Request) {
  try {
    // Check authentication
    const { user } = await getServerUserSession(request);
    if (user.status !== 'approved') {
      return new Response(superjson.stringify({ error: 'User not approved' }), { status: 401 });
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const {
      playerName,
      team,
      position,
      foot,
      assessor,
      assessmentDate,
      technicalScore,
      tacticalScore,
      physicalScore,
      psychologicalScore,
      socialScore
    } = input;

    const assessmentWithPlayer = await db.transaction().execute(async (trx) => {
      let player: Selectable<Players> | undefined = await trx.
      selectFrom('players').
      selectAll().
      where('name', '=', playerName).
      where('team', '=', team).
      where('position', '=', position).
      where('foot', '=', foot).
      executeTakeFirst();

      if (!player) {
        const newPlayer: Insertable<Players> = {
          name: playerName,
          team,
          position,
          foot
        };
        player = await trx.
        insertInto('players').
        values(newPlayer).
        returningAll().
        executeTakeFirstOrThrow();
      }

      const newAssessment = await trx.
      insertInto('assessments').
      values({
        playerId: player.id,
        assessor,
        assessmentDate,
        technicalScore,
        tacticalScore,
        physicalScore,
        psychologicalScore,
        socialScore
      }).
      returningAll().
      executeTakeFirstOrThrow();

      return {
        ...newAssessment,
        player
      };
    });

    return new Response(superjson.stringify(assessmentWithPlayer satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}