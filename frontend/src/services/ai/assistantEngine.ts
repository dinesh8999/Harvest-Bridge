// =============================================
// HARVEST BRIDGE — AI Assistant Engine
// Knowledge-based Q&A with Telugu support
// =============================================

import type { Language } from '../../types';
import { ASSISTANT_KB } from '../../data/demoData';

interface AssistantResponse {
  content: string;
  language: Language;
  isDemo: true;
}

export function processAssistantQuery(
  query: string,
  language: Language = 'en',
  context?: { cropName?: string; surplusRisk?: number; location?: string }
): AssistantResponse {
  const lower = query.toLowerCase();

  // Telugu greeting
  if (language === 'te' || lower.includes('నమస్కారం') || lower.includes('నమస్కారం')) {
    return respondTelugu(query, context);
  }

  // English responses
  const kb = ASSISTANT_KB.en;

  if (lower.includes('surplus') || lower.includes('risk') || lower.includes('meaning')) {
    return { content: kb[0].a, language: 'en', isDemo: true };
  }
  if (lower.includes('rescue') || lower.includes('window')) {
    return { content: kb[1].a, language: 'en', isDemo: true };
  }
  if (lower.includes('match') || lower.includes('buyer') || lower.includes('how')) {
    return { content: kb[2].a, language: 'en', isDemo: true };
  }
  if (lower.includes('what to do') || lower.includes('action') || lower.includes('steps')) {
    return { content: kb[3].a, language: 'en', isDemo: true };
  }
  if (lower.includes('prepare') || lower.includes('sell')) {
    return { content: kb[4].a, language: 'en', isDemo: true };
  }
  if (lower.includes('value') || lower.includes('money') || lower.includes('loss')) {
    return { content: kb[5].a, language: 'en', isDemo: true };
  }

  // Contextual response
  if (context?.cropName && context?.surplusRisk) {
    return {
      content: `Your ${context.cropName} currently shows ${context.surplusRisk}% surplus risk. ${
        context.surplusRisk >= 70
          ? 'This is HIGH — I recommend contacting the matched buyers immediately.'
          : context.surplusRisk >= 50
          ? 'This is MEDIUM — monitor closely and prepare buyer outreach within 2 days.'
          : 'This is LOW — continue monitoring.'
      } Remember: predictions are estimates to support your decision-making.`,
      language: 'en',
      isDemo: true,
    };
  }

  // Generic fallback
  return {
    content: `I can help you understand surplus risk, buyer matching, the Rescue Window, and how to prepare for selling your crop. I don't have access to live market prices — please treat my responses as decision-support information only. What would you like to know?`,
    language: 'en',
    isDemo: true,
  };
}

function respondTelugu(
  query: string,
  context?: { cropName?: string; surplusRisk?: number }
): AssistantResponse {
  const kb = ASSISTANT_KB.te;
  const lower = query.toLowerCase();

  if (lower.includes('మిగులు') || lower.includes('ప్రమాద') || lower.includes('risk')) {
    return { content: kb[0].a, language: 'te', isDemo: true };
  }
  if (lower.includes('రెస్క్యూ') || lower.includes('window') || lower.includes('విండో')) {
    return { content: kb[1].a, language: 'te', isDemo: true };
  }
  if (lower.includes('మార్కెట్') || lower.includes('ధర') || lower.includes('market')) {
    const cropPart = context?.cropName ? `${context.cropName} కు` : 'మీ పంటకు';
    return {
      content: `${cropPart} మీ ప్రాంతంలో సరఫరా పెరిగే అవకాశం ఉంది. ${
        context?.surplusRisk && context.surplusRisk >= 70
          ? 'మిగులు ప్రమాదం అధికంగా ఉంది — ఇప్పుడే కొనుగోలుదారులను సంప్రదించండి.'
          : 'ధర తగ్గే ముందే ప్రత్యామ్నాయ కొనుగోలుదారులను సంప్రదించడం మంచిది.'
      }`,
      language: 'te',
      isDemo: true,
    };
  }

  // Default Telugu response
  return {
    content: `మీ పంట గురించి నేను సహాయపడగలను. మీకు మిగులు ప్రమాదం, కొనుగోలుదారుల సరిపోలిక, లేదా విక్రయ తయారీ గురించి ప్రశ్నలు ఉంటే అడగండి. గుర్తుంచుకోండి: ఇవి నిర్ణయ-మద్దతు అంచనాలు మాత్రమే.`,
    language: 'te',
    isDemo: true,
  };
}
