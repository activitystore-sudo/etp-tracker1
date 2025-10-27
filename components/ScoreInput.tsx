import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';
import { FormItem, FormLabel } from './Form';
import styles from './ScoreInput.module.css';

const scoreMap: { [key: number]: string } = {
  1: 'Not Yet Demonstrated',
  2: 'Inconsistent',
  3: 'Functional',
  4: 'Effective',
  5: 'Advanced',
};

interface ScoreInputProps {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export const ScoreInput = ({ name, label, value, onChange }: ScoreInputProps) => {
  const handleValueChange = (val: string) => {
    if (val) {
      onChange(parseInt(val, 10));
    }
  };

  return (
    <FormItem name={name} className={styles.container}>
      <div className={styles.labelWrapper}>
        <FormLabel>{label}</FormLabel>
        <span className={styles.scoreDescription}>{scoreMap[value]}</span>
      </div>
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={handleValueChange}
        className={styles.toggleGroup}
      >
        {[1, 2, 3, 4, 5].map((score) => (
          <ToggleGroupItem key={score} value={String(score)} aria-label={`Score ${score}`}>
            {score}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </FormItem>
  );
};