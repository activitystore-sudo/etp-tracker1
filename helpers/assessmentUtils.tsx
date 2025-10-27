export const scoreLabels: Record<number, string> = {
  1: "Not Yet Demonstrated",
  2: "Inconsistent",
  3: "Functional",
  4: "Effective",
  5: "Advanced",
};

/**
 * Converts a numeric score to its corresponding descriptive label.
 * @param score The numeric score (1-5).
 * @returns The descriptive label and the score, e.g., "4 - Effective".
 */
export const getScoreLabel = (score: number): string => {
  const label = scoreLabels[score] || "Unknown Score";
  return `${score} - ${label}`;
};