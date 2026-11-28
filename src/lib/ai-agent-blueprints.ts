// Downloadable n8n Workflow JSON Blueprints & 3CX SIP-to-Gemini Live Bridge Starter Script

export function buildN8nLeadSyncBlueprint(baseUrl: string) {
  return {
    name: 'AV Live — AI Lead & Quote to Google Sheets + Escalation Alert',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'avlive-ai-lead-sync',
          responseMode: 'onReceived',
        },
        id: 'webhook_trigger',
        name: 'AV Live AI Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [240, 300],
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json.event}}',
                operation: 'equals',
                value2: 'ai_lead_captured',
              },
            ],
          },
        },
        id: 'route_event',
        name: 'Route Lead vs Escalation',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [480, 300],
      },
      {
        parameters: {
          operation: 'append',
          documentId: 'YOUR_GOOGLE_SHEET_ID',
          sheetName: 'Leads',
          columns: {
            mappingMode: 'defineBelow',
            value: {
              'Lead ID': '={{$json.payload.id}}',
              Date: '={{$json.timestamp}}',
              Name: '={{$json.payload.name}}',
              Phone: '={{$json.payload.phone}}',
              Email: '={{$json.payload.email}}',
              Channel: '={{$json.payload.channel}}',
              Language: '={{$json.payload.language}}',
              'Est. Value (PKR)': '={{$json.payload.estimatedValuePkr}}',
              'Intent Summary': '={{$json.payload.intentSummary}}',
            },
          },
        },
        id: 'append_sheet',
        name: 'Append to Leads Sheet',
        type: 'n8n-nodes-base.googleSheets',
        typeVersion: 4.5,
        position: [740, 220],
      },
      {
        parameters: {
          sendTo: 'infowarspakistan@gmail.com',
          subject: '=[AV Live AI Alert] {{$json.payload.name}} — {{$json.event}}',
          message:
            '=Channel: {{$json.payload.channel}}\nPhone: {{$json.payload.phone}}\nSummary: {{$json.payload.intentSummary}}\nOpen Console: ' +
            `${baseUrl}/admin/ai-agent`,
        },
        id: 'notify_admin',
        name: 'Notify Admin on Escalation',
        type: 'n8n-nodes-base.gmail',
        typeVersion: 2.1,
        position: [740, 400],
      },
    ],
    connections: {
      'AV Live AI Webhook': {
        main: [[{ node: 'Route Lead vs Escalation', type: 'main', index: 0 }]],
      },
      'Route Lead vs Escalation': {
        main: [
          [{ node: 'Append to Leads Sheet', type: 'main', index: 0 }],
          [{ node: 'Notify Admin on Escalation', type: 'main', index: 0 }],
        ],
      },
    },
    meta: {
      generatedBy: 'AV Live Communications Admin AI Console',
      appUrl: baseUrl,
    },
  };
}

export function buildN8nFollowUpCadenceBlueprint(baseUrl: string) {
  return {
    name: 'AV Live — Automated Day +1 / +3 / +7 Follow-Up Reminder Engine',
    nodes: [
      {
        parameters: {
          rule: {
            interval: [{ field: 'cronExpression', expression: '0 10 * * 1-6' }],
          },
        },
        id: 'morning_cron',
        name: '10:00 AM PKT Mon-Sat',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [240, 300],
      },
      {
        parameters: {
          operation: 'read',
          documentId: 'YOUR_GOOGLE_SHEET_ID',
          sheetName: 'Follow-Up Tasks',
        },
        id: 'read_tasks',
        name: 'Read Due Follow-Up Tasks',
        type: 'n8n-nodes-base.googleSheets',
        typeVersion: 4.5,
        position: [480, 300],
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json.Status}}',
                operation: 'equals',
                value2: 'pending',
              },
            ],
          },
        },
        id: 'filter_pending',
        name: 'Filter Pending Tasks',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [720, 300],
      },
      {
        parameters: {
          sendTo: 'infowarspakistan@gmail.com',
          subject: '=Follow-Up Reminder: {{$json["Lead Name"]}} ({{$json.Cadence}})',
          message:
            '=Task: {{$json.Title}}\nChannel: {{$json.Channel}}\nDue: {{$json["Due Date"]}}\nApprove & dispatch from: ' +
            `${baseUrl}/admin/ai-agent`,
        },
        id: 'send_reminder',
        name: 'Queue Approval Reminder',
        type: 'n8n-nodes-base.gmail',
        typeVersion: 2.1,
        position: [960, 260],
      },
    ],
    connections: {
      '10:00 AM PKT Mon-Sat': {
        main: [[{ node: 'Read Due Follow-Up Tasks', type: 'main', index: 0 }]],
      },
      'Read Due Follow-Up Tasks': {
        main: [[{ node: 'Filter Pending Tasks', type: 'main', index: 0 }]],
      },
      'Filter Pending Tasks': {
        main: [[{ node: 'Queue Approval Reminder', type: 'main', index: 0 }]],
      },
    },
    meta: {
      generatedBy: 'AV Live Communications Admin AI Console',
      appUrl: baseUrl,
    },
  };
}

