import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { postAssessmentExport, InputType as AssessmentExportInputType } from "../endpoints/assessment/export_POST.schema";
import { postPlayersExport, InputType as PlayersExportInputType } from "../endpoints/players/export_POST.schema";

/**
 * A React Query mutation hook for exporting assessments.
 * It calls the `postAssessmentExport` endpoint and provides UI feedback via toasts.
 */
export const useExportAssessments = () => {
  return useMutation({
    mutationFn: (data: AssessmentExportInputType) => postAssessmentExport(data),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred during export.");
      }
    },
  });
};

/**
 * A React Query mutation hook for exporting player history.
 * It calls the `postPlayersExport` endpoint and provides UI feedback via toasts.
 */
export const useExportPlayerHistory = () => {
  return useMutation({
    mutationFn: (data: PlayersExportInputType) => postPlayersExport(data),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred during export.");
      }
    },
  });
};