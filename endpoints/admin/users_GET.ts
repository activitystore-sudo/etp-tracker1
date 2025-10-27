import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./users_GET.schema";

export async function handle(request: Request) {
  const { user } = await getServerUserSession(request);

  // Admin-only endpoint
  if (user.role !== 'admin') {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');

  // Only include status in the object if it's not null
  const paramsToValidate = status ? { status } : {};
  const validatedParams = schema.safeParse(paramsToValidate);
  if (!validatedParams.success) {
    return new Response(JSON.stringify({ error: "Invalid query parameters" }), { status: 400 });
  }

  let query = db.selectFrom('users')
    .select(['id', 'email', 'displayName', 'avatarUrl', 'role', 'status', 'createdAt'])
    .orderBy('createdAt', 'desc');

  if (validatedParams.data.status) {
    query = query.where('status', '=', validatedParams.data.status);
  }

  const users = await query.execute();

  return new Response(JSON.stringify(users), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}