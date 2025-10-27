import { z } from "zod";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./approve_user_POST.schema";

export async function handle(request: Request) {
  const { user } = await getServerUserSession(request);

  // Admin-only endpoint
  if (user.role !== 'admin') {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const body = await request.json();
  const validatedData = schema.parse(body);
  const { userId, status } = validatedData;

  const targetUser = await db.selectFrom('users').select('status').where('id', '=', userId).executeTakeFirst();

  if (!targetUser) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  // Optional: Prevent re-approving/rejecting already processed users
  if (targetUser.status !== 'pending') {
      return new Response(JSON.stringify({ error: `User is already ${targetUser.status}` }), { status: 400 });
  }

  await db
    .updateTable('users')
    .set({ status })
    .where('id', '=', userId)
    .execute();

  const response: OutputType = {
    success: true,
    message: `User status updated to ${status}.`,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}