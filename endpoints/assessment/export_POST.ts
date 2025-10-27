import { db } from '../../helpers/db';
import { schema, OutputType } from "./export_POST.schema";
import superjson from 'superjson';
import * as xlsx from 'xlsx';
import { getScoreLabel } from '../../helpers/assessmentUtils';
import { getServerUserSession } from '../../helpers/getServerUserSession';

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

    // 1. Fetch all assessments with player data
    const assessments = await db.
    selectFrom('assessments').
    innerJoin('players', 'players.id', 'assessments.playerId').
    selectAll('assessments').
    select([
    'players.name as playerName',
    'players.team',
    'players.position',
    'players.foot']
    ).
    orderBy('assessments.assessmentDate', 'desc').
    execute();

    if (assessments.length === 0) {
      return new Response(superjson.stringify({ error: "No assessments found to export." }), { status: 404 });
    }

    // 2. Generate Excel file content
    const dataForSheet = assessments.map((assessment) => {
      const scores = [
      assessment.technicalScore,
      assessment.tacticalScore,
      assessment.physicalScore,
      assessment.psychologicalScore,
      assessment.socialScore];

      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      return {
        'Player Name': assessment.playerName,
        'Team': assessment.team,
        'Position': assessment.position,
        'Foot': assessment.foot,
        'Assessor': assessment.assessor,
        'Assessment Date': assessment.assessmentDate.toISOString().split('T')[0],
        'Technical Score': getScoreLabel(assessment.technicalScore),
        'Tactical Score': getScoreLabel(assessment.tacticalScore),
        'Physical Score': getScoreLabel(assessment.physicalScore),
        'Psychological Score': getScoreLabel(assessment.psychologicalScore),
        'Social Score': getScoreLabel(assessment.socialScore),
        'Average Score': averageScore.toFixed(2)
      };
    });

    const worksheet = xlsx.utils.json_to_sheet(dataForSheet);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Assessments');
    const excelBase64 = xlsx.write(workbook, { type: 'base64', bookType: 'xlsx' });

    // 3. Send email using SendGrid
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `player-assessments-${currentDate}.xlsx`;

    const sendGridPayload = {
      personalizations: [{ to: [{ email: recipientEmail }] }],
      from: { email: 'noreply@floot.app', name: 'Player Development App' },
      subject: `Player Development Assessments Export - ${currentDate}`,
      content: [{
        type: 'text/plain',
        value: 'Please find attached the export of all player development assessments.'
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

    return new Response(superjson.stringify({ message: 'Export successful. An email with the assessment data has been sent.' } satisfies OutputType));
  } catch (error) {
    console.error("Error exporting assessments:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 500 });
  }
}