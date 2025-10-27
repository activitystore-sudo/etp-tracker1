import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useUpdateAssessment } from '../helpers/assessmentApi';
import { schema as updateAssessmentSchema } from '../endpoints/assessment/update_POST.schema';
import { AssessmentWithPlayer } from '../endpoints/assessment/list_GET.schema';
import { Form, useForm } from './Form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './Dialog';
import { Button } from './Button';
import { ScoreInput } from './ScoreInput';
import styles from './EditAssessmentDialog.module.css';

const formSchema = updateAssessmentSchema;

interface EditAssessmentDialogProps {
  assessment: AssessmentWithPlayer;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const EditAssessmentDialog = ({ assessment, isOpen, onOpenChange }: EditAssessmentDialogProps) => {
  const updateAssessment = useUpdateAssessment();

  const form = useForm({
    schema: formSchema,
    defaultValues: {
      assessmentId: assessment.id,
      technicalScore: assessment.technicalScore,
      tacticalScore: assessment.tacticalScore,
      physicalScore: assessment.physicalScore,
      psychologicalScore: assessment.psychologicalScore,
      socialScore: assessment.socialScore,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateAssessment.mutate(values, {
      onSuccess: () => {
        toast.success('Assessment updated successfully!');
        onOpenChange(false);
      },
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(`Failed to update assessment: ${error.message}`);
        } else {
          toast.error('An unknown error occurred.');
        }
        console.error('Failed to update assessment:', error);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Assessment for {assessment.player.name}</DialogTitle>
          <DialogDescription>Update the scores below. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="edit-assessment-form">
            <div className={styles.scoresSection}>
              <ScoreInput
                name="technicalScore"
                label="Technical"
                value={form.values.technicalScore}
                onChange={(value) => form.setValues((prev) => ({ ...prev, technicalScore: value }))}
              />
              <ScoreInput
                name="tacticalScore"
                label="Tactical"
                value={form.values.tacticalScore}
                onChange={(value) => form.setValues((prev) => ({ ...prev, tacticalScore: value }))}
              />
              <ScoreInput
                name="physicalScore"
                label="Physical"
                value={form.values.physicalScore}
                onChange={(value) => form.setValues((prev) => ({ ...prev, physicalScore: value }))}
              />
              <ScoreInput
                name="psychologicalScore"
                label="Psychological"
                value={form.values.psychologicalScore}
                onChange={(value) => form.setValues((prev) => ({ ...prev, psychologicalScore: value }))}
              />
              <ScoreInput
                name="socialScore"
                label="Social"
                value={form.values.socialScore}
                onChange={(value) => form.setValues((prev) => ({ ...prev, socialScore: value }))}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="edit-assessment-form" disabled={updateAssessment.isPending}>
            {updateAssessment.isPending && <Loader2 size={16} className={styles.spinner} />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};