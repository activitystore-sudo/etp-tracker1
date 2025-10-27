import { useState } from 'react';
import { Search, ArrowUp, ArrowDown, Minus, ChevronsUpDown, Mail } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { ExportDialog } from './ExportDialog';
import { useExportPlayerHistory } from '../helpers/exportApi';
import { ProcessedPlayerData } from './PlayerHistory';
import styles from './PlayerHistory.module.css';

export type SortKey = 'name' | 'team' | 'assessmentCount' | 'latestAssessmentDate' | 'averageScore';
export type SortDirection = 'ascending' | 'descending';
export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface Props {
  players: ProcessedPlayerData[];
  onSelectPlayer: (playerId: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

const TrendIcon = ({ trend }: { trend: 'improving' | 'declining' | 'stable' }) => {
  const iconMap = {
    improving: <ArrowUp size={18} />,
    declining: <ArrowDown size={18} />,
    stable: <Minus size={18} />,
  };
  return (
    <div className={styles.trendIcon} data-trend={trend}>
      {iconMap[trend]}
    </div>
  );
};

const SortableHeader = ({
  label,
  sortKey,
  sortConfig,
  onSortChange,
}: {
  label: string;
  sortKey: SortKey;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}) => {
  const isActive = sortConfig.key === sortKey;
  const isAscending = sortConfig.direction === 'ascending';

  const handleClick = () => {
    const direction = isActive && isAscending ? 'descending' : 'ascending';
    onSortChange({ key: sortKey, direction });
  };

  return (
    <div
      className={`${styles.sortableHeader} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {label}
      <span className={styles.sortIcon}>
        {isActive ? isAscending ? <ArrowUp size={14} /> : <ArrowDown size={14} /> : <ChevronsUpDown size={14} />}
      </span>
    </div>
  );
};

export const PlayerHistoryList = ({
  players,
  onSelectPlayer,
  searchTerm,
  onSearchChange,
  sortConfig,
  onSortChange,
}: Props) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const exportMutation = useExportPlayerHistory();

  const handleExport = (email: string) => {
    exportMutation.mutate(
      { recipientEmail: email },
      {
        onSuccess: () => {
          setIsExportDialogOpen(false);
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <Input
            type="search"
            placeholder="Search by player name..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Button onClick={() => setIsExportDialogOpen(true)} variant="outline">
          <Mail />
          Export to Email
        </Button>
      </div>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
        isPending={exportMutation.isPending}
        title="Export Player History"
        description="Enter the email address where you want to receive the player history data."
      />

      <div className={styles.listHeader}>
        <SortableHeader label="Player" sortKey="name" sortConfig={sortConfig} onSortChange={onSortChange} />
        <SortableHeader label="Team" sortKey="team" sortConfig={sortConfig} onSortChange={onSortChange} />
        <SortableHeader label="Assessments" sortKey="assessmentCount" sortConfig={sortConfig} onSortChange={onSortChange} />
        <SortableHeader label="Last Assessed" sortKey="latestAssessmentDate" sortConfig={sortConfig} onSortChange={onSortChange} />
        <SortableHeader label="Overall Avg." sortKey="averageScore" sortConfig={sortConfig} onSortChange={onSortChange} />
        <span>Trend</span>
      </div>

      {players.length > 0 ? (
        players.map(player => (
          <div
            key={player.id}
            className={styles.playerRow}
            onClick={() => onSelectPlayer(player.id)}
            role="button"
            tabIndex={0}
          >
            <div>
              <div className={styles.playerName}>{player.name}</div>
              <div className={styles.playerMeta}>
                {player.position} &middot; {player.foot}
              </div>
            </div>
            <div>{player.team}</div>
            <div>{player.assessmentCount}</div>
            <div>{player.latestAssessmentDate ? new Date(player.latestAssessmentDate).toLocaleDateString() : 'N/A'}</div>
            <div>{player.averageScores.overall.toFixed(2)}</div>
            <TrendIcon trend={player.trend} />
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>
          <p>No players found.</p>
        </div>
      )}
    </div>
  );
};