export function buildN8nDailyReportBlueprint(baseUrl: string) {
  return {
    name: 'AV Live — 8:00 PM PKT Daily Executive Report Compiler',
    nodes: [
      {
        parameters: {
          rule: {
            interval: [{ field: 'cronExpression', expression: '0 20 * * *' }],
          },
        },
        id: 'evening_cron',
        name: '8:00 PM PKT Daily Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [240, 300],
      },
      {
        parameters: {
          url: `${baseUrl}/api/health`,
          method: 'GET',
        },
        id: 'ping_app',
        name: 'Verify AV Live API Online',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [480, 300],
      },
      {
        parameters: {
          sendTo: 'infowarspakistan@gmail.com',
          subject: '=AV Live Daily AI Operations Briefing Ready ({{$now.format("yyyy-MM-dd")}})',
          message: `Your daily AI Sales & Voice briefing is ready to review, append to Google Sheets, and dispatch from:\n${baseUrl}/admin/ai-agent`,
        },
        id: 'notify_briefing',
        name: 'Email Daily Review Link',
        type: 'n8n-nodes-base.gmail',
        typeVersion: 2.1,
        position: [740, 300],
      },
    ],
    connections: {
      '8:00 PM PKT Daily Trigger': {
        main: [[{ node: 'Verify AV Live API Online', type: 'main', index: 0 }]],
      },
      'Verify AV Live API Online': {
        main: [[{ node: 'Email Daily Review Link', type: 'main', index: 0 }]],
      },
    },
  };
}

export function build3cxGeminiLiveBridgeScript(webhookUrl: string): string {
  return `/**
 * AV Live Communications — 3CX SIP PBX to Gemini Live Voice Bridge (Node.js Starter)
 * Connects a dedicated 3CX SIP Extension (e.g., Ext 800) to Gemini 3.8 Live (real-time audio)
 * and posts completed call summaries + post-call WhatsApp CTA handoffs to your AV Live server.
 *
 * Prerequisites:
 *   npm install @google/genai ws dotenv
 * Env vars (.env):
 *   GEMINI_API_KEY=...
 *   THREECX_BRIDGE_SECRET=...        (must match secret in AV Live AI Studio Secrets)
 *   AVLIVE_CALL_WEBHOOK_URL=${webhookUrl}
 */

import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BRIDGE_SECRET = process.env.THREECX_BRIDGE_SECRET;
const WEBHOOK_URL = process.env.AVLIVE_CALL_WEBHOOK_URL || '${webhookUrl}';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function createGeminiLiveVoiceSession(callerNumber, onPcmAudioOut) {
  const session = await ai.live.connect({
    model: 'gemini-3.8-live',
    config: {
      responseModalities: ['AUDIO'],
      systemInstruction:
        'You are Hamza from AV Live Communications in Lahore, Pakistan. ' +
        'Auto-detect English, Urdu, or Roman Urdu and reply warmly in 1-2 short spoken sentences. ' +
        'Help with Poly, Cisco, Logitech video conferencing, 3CX VoIP, SMD LED rentals, and corporate events. ' +
        'Offer to send product links as WhatsApp buttons right after the call.',
    },
    callbacks: {
      onmessage: (msg) => {
        const audioPart = msg?.serverContent?.modelTurn?.parts?.find((p) => p.inlineData?.data);
        if (audioPart?.inlineData?.data) {
          onPcmAudioOut(Buffer.from(audioPart.inlineData.data, 'base64'));
        }
      },
    },
  });
  return session;
}

export async function reportCompleted3cxCall({
  callerPhone,
  callerName,
  durationSeconds,
  transcript,
  sendWhatsappFollowup = true,
}) {
  const payload = JSON.stringify({
    callerPhone,
    callerName,
    durationSeconds,
    transcript,
    sendWhatsappFollowup,
    endedAt: new Date().toISOString(),
  });

  const signature = crypto
    .createHmac('sha256', BRIDGE_SECRET || '')
    .update(payload)
    .digest('hex');

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-3CX-Bridge-Signature': \`sha256=\${signature}\`,
    },
    body: payload,
  });

  if (!res.ok) {
    throw new Error(\`Webhook failed with HTTP \${res.status}: \${await res.text()}\`);
  }
  return res.json();
}
`;
}
