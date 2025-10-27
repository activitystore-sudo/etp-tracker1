import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postAssessmentCreate, InputType as CreateAssessmentInput } from '../endpoints/assessment/create_POST.schema';
import { getAssessmentList, InputType as ListAssessmentsInput } from '../endpoints/assessment/list_GET.schema';
import { postAssessmentUpdate, InputType as UpdateAssessmentInput } from '../endpoints/assessment/update_POST.schema';
import { getPlayersList } from '../endpoints/players/list_GET.schema';

// Query Keys
const assessmentKeys = {
  all: ['assessments'] as const,
  lists: () => [...assessmentKeys.all, 'list'] as const,
  list: (filters: ListAssessmentsInput) => [...assessmentKeys.lists(), filters] as const,
};

const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
};

/**
 * Query hook to fetch a list of assessments, with optional filters.
 */
export const useAssessments = (filters: ListAssessmentsInput = {}) => {
  return useQuery({
    queryKey: assessmentKeys.list(filters),
    queryFn: () => getAssessmentList(filters),
  });
};

/**
 * Query hook to fetch a list of all players.
 */
export const usePlayers = () => {
  return useQuery({
    queryKey: playerKeys.lists(),
    queryFn: () => getPlayersList(),
  });
};

/**
 * Mutation hook to create a new assessment.
 * Invalidates assessment and player lists on success.
 */
export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssessmentInput) => postAssessmentCreate(data),
    onSuccess: () => {
      // Invalidate both assessments and players queries as a new player might have been created
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
};

/**
 * Mutation hook to update an existing assessment.
 * Invalidates the assessment list on success.
 */
export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAssessmentInput) => postAssessmentUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
};