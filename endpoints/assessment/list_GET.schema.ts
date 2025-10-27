import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Assessments, Players, TeamTypeArrayValues, AssessorTypeArrayValues } from '../../helpers/schema';

export const schema = z.object({
  team: z.enum(TeamTypeArrayValues).optional(),
  assessor: z.enum(AssessorTypeArrayValues).optional()
});

export type InputType = z.infer<typeof schema>;

export type AssessmentWithPlayer = Selectable<Assessments> & {
  player: Pick<Selectable<Players>, 'id' | 'name' | 'team' | 'position' | 'foot'>;
};

export type OutputType = AssessmentWithPlayer[];

export const getAssessmentList = async (params?: InputType, init?: RequestInit): Promise<OutputType> => {
  const query = new URLSearchParams();
  if (params?.team) query.set('team', params.team);
  if (params?.assessor) query.set('assessor', params.assessor);

  const result = await fetch(`/_api/assessment/list?${query.toString()}`, {
    method: "GET",
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