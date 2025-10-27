import { useState } from 'react';
import * as z from 'zod';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';

import { useCreateAssessment, usePlayers } from '../helpers/assessmentApi';
import {
  TeamTypeArrayValues,
  PositionTypeArrayValues,
  FootTypeArrayValues,
  AssessorTypeArrayValues,
} from '../helpers/schema';
import { schema as createAssessmentSchema } from '../endpoints/assessment/create_POST.schema';

import { Form, FormControl, FormItem, FormLabel, FormMessage, FormDescription, useForm } from './Form';
import { Input } from './Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Calendar } from './Calendar';
import { Button } from './Button';
import { ScoreInput } from './ScoreInput';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from './Command';
import styles from './AssessmentForm.module.css';

const formSchema = createAssessmentSchema;

const defaultValues: z.infer<typeof formSchema> = {
  playerName: '',
  team: '13M',
  position: 'MID',
  foot: 'Right',
  assessor: 'Ken Tougher',
  assessmentDate: new Date(),
  technicalScore: 3,
  tacticalScore: 3,
  physicalScore: 3,
  psychologicalScore: 3,
  socialScore: 3,
};

export const AssessmentForm = () => {
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [isPlayerSelectorOpen, setPlayerSelectorOpen] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [nameSearchTerm, setNameSearchTerm] = useState('');
  
  const createAssessment = useCreateAssessment();
  const { data: players, isFetching: isLoadingPlayers } = usePlayers();

  const form = useForm({
    schema: formSchema,
    defaultValues,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createAssessment.mutate(values, {
      onSuccess: () => {
        toast.success('Assessment created successfully!');
        form.setValues(defaultValues);
        setNameSearchTerm('');
      },
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(`Failed to create assessment: ${error.message}`);
        } else {
          toast.error('An unknown error occurred.');
        }
        console.error('Failed to create assessment:', error);
      },
    });
  };

  const handlePlayerSelect = (playerId: number) => {
    const player = players?.find((p) => p.id === playerId);
    if (player) {
      form.setValues((prev) => ({
        ...prev,
        playerName: player.name,
        team: player.team,
        position: player.position,
        foot: player.foot,
      }));
      setNameSearchTerm(player.name);
    }
  };

  // Filter players based on name search
  const filteredPlayers = players?.filter((player) =>
    player.name.toLowerCase().includes(nameSearchTerm.toLowerCase())
  ) || [];

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Player Development Assessment</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          {/* Player Selection Dropdown */}
          <div className={styles.playerSelector}>
            <label className={styles.quickSelectLabel}>Quick Select</label>
            <Popover open={isPlayerSelectorOpen} onOpenChange={setPlayerSelectorOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={styles.playerSelectButton}>
                  Select Existing Player (Optional)
                </Button>
              </PopoverTrigger>
              <PopoverContent removeBackgroundAndPadding>
                <Command>
                  <CommandInput placeholder="Search players..." autoFocus />
                  <CommandList>
                    {isLoadingPlayers ? (
                      <div className={styles.loadingState}>Loading players...</div>
                    ) : (
                      <>
                        <CommandEmpty>No players found.</CommandEmpty>
                        {players?.map((player) => (
                          <CommandItem
                            key={player.id}
                            onSelect={() => {
                              handlePlayerSelect(player.id);
                              setPlayerSelectorOpen(false);
                            }}
                          >
                            <Check
                              className={styles.checkIcon}
                              style={{
                                opacity: form.values.playerName === player.name ? 1 : 0,
                              }}
                            />
                            <span>
                              {player.name} - {player.team} {player.position} ({player.foot})
                            </span>
                          </CommandItem>
                        ))}
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className={styles.grid}>
            <FormItem name="playerName" className={styles.span2}>
              <FormLabel>Player Name</FormLabel>
              <div className={styles.autocompleteWrapper}>
                <FormControl>
                  <Input
                    placeholder="e.g., John Doe"
                    value={form.values.playerName}
                    onChange={(e) => {
                      const value = e.target.value;
                      form.setValues((prev) => ({ ...prev, playerName: value }));
                      setNameSearchTerm(value);
                      setShowNameSuggestions(value.length > 0 && filteredPlayers.length > 0);
                    }}
                    onFocus={() => {
                      setShowNameSuggestions(form.values.playerName.length > 0 && filteredPlayers.length > 0);
                    }}
                    onBlur={() => {
                      // Delay closing to allow click events on suggestions
                      setTimeout(() => setShowNameSuggestions(false), 200);
                    }}
                  />
                </FormControl>
                {showNameSuggestions && (
                  <div className={styles.autocompleteSuggestions}>
                    {filteredPlayers.slice(0, 5).map((player) => (
                      <div
                        key={player.id}
                        className={styles.suggestionItem}
                        onMouseDown={(e) => {
                          // Prevent blur event from firing before click
                          e.preventDefault();
                          handlePlayerSelect(player.id);
                          setShowNameSuggestions(false);
                        }}
                      >
                        <span>
                          {player.name} - {player.team} {player.position} ({player.foot})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormDescription>
                Type to search existing players or enter a new name
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormItem name="team">
              <FormLabel>Team</FormLabel>
              <Select
                value={form.values.team}
                onValueChange={(value) => form.setValues((prev) => ({ ...prev, team: value as any }))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TeamTypeArrayValues.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>

            <FormItem name="position">
              <FormLabel>Position</FormLabel>
              <Select
                value={form.values.position}
                onValueChange={(value) => form.setValues((prev) => ({ ...prev, position: value as any }))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PositionTypeArrayValues.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>

            <FormItem name="foot">
              <FormLabel>Foot</FormLabel>
              <Select
                value={form.values.foot}
                onValueChange={(value) => form.setValues((prev) => ({ ...prev, foot: value as any }))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FootTypeArrayValues.map((foot) => (
                    <SelectItem key={foot} value={foot}>
                      {foot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>

            <FormItem name="assessor">
              <FormLabel>Assessor</FormLabel>
              <Select
                value={form.values.assessor}
                onValueChange={(value) => form.setValues((prev) => ({ ...prev, assessor: value as any }))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {AssessorTypeArrayValues.map((assessor) => (
                    <SelectItem key={assessor} value={assessor}>
                      {assessor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>

            <FormItem name="assessmentDate" className={styles.span2}>
              <FormLabel>Date of Assessment</FormLabel>
              <Popover open={isCalendarOpen} onOpenChange={setCalendarOpen}>
                <FormControl>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={styles.dateButton}>
                      {form.values.assessmentDate ? format(form.values.assessmentDate, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon size={16} />
                    </Button>
                  </PopoverTrigger>
                </FormControl>
                <PopoverContent removeBackgroundAndPadding>
                  <Calendar
                    mode="single"
                    selected={form.values.assessmentDate}
                    onSelect={(date) => {
                      if (date) {
                        form.setValues((prev) => ({ ...prev, assessmentDate: date }));
                      }
                      setCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          </div>

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

          <Button type="submit" disabled={createAssessment.isPending} className={styles.submitButton}>
            {createAssessment.isPending && <Loader2 size={16} className={styles.spinner} />}
            {createAssessment.isPending ? 'Submitting...' : 'Submit Assessment'}
          </Button>
        </form>
      </Form>
    </div>
  );
};