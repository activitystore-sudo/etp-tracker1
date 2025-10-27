import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  recipientEmail: z.string().email({ message: "Please enter a valid email address." }),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  message: string;
};

export const postAssessmentExport = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/assessment/export`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await result.text();
  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(text);
    throw new Error(errorObject.error);
  }
  
  return superjson.parse<OutputType>(text);
};