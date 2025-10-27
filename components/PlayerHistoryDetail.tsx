import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from './Chart';
import { Button } from './Button';
import { Badge } from './Badge';
import { ProcessedPlayerData } from './PlayerHistory';
import { AssessmentWithPlayer } from '../endpoints/assessment/list_GET.schema';
import styles from './PlayerHistory.module.css';

interface Props {
  player: ProcessedPlayerData;
  onBack: () => void;
}

const getScoreVariant = (score: number): 'destructive' | 'warning' | 'success' => {
  if (score <= 2) return 'destructive';
  if (score === 3) return 'warning';
  return 'success';
};

const chartConfig = {
  technical: { label: 'Technical', color: 'var(--chart-color-1)' },
  tactical: { label: 'Tactical', color: 'var(--chart-color-2)' },
  physical: { label: 'Physical', color: 'var(--chart-color-3)' },
  psychological: { label: 'Psychological', color: 'var(--chart-color-4)' },
  social: { label: 'Social', color: 'var(--chart-color-5)' },
} satisfies ChartConfig;

const AssessmentCard = ({ assessment }: { assessment: AssessmentWithPlayer }) => {
  const averageScore =
    (assessment.technicalScore +
      assessment.tacticalScore +
      assessment.physicalScore +
      assessment.psychologicalScore +
      assessment.socialScore) /
    5;

  return (
    <div className={styles.assessmentCard}>
      <div className={styles.assessmentCardHeader}>
        <div>
          <div className={styles.assessmentDate}>{new Date(assessment.assessmentDate).toLocaleDateString()}</div>
          <div className={styles.assessorName}>Assessed by {assessment.assessor}</div>
        </div>
        <div className={styles.averageScore} data-variant={getScoreVariant(averageScore)}>
          {averageScore.toFixed(1)}
          <span>AVG</span>
        </div>
      </div>
      <div className={styles.assessmentScores}>
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
    </div>
  );
};

export const PlayerHistoryDetail = ({ player, onBack }: Props) => {
  const chartData = useMemo(() => {
    return player.assessments
      .map(a => ({
        date: new Date(a.assessmentDate).toLocaleDateString('en-CA'), // YYYY-MM-DD for sorting
        name: new Date(a.assessmentDate).toLocaleDateString(),
        technical: a.technicalScore,
        tactical: a.tacticalScore,
        physical: a.physicalScore,
        psychological: a.psychologicalScore,
        social: a.socialScore,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [player.assessments]);

  return (
    <div className={styles.detailContainer}>
      <div className={styles.detailHeader}>
        <div className={styles.detailPlayerInfo}>
          <h2>{player.name}</h2>
          <p>
            {player.team} &middot; {player.position} &middot; {player.foot} Foot
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to List
        </Button>
      </div>

      {player.assessments.length > 0 && (
        <div className={styles.chartContainer}>
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis domain={[0, 5]} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="technical" fill="var(--color-technical)" radius={4} />
              <Bar dataKey="tactical" fill="var(--color-tactical)" radius={4} />
              <Bar dataKey="physical" fill="var(--color-physical)" radius={4} />
              <Bar dataKey="psychological" fill="var(--color-psychological)" radius={4} />
              <Bar dataKey="social" fill="var(--color-social)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      )}

      <div className={styles.assessmentsList}>
        <h3>All Assessments ({player.assessmentCount})</h3>
        {player.assessments.length > 0 ? (
          player.assessments.map(assessment => <AssessmentCard key={assessment.id} assessment={assessment} />)
        ) : (
          <p className={styles.emptyState}>This player has no assessments yet.</p>
        )}
      </div>
    </div>
  );
};