import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Assessments, Players, TeamTypeArrayValues, PositionTypeArrayValues, FootTypeArrayValues, AssessorTypeArrayValues } from '../../helpers/schema';

export const schema = z.object({
  playerName: z.string().min(1, "Player name is required"),
  team: z.enum(TeamTypeArrayValues),
  position: z.enum(PositionTypeArrayValues),
  foot: z.enum(FootTypeArrayValues),
  assessor: z.enum(AssessorTypeArrayValues),
  assessmentDate: z.date(),
  technicalScore: z.number().int().min(1).max(5),
  tacticalScore: z.number().int().min(1).max(5),
  physicalScore: z.number().int().min(1).max(5),
  psychologicalScore: z.number().int().min(1).max(5),
  socialScore: z.number().int().min(1).max(5)
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<Assessments> & {
  player: Selectable<Players>;
};

export const postAssessmentCreate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/assessment/create`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const text = await result.text();
  if (!result.ok) {
    const errorObject = superjson.parse<{error: string;}>(text);
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(text);
};