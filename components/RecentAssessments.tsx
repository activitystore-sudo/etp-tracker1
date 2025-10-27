import { useState } from 'react';
import { useAssessments } from '../helpers/assessmentApi';
import { useExportAssessments } from '../helpers/exportApi';
import { AssessmentWithPlayer } from '../endpoints/assessment/list_GET.schema';
import { Skeleton } from './Skeleton';
import { Badge } from './Badge';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { EditAssessmentDialog } from './EditAssessmentDialog';
import { Mail } from 'lucide-react';
import styles from './RecentAssessments.module.css';

const getScoreVariant = (score: number): 'destructive' | 'warning' | 'success' => {
  if (score <= 2) return 'destructive';
  if (score === 3) return 'warning';
  return 'success';
};

const AssessmentCard = ({ assessment }: { assessment: AssessmentWithPlayer }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const averageScore =
    (assessment.technicalScore +
      assessment.tacticalScore +
      assessment.physicalScore +
      assessment.psychologicalScore +
      assessment.socialScore) /
    5;

  return (
    <>
      <div className={styles.card} onClick={() => setDialogOpen(true)} role="button" tabIndex={0}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.playerName}>{assessment.player.name}</h3>
            <p className={styles.playerDetails}>
              {assessment.player.team} &middot; {assessment.player.position}
            </p>
          </div>
          <div className={styles.averageScore} data-variant={getScoreVariant(averageScore)}>
            {averageScore.toFixed(1)}
            <span>AVG</span>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.scoreItem}>
            <span>Technical</span>
            <Badge variant={getScoreVariant(assessment.technicalScore)}>{assessment.technicalScore}</Badge>
          </div>
          <div className={styles.scoreItem}>
            <span>Tactical</span>
            <Badge variant={getScoreVariant(assessment.tacticalScore)}>{assessment.tacticalScore}</Badge>
          </div>
          <div className={styles.scoreItem}>
            <span>Physical</span>
            <Badge variant={getScoreVariant(assessment.physicalScore)}>{assessment.physicalScore}</Badge>
          </div>
          <div className={styles.scoreItem}>
            <span>Psychological</span>
            <Badge variant={getScoreVariant(assessment.psychologicalScore)}>{assessment.psychologicalScore}</Badge>
          </div>
          <div className={styles.scoreItem}>
            <span>Social</span>
            <Badge variant={getScoreVariant(assessment.socialScore)}>{assessment.socialScore}</Badge>
          </div>
        </div>
        <div className={styles.cardFooter}>
          <span>{assessment.assessor}</span>
          <span>{new Date(assessment.assessmentDate).toLocaleDateString()}</span>
        </div>
      </div>
      <EditAssessmentDialog assessment={assessment} isOpen={isDialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

const LoadingSkeleton = () => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <div>
        <Skeleton style={{ width: '120px', height: '1.5rem', marginBottom: 'var(--spacing-1)' }} />
        <Skeleton style={{ width: '80px', height: '1rem' }} />
      </div>
      <Skeleton style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
    </div>
    <div className={styles.cardBody}>
      {[...Array(5)].map((_, i) => (
        <div className={styles.scoreItem} key={i}>
          <Skeleton style={{ width: '100px', height: '1rem' }} />
          <Skeleton style={{ width: '30px', height: '1.5rem', borderRadius: 'var(--radius-full)' }} />
        </div>
      ))}
    </div>
    <div className={styles.cardFooter}>
      <Skeleton style={{ width: '100px', height: '1rem' }} />
      <Skeleton style={{ width: '80px', height: '1rem' }} />
    </div>
  </div>
);

export const RecentAssessments = () => {
  const { data: assessments, isFetching, error } = useAssessments();
  const exportMutation = useExportAssessments();

  const sortedAssessments = assessments
    ? [...assessments].sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())
    : [];

  const handleExport = () => {
    exportMutation.mutate({ recipientEmail: 'stefanpersson80@hotmail.com' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Assessments</h2>
        <Button 
          onClick={handleExport} 
          disabled={exportMutation.isPending}
          variant="outline"
        >
          {exportMutation.isPending ? (
            <>
              <Spinner size="sm" />
              Exporting...
            </>
          ) : (
            <>
              <Mail />
              Export to Email
            </>
          )}
        </Button>
      </div>
      {error && <div className={styles.error}>Failed to load assessments: {error.message}</div>}
      <div className={styles.grid}>
        {isFetching && !assessments
          ? Array.from({ length: 6 }).map((_, index) => <LoadingSkeleton key={index} />)
          : sortedAssessments.map((assessment) => <AssessmentCard key={assessment.id} assessment={assessment} />)}
        {!isFetching && sortedAssessments.length === 0 && <p>No assessments found.</p>}
      </div>
    </div>
  );
};