import { z } from "zod";

export const schema = z.object({
  userId: z.number().int(),
  status: z.enum(["approved", "rejected"]),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  message: string;
};

export const postApproveUser = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/admin/approve_user`, {
    method: "POST",
    body: JSON.stringify(validatedInput),
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