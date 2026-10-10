// ============================================================================
// HARVEST BRIDGE — Grounded Agricultural AI Assistant Service
// Bilingual (English & Telugu), factual agricultural guidelines, 
// government schemes (e-NAM, PM-AASHA, Operation Greens), and contextual guidance.
// ============================================================================

import { db } from '../database/store.js';

export const AGRICULTURAL_KNOWLEDGE_BASE = {
  en: [
    {
      keywords: ['surplus risk', 'risk score', 'high risk', 'what is surplus'],
      topic: 'Surplus Risk Meaning',
      content:
        'A high surplus risk (above 70%) indicates that local mandi arrival volumes are projected to exceed regional retail demand during your harvest window. For perishable crops like tomatoes, this frequently leads to price crashes. Acting within the 3–5 day Rescue Window allows you to secure bulk institutional and processing buyers before prices drop.',
      sources: ['AP State Agricultural Marketing Board Advisory', 'Harvest Bridge Risk Engine v2.4'],
    },
    {
      keywords: ['rescue window', 'rescue', 'window', 'days left'],
      topic: 'Rescue Window Definition',
      content:
        'The Rescue Window represents the optimal pre-harvest time horizon (typically 3 to 5 days before harvest) when produce can be pre-contracted to food processors, retail chains, or institutional kitchens. Once harvest passes, ambient shelf-life rapidly deteriorates.',
      sources: ['National Institute of Post Harvest Technology & Management'],
    },
    {
      keywords: ['net earnings', 'calculate', 'formula', 'earnings', 'profit', 'transport'],
      topic: 'Net Earnings Calculation',
      content:
        'Estimated Net Earnings = (Quantity × Agreed Price) − Transport Costs − Handling Costs − Platform Fees.\n\nHarvest Bridge charges 0% platform commission to farmers. Comparing offers based on Net Earnings prevents losses from hidden transportation expenses (e.g. buyer pickup at ₹20/kg often nets higher than distant buyer offering ₹23/kg where farmer pays ₹4/kg freight).',
      sources: ['Harvest Bridge Transparent Economics Guidelines'],
    },
    {
      keywords: ['government scheme', 'msp', 'e-nam', 'operation greens', 'subsidies', 'pm aasha'],
      topic: 'Government Schemes & Support',
      content:
        'Key government surplus support mechanisms:\n1. **Operation Greens (TOP to TOTAL)**: 50% freight subsidy for evacuating surplus tomato, onion, and potato crops to deficit markets.\n2. **e-NAM (National Agriculture Market)**: Online trading across 1,000+ APMC mandis.\n3. **PM-AASHA (Market Assurance Scheme)**: Price support when mandi prices fall below MSP.\n4. **Rythu Bharosa Kendras (RBKs)**: Village-level procurement support centers across Andhra Pradesh.',
      sources: ['Ministry of Agriculture & Farmers Welfare, Govt of India', 'AP State Dept of Agriculture'],
    },
    {
      keywords: ['storage', 'shelf life', 'tomato storage', 'preservation', 'cold storage'],
      topic: 'Post-Harvest Shelf-Life Management',
      content:
        'For tomatoes:\n- Ambient storage (25–30°C): 4 to 6 days.\n- Evaporative Zero-Energy Cool Chamber (ZECC): 9 to 12 days.\n- Commercial Cold Storage (10–12°C, 85–90% RH): 18 to 25 days (Avoid storing below 10°C to prevent chilling injury).\n- Harvest at "Breaker/Turner" stage (pink blossom end) if transporting over 50 km.',
      sources: ['ICAR - Indian Institute of Horticultural Research (IIHR)'],
    },
  ],
  te: [
    {
      keywords: ['మిగులు', 'రిస్క్', 'surplus', 'ప్రమాదం'],
      topic: 'మిగులు ప్రమాదం అంటే ఏమిటి?',
      content:
        'అధిక మిగులు ప్రమాదం (70% కంటే ఎక్కువ) అంటే మీ పంట కోతకు వచ్చే సమయంలో మార్కెట్లో సరఫరా అంచనా కంటే ఎక్కువగా ఉండవచ్చని AI అంచనా వేస్తుంది. దీనివల్ల ధర తగ్గే అవకాశం ఉంది. రెస్క్యూ విండో సమయంలోనే ప్రత్యామ్నాయ కొనుగోలుదారులను సంప్రదించడం మంచిది.',
      sources: ['ఆంధ్రప్రదేశ్ వ్యవసాయ మార్కెటింగ్ శాఖ సలహా'],
    },
    {
      keywords: ['రెస్క్యూ విండో', 'rescue window', 'సమయం'],
      topic: 'రెస్క్యూ విండో',
      content:
        'రెస్క్యూ విండో అనేది పంట నష్టాన్ని నివారించడానికి మీరు ముందస్తుగా ఒప్పందం చేసుకోగలిగే సమయం. కోతకు 3–5 రోజుల ముందే చర్యలు తీసుకోవడం ద్వారా పంట వ్యర్థం కాకుండా మంచి ధర పొందవచ్చు.',
      sources: ['హార్వెస్ట్ బ్రిడ్జ్ మార్గదర్శకాలు'],
    },
    {
      keywords: ['నికర ఆదాయం', 'ధర', 'లాభం', 'రవాణా'],
      topic: 'నికర ఆదాయం లెక్కింపు',
      content:
        'నికర ఆదాయం = (మొత్తం పరిమాణం × నిర్ణయించిన ధర) − రవాణా ఖర్చులు − హ్యాండ్లింగ్ ఖర్చులు.\n\nహార్వెస్ట్ బ్రిడ్జ్ రైతులకు 0% కమీషన్‌తో సేవలు అందిస్తుంది. రవాణా ఖర్చులను పరిగణనలోకి తీసుకుని అత్యధిక నికర లాభం ఇచ్చే ఆఫర్‌ను ఎంచుకోండి.',
      sources: ['హార్వెస్ట్ బ్రిడ్జ్ పారదర్శక విధానం'],
    },
    {
      keywords: ['పథకాలు', 'ప్రభుత్వ', 'సహాయం', 'రైతు భరోసా'],
      topic: 'ప్రభుత్వ సహాయ పథకాలు',
      content:
        'రైతులకు ఉపయోగపడే ముఖ్య పథకాలు:\n1. **రైతు భరోసా కేంద్రాలు (RBK)**: గ్రామ స్థాయిలోనే విక్రయ మద్దతు.\n2. **ఆపరేషన్ గ్రీన్స్**: టమాటా, ఉల్లి తరలింపునకు 50% రవాణా సబ్సిడీ.\n3. **e-NAM**: జాతీయ మార్కెట్ అనుసంధానం.',
      sources: ['ఆంధ్రప్రదేశ్ ప్రభుత్వ వ్యవసాయ సమాచారం'],
    },
  ],
};

export function processAgriculturalQuery({ query, language = 'en', context = {} }) {
  if (!query || typeof query !== 'string') {
    return {
      content:
        language === 'te'
          ? 'దయచేసి మీ ప్రశ్నను అడగండి.'
          : 'Please ask a question about surplus risk, buyer matching, or post-harvest protection.',
      sources: [],
    };
  }

  const cleanQuery = query.toLowerCase();
  const langKey = language === 'te' ? 'te' : 'en';
  const kb = AGRICULTURAL_KNOWLEDGE_BASE[langKey] || AGRICULTURAL_KNOWLEDGE_BASE.en;

  // Search Knowledge Base
  let bestMatch = null;
  let maxScore = 0;

  for (const item of kb) {
    let score = 0;
    for (const kw of item.keywords) {
      if (cleanQuery.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && maxScore > 0) {
    let contextualPrefix = '';
    if (context.cropName) {
      contextualPrefix =
        language === 'te'
          ? `[మీ ప్రస్తుత పంట: ${context.cropName}${context.surplusRisk ? ` (${context.surplusRisk}% రిస్క్)` : ''}]\n\n`
          : `[Context: ${context.cropName}${context.surplusRisk ? ` — ${context.surplusRisk}% surplus risk in ${context.location || 'Chittoor'}` : ''}]\n\n`;
    }

    return {
      content: `${contextualPrefix}${bestMatch.content}`,
      topic: bestMatch.topic,
      sources: bestMatch.sources,
      timestamp: new Date().toISOString(),
    };
  }

  // Grounded Fallback Response with contextual intelligence
  if (context.cropName) {
    if (language === 'te') {
      return {
        content: `మీ ${context.cropName} పంట సంబంధిత వివరాలు: మార్కెట్ డిమాండ్ ప్రకారం స్థానిక ప్రాసెసర్లు మరియు పాఠశాల పోషకాహార కార్యక్రమాలకు విక్రయించడానికి 'Buyer Matches' పేజీని సందర్శించండి.`,
        sources: ['Harvest Bridge Advisory'],
        timestamp: new Date().toISOString(),
      };
    }
    return {
      content: `Regarding your ${context.cropName} listing in ${context.location || 'Chittoor'}: We recommend checking the active buyer matches on your dashboard. Locking in purchase terms 3–5 days prior to harvest will protect against sudden local market gluts.`,
      sources: ['Harvest Bridge Real-Time Advisory'],
      timestamp: new Date().toISOString(),
    };
  }

  if (language === 'te') {
    return {
      content:
        'నమస్కారం! నేను Harvest Bridge AI అసిస్టెంట్‌ని. పంట మిగులు అంచనా, కొనుగోలుదారుల సరిపోలిక, మరియు రెస్క్యూ విండో విధానాల గురించి నన్ను ఏమైనా అడగండి.',
      sources: ['Harvest Bridge Knowledge Base'],
      timestamp: new Date().toISOString(),
    };
  }

  return {
    content:
      "Hello! I am Harvest Bridge AI. I can help explain surplus risk calculations, buyer matching criteria, net earnings breakdowns, and government surplus mitigation schemes (e-NAM, Operation Greens, RBK). Feel free to ask any agricultural marketing question.",
    sources: ['Harvest Bridge Knowledge Base'],
    timestamp: new Date().toISOString(),
  };
}
