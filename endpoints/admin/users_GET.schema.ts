import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Users } from "../../helpers/schema";

// Define a schema for the query parameters
export const schema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).nullable().optional(),
});

export type InputType = z.infer<typeof schema>;

// Output type will be an array of user objects, but without sensitive data.
// We can reuse the User type from helpers, but we need createdAt for the admin page.
export type UserForAdmin = Omit<Pick<Selectable<Users>, 'id' | 'email' | 'displayName' | 'avatarUrl' | 'status' | 'createdAt'>, 'role'> & {
  role: "admin" | "user";
};
export type OutputType = UserForAdmin[];

export const getUsers = async (params?: InputType, init?: RequestInit): Promise<OutputType> => {
  const query = new URLSearchParams();
  if (params?.status) {
    query.set('status', params.status);
  }

  const result = await fetch(`/_api/admin/users?${query.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await result.text();
  if (!result.ok) {
    const errorObject = JSON.parse(text) as { error: string };
    throw new Error(errorObject.error);
  }
  return JSON.parse(text) as OutputType;
};