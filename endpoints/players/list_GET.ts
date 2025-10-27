import { db } from '../../helpers/db';
import { OutputType } from "./list_GET.schema";
import superjson from 'superjson';
import { getServerUserSession } from '../../helpers/getServerUserSession';

export async function handle(request: Request) {
  try {
    // Check authentication
    const { user } = await getServerUserSession(request);
    if (user.status !== 'approved') {
      return new Response(superjson.stringify({ error: 'User not approved' }), { status: 401 });
    }

    const players = await db.selectFrom('players').selectAll().orderBy('name', 'asc').execute();

    return new Response(superjson.stringify(players satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error listing players:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}