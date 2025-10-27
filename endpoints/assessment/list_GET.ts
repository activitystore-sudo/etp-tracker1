import { db } from '../../helpers/db';
import { schema, OutputType } from "./list_GET.schema";
import superjson from 'superjson';
import { getServerUserSession } from '../../helpers/getServerUserSession';

export async function handle(request: Request) {
  try {
    // Check authentication
    const { user } = await getServerUserSession(request);
    if (user.status !== 'approved') {
      return new Response(superjson.stringify({ error: 'User not approved' }), { status: 401 });
    }

    const url = new URL(request.url);
    const queryParams = {
      team: url.searchParams.get('team') || undefined,
      assessor: url.searchParams.get('assessor') || undefined
    };

    const input = schema.parse(queryParams);

    let query = db.
    selectFrom('assessments').
    innerJoin('players', 'players.id', 'assessments.playerId').
    selectAll('assessments').
    select([
    'players.name as playerName',
    'players.team as playerTeam',
    'players.position as playerPosition',
    'players.foot as playerFoot']
    ).
    orderBy('assessments.assessmentDate', 'desc');

    if (input.team) {
      query = query.where('players.team', '=', input.team);
    }

    if (input.assessor) {
      query = query.where('assessments.assessor', '=', input.assessor);
    }

    const assessments = await query.execute();

    const result: OutputType = assessments.map((a) => ({
      ...a,
      player: {
        id: a.playerId,
        name: a.playerName,
        team: a.playerTeam,
        position: a.playerPosition,
        foot: a.playerFoot,
        createdAt: null, // Not fetched, can be added if needed
        updatedAt: null // Not fetched, can be added if needed
      }
    }));

    return new Response(superjson.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error listing assessments:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}