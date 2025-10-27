import { db } from '../../helpers/db';
import { schema, OutputType } from "./export_POST.schema";
import superjson from 'superjson';
import * as xlsx from 'xlsx';
import { getScoreLabel } from '../../helpers/assessmentUtils';
import { Selectable } from 'kysely';
import { Assessments, Players } from '../../helpers/schema';
import { getServerUserSession } from '../../helpers/getServerUserSession';

type PlayerWithAssessments = Selectable<Players> & { assessments: Selectable<Assessments>[] };

export async function handle(request: Request) {
  try {
    // Check authentication
    const { user } = await getServerUserSession(request);
    if (user.status !== 'approved') {
      return new Response(superjson.stringify({ error: 'User not approved' }), { status: 401 });
    }

    const json = superjson.parse(await request.text());
    const { recipientEmail } = schema.parse(json);

    const apiKey = process.env.EMAIL_API_KEY;
    if (!apiKey) {
      console.error("EMAIL_API_KEY is not set.");
      throw new Error("Email service is not configured.");
    }

    // 1. Fetch all players and assessments
    const players = await db.selectFrom('players').selectAll().execute();
    const assessments = await db.selectFrom('assessments').selectAll().orderBy('assessmentDate', 'desc').execute();

    if (players.length === 0) {
      return new Response(superjson.stringify({ error: "No players found to export." }), { status: 404 });
    }

    // 2. Map assessments to players
    const assessmentsByPlayerId = new Map<number, Selectable<Assessments>[]>();
    for (const assessment of assessments) {
      if (!assessmentsByPlayerId.has(assessment.playerId)) {
        assessmentsByPlayerId.set(assessment.playerId, []);
      }
      assessmentsByPlayerId.get(assessment.playerId)!.push(assessment);
    }

    const playersWithAssessments: PlayerWithAssessments[] = players.map(player => ({
      ...player,
      assessments: assessmentsByPlayerId.get(player.id) || [],
    }));

    // 3. Generate data for "Player Overview" sheet
    const overviewData = playersWithAssessments.map(player => {
      const numAssessments = player.assessments.length;
      if (numAssessments === 0) {
        return {
          'Player Name': player.name,
          'Team': player.team,
          'Position': player.position,
          'Foot': player.foot,
          'Total Assessments': 0,
          'Latest Assessment Date': 'N/A',
          'Avg Technical': 'N/A',
          'Avg Tactical': 'N/A',
          'Avg Physical': 'N/A',
          'Avg Psychological': 'N/A',
          'Avg Social': 'N/A',
          'Overall Average': 'N/A',
        };
      }

      const latestAssessmentDate = player.assessments[0].assessmentDate.toISOString().split('T')[0];
      
      const sum = player.assessments.reduce((acc, a) => ({
        tech: acc.tech + a.technicalScore,
        tact: acc.tact + a.tacticalScore,
        phys: acc.phys + a.physicalScore,
        psych: acc.psych + a.psychologicalScore,
        soc: acc.soc + a.socialScore,
      }), { tech: 0, tact: 0, phys: 0, psych: 0, soc: 0 });

      const avgTechnical = sum.tech / numAssessments;
      const avgTactical = sum.tact / numAssessments;
      const avgPhysical = sum.phys / numAssessments;
      const avgPsychological = sum.psych / numAssessments;
      const avgSocial = sum.soc / numAssessments;
      const overallAverage = (avgTechnical + avgTactical + avgPhysical + avgPsychological + avgSocial) / 5;

      return {
        'Player Name': player.name,
        'Team': player.team,
        'Position': player.position,
        'Foot': player.foot,
        'Total Assessments': numAssessments,
        'Latest Assessment Date': latestAssessmentDate,
        'Avg Technical': avgTechnical.toFixed(2),
        'Avg Tactical': avgTactical.toFixed(2),
        'Avg Physical': avgPhysical.toFixed(2),
        'Avg Psychological': avgPsychological.toFixed(2),
        'Avg Social': avgSocial.toFixed(2),
        'Overall Average': overallAverage.toFixed(2),
      };
    });

    // 4. Generate data for "Detailed History" sheet
    const playerMap = new Map(players.map(p => [p.id, p]));
    const detailedHistoryData = assessments.map(assessment => {
      const player = playerMap.get(assessment.playerId);
      const scores = [
        assessment.technicalScore,
        assessment.tacticalScore,
        assessment.physicalScore,
        assessment.psychologicalScore,
        assessment.socialScore,
      ];
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      return {
        'Player Name': player?.name ?? 'Unknown',
        'Team': player?.team ?? 'Unknown',
        'Position': player?.position ?? 'Unknown',
        'Foot': player?.foot ?? 'Unknown',
        'Assessor': assessment.assessor,
        'Assessment Date': assessment.assessmentDate.toISOString().split('T')[0],
        'Technical Score': getScoreLabel(assessment.technicalScore),
        'Tactical Score': getScoreLabel(assessment.tacticalScore),
        'Physical Score': getScoreLabel(assessment.physicalScore),
        'Psychological Score': getScoreLabel(assessment.psychologicalScore),
        'Social Score': getScoreLabel(assessment.socialScore),
        'Average Score': averageScore.toFixed(2),
      };
    });

    // 5. Generate Excel file
    const overviewSheet = xlsx.utils.json_to_sheet(overviewData);
    const detailedHistorySheet = xlsx.utils.json_to_sheet(detailedHistoryData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, overviewSheet, 'Player Overview');
    xlsx.utils.book_append_sheet(workbook, detailedHistorySheet, 'Detailed History');
    const excelBase64 = xlsx.write(workbook, { type: 'base64', bookType: 'xlsx' });

    // 6. Send email using SendGrid
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `player-history-export-${currentDate}.xlsx`;

    const sendGridPayload = {
      personalizations: [{ to: [{ email: recipientEmail }] }],
      from: { email: 'noreply@floot.app', name: 'Player Development App' },
      subject: `Player History Export - ${currentDate}`,
      content: [{
        type: 'text/plain',
        value: 'Please find attached the export of all player history and assessments.'
      }],
      attachments: [{
        content: excelBase64,
        filename: filename,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        disposition: 'attachment'
      }]
    };

    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendGridPayload)
    });

    if (!sendGridResponse.ok) {
      const errorBody = await sendGridResponse.text();
      console.error('Failed to send email via SendGrid:', errorBody);
      throw new Error('Failed to send the export email.');
    }

    return new Response(superjson.stringify({ message: 'Export successful. An email with the player history data has been sent.' } satisfies OutputType));
  } catch (error) {
    console.error("Error exporting player history:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 500 });
  }
}