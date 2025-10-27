import { useState, useMemo } from 'react';
import { usePlayers, useAssessments } from '../helpers/assessmentApi';
import { Selectable } from 'kysely';
import { Players } from '../helpers/schema';
import { AssessmentWithPlayer } from '../endpoints/assessment/list_GET.schema';
import { PlayerHistoryList, SortConfig } from './PlayerHistoryList';
import { PlayerHistoryDetail } from './PlayerHistoryDetail';
import { Skeleton } from './Skeleton';
import styles from './PlayerHistory.module.css';

export type ProcessedPlayerData = Selectable<Players> & {
  assessmentCount: number;
  latestAssessmentDate: Date | null;
  averageScores: {
    technical: number;
    tactical: number;
    physical: number;
    psychological: number;
    social: number;
    overall: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  assessments: AssessmentWithPlayer[];
};

const calculateAverageScores = (assessments: AssessmentWithPlayer[]) => {
  const total = assessments.reduce(
    (acc, a) => {
      acc.technical += a.technicalScore;
      acc.tactical += a.tacticalScore;
      acc.physical += a.physicalScore;
      acc.psychological += a.psychologicalScore;
      acc.social += a.socialScore;
      return acc;
    },
    { technical: 0, tactical: 0, physical: 0, psychological: 0, social: 0 },
  );

  const count = assessments.length;
  const averages = {
    technical: count > 0 ? total.technical / count : 0,
    tactical: count > 0 ? total.tactical / count : 0,
    physical: count > 0 ? total.physical / count : 0,
    psychological: count > 0 ? total.psychological / count : 0,
    social: count > 0 ? total.social / count : 0,
  };

  const overall =
    count > 0
      ? (averages.technical + averages.tactical + averages.physical + averages.psychological + averages.social) / 5
      : 0;

  return { ...averages, overall };
};

const getTrend = (assessments: AssessmentWithPlayer[]): 'improving' | 'declining' | 'stable' => {
  if (assessments.length < 2) {
    return 'stable';
  }
  const sorted = [...assessments].sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
  const latest = (sorted[0].technicalScore + sorted[0].tacticalScore + sorted[0].physicalScore + sorted[0].psychologicalScore + sorted[0].socialScore) / 5;
  const previous = (sorted[1].technicalScore + sorted[1].tacticalScore + sorted[1].physicalScore + sorted[1].psychologicalScore + sorted[1].socialScore) / 5;

  if (latest > previous) return 'improving';
  if (latest < previous) return 'declining';
  return 'stable';
};

const LoadingSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.header}>
      <Skeleton style={{ width: '250px', height: '2.5rem' }} />
      <Skeleton style={{ width: '150px', height: '2.5rem' }} />
    </div>
    <div className={styles.listHeader}>
      <Skeleton style={{ width: '100px', height: '1rem' }} />
      <Skeleton style={{ width: '80px', height: '1rem' }} />
      <Skeleton style={{ width: '120px', height: '1rem' }} />
      <Skeleton style={{ width: '100px', height: '1rem' }} />
      <Skeleton style={{ width: '80px', height: '1rem' }} />
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className={styles.playerRowSkeleton}>
        <Skeleton style={{ width: '100px', height: '1.5rem' }} />
        <Skeleton style={{ width: '80px', height: '1.5rem' }} />
        <Skeleton style={{ width: '120px', height: '1.5rem' }} />
        <Skeleton style={{ width: '100px', height: '1.5rem' }} />
        <Skeleton style={{ width: '80px', height: '1.5rem' }} />
      </div>
    ))}
  </div>
);

export const PlayerHistory = () => {
  const { data: players, isFetching: isPlayersFetching, error: playersError } = usePlayers();
  const { data: assessments, isFetching: isAssessmentsFetching, error: assessmentsError } = useAssessments();

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });

  const processedData = useMemo<ProcessedPlayerData[]>(() => {
    if (!players || !assessments) return [];

    return players.map(player => {
      const playerAssessments = assessments.filter(a => a.playerId === player.id);
      const sortedAssessments = [...playerAssessments].sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());

      return {
        ...player,
        assessmentCount: playerAssessments.length,
        latestAssessmentDate: playerAssessments.length > 0 ? sortedAssessments[0].assessmentDate : null,
        averageScores: calculateAverageScores(playerAssessments),
        trend: getTrend(playerAssessments),
        assessments: sortedAssessments,
      };
    });
  }, [players, assessments]);

  const filteredAndSortedData = useMemo(() => {
    let data = [...processedData];

    if (searchTerm) {
      data = data.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    data.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof typeof a];
      let bValue: any = b[sortConfig.key as keyof typeof b];

      if (sortConfig.key === 'latestAssessmentDate') {
        aValue = a.latestAssessmentDate ? new Date(a.latestAssessmentDate).getTime() : 0;
        bValue = b.latestAssessmentDate ? new Date(b.latestAssessmentDate).getTime() : 0;
      } else if (sortConfig.key === 'averageScore') {
        aValue = a.averageScores.overall;
        bValue = b.averageScores.overall;
      }

      if (aValue === null || bValue === null) return 0;
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

    return data;
  }, [processedData, searchTerm, sortConfig]);

  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerId) return null;
    return processedData.find(p => p.id === selectedPlayerId) || null;
  }, [selectedPlayerId, processedData]);

  const handleSelectPlayer = (playerId: number) => {
    setSelectedPlayerId(playerId);
  };

  const handleBack = () => {
    setSelectedPlayerId(null);
  };

  const isFetching = isPlayersFetching || isAssessmentsFetching;
  const error = playersError || assessmentsError;

  if (isFetching && !players && !assessments) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <div className={styles.error}>Failed to load player history: {error.message}</div>;
  }

  if (selectedPlayer) {
    return <PlayerHistoryDetail player={selectedPlayer} onBack={handleBack} />;
  }

  return (
    <PlayerHistoryList
      players={filteredAndSortedData}
      onSelectPlayer={handleSelectPlayer}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      sortConfig={sortConfig}
      onSortChange={setSortConfig}
    />
  );
};