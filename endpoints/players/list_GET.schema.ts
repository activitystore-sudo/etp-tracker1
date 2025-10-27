import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Players } from '../../helpers/schema';

// No input schema needed for a simple list GET

export type OutputType = Selectable<Players>[];

export const getPlayersList = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/players/list`, {
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