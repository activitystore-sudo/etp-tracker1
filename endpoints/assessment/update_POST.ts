import { db } from '../../helpers/db';
import { schema, OutputType } from "./update_POST.schema";
import superjson from 'superjson';
import { getServerUserSession } from '../../helpers/getServerUserSession';

export async function handle(request: Request) {
  try {
    // Check authentication
    const { user } = await getServerUserSession(request);
    if (user.status !== 'approved') {
      return new Response(superjson.stringify({ error: 'User not approved' }), { status: 401 });
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const { assessmentId, ...scores } = input;

    const updatedAssessment = await db.
    updateTable('assessments').
    set({
      ...scores,
      updatedAt: new Date()
    }).
    where('id', '=', assessmentId).
    returningAll().
    executeTakeFirstOrThrow();

    return new Response(superjson.stringify(updatedAssessment satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error updating assessment:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}