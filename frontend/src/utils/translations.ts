// =============================================
// HARVEST BRIDGE — Full Multilingual Translations
// Full coverage for English (en) and Telugu (te)
// =============================================

export type TranslationKey = keyof typeof TRANSLATIONS.en;

export const TRANSLATIONS = {
  en: {
    // Navigation
    navDashboard: 'Dashboard',
    navMyCrops: 'My Crops',
    navFindBuyers: 'Find Buyers',
    navBuyerMatches: 'Find Buyers',
    navOrders: 'Orders',
    navAiInsights: 'AI Insights',
    navCheckRisk: 'AI Insights',
    navMarketMandi: 'Mandi Intelligence',
    navRescueNetwork: 'Rescue Network',
    navSurplusRadar: 'Surplus Radar™',
    navMapView: 'Geological Map',
    navAiAssistant: 'AI Assistant',
    navAdminPortal: 'Admin Portal',
    navProfile: 'Profile & Settings',
    navSignOut: 'Sign Out',
    navLaunchDemo: 'Quick Persona Switcher',

    // Header & Greeting
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    tagline: 'Predict · Redirect · Protect',
    subtitleFarmMonitored: 'Your agricultural yield is actively monitored for surplus risk & income protection.',

    // KPI Badges & Metrics
    kpiActiveCrops: 'Active Crops',
    kpiHighRisk: 'High Surplus Risk',
    kpiValueAtRisk: 'Value at Risk',
    kpiProtectedYield: 'Protected Produce',
    kpiTotalRedirected: 'Produce Redirected',
    kpiTotalValueProtected: 'Value Protected',
    kpiActiveFarmers: 'Active Farmers',
    kpiBuyerNetwork: 'Buyer Network',
    kpiAvoidedWaste: 'Avoided Food Waste',
    kpiCo2Saved: 'CO₂e Emissions Prevented',
    kpiWaterSaved: 'Water Footprint Saved',

    // Crop Listing Form
    addNewCrop: 'Register New Crop',
    cropName: 'Crop Name',
    variety: 'Variety',
    quantity: 'Expected Quantity',
    unit: 'Unit',
    expectedHarvestDate: 'Expected Harvest Date',
    minAcceptablePrice: 'Min Acceptable Price (₹/kg)',
    estimatedPrice: 'Estimated Market Price (₹/kg)',
    qualityGrade: 'Quality Grade',
    storageType: 'Storage Type',
    farmLocation: 'Farm Location',
    notes: 'Special Notes / Irrigation Details',
    submitCrop: 'Register Crop & Run AI Risk Scan',

    // Risk Analysis & Surplus
    surplusRiskScore: 'Surplus Risk Score',
    priceDepressionRisk: 'Price Depression Risk',
    urgencyLevel: 'Urgency Level',
    rescueWindow: 'Rescue Window',
    daysUntilHarvest: 'days until harvest',
    actionRequired: 'Recommended Next Action',
    contributingFactors: 'Explainable AI Factors',
    whyThisRisk: 'Why is this risk elevated?',
    findBuyersNow: 'Find Matched Buyers',

    // Buyer Matching & Offers
    aiBuyerMatchmaking: 'AI Buyer Matchmaking',
    buyersRankedSubtitle: 'Registered buyers ranked by multi-factor compatibility',
    compatibility: 'compatibility',
    pickupAvailable: 'Pickup Available',
    farmerDelivery: 'Farmer Delivery',
    indicativePrice: 'Indicative Price',
    estimatedNetReturn: 'Est. Net Return',
    submitOffer: 'Submit Offer',
    sendInquiry: 'Send Interest',
    whyThisBuyer: 'Why this buyer?',
    compareOffers: 'Compare Multiple Offers',

    // Net Earnings Calculator
    netEarningsTitle: 'Transparent Net Earnings Calculation',
    grossRevenue: 'Gross Revenue',
    transportCost: 'Transport Logistics',
    handlingCost: 'On-Farm Handling & Bagging',
    platformFee: 'Platform Commission (0%)',
    netFarmerEarnings: 'Estimated Net Farmer Earnings',
    effectiveNetPrice: 'Effective Net Price per kg',

    // Order Lifecycle
    ordersTitle: 'Orders & Logistics Lifecycle',
    orderStatusScheduled: 'Scheduled Pickup',
    orderStatusInTransit: 'In Transit',
    orderStatusDelivered: 'Delivered',
    orderStatusCompleted: 'Completed',
    orderStatusCancelled: 'Cancelled',
    recordPickup: 'Record Farm Collection',
    confirmDelivery: 'Confirm Delivery & Record Impact',
    cancelOrder: 'Cancel Order',

    // Common UI
    loading: 'Loading...',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    viewAll: 'View all',
    demoBadge: 'DEMO MODE',
    verifiedBadge: 'VERIFIED',
    filterAll: 'All',
    filterActive: 'Active',
    filterCompleted: 'Completed',
    speakText: 'Listen (Voice Guidance)',
  },
  te: {
    // Navigation
    navDashboard: 'డ్యాష్‌బోర్డ్',
    navMyCrops: 'నా పంటలు',
    navFindBuyers: 'కొనుగోలుదారులు',
    navBuyerMatches: 'కొనుగోలుదారులు',
    navOrders: 'ఆర్డర్లు',
    navAiInsights: 'AI విశ్లేషణ',
    navCheckRisk: 'AI విశ్లేషణ',
    navMarketMandi: 'మార్కెట్ ధరల సమాచారం',
    navRescueNetwork: 'మిగులు రక్షణ నెట్‌వర్క్',
    navSurplusRadar: 'మిగులు రాడార్™',
    navMapView: 'భౌగోళిక పటం',
    navAiAssistant: 'AI సహాయకుడు',
    navAdminPortal: 'అడ్మిన్ పోర్టల్',
    navProfile: 'ప్రొఫైల్ & సెట్టింగ్‌లు',
    navSignOut: 'లాగ్ అవుట్',
    navLaunchDemo: 'డెమో ఖాతా ఎంపిక',

    // Header & Greeting
    goodMorning: 'శుభోదయం',
    goodAfternoon: 'శుభ మధ్యాహ్నం',
    goodEvening: 'శుభ సాయంత్రం',
    tagline: 'అంచనా · మళ్లింపు · రక్షణ',
    subtitleFarmMonitored: 'మీ పంట మిగులు నష్టాలు మరియు ధరల ఒడిదుడుకుల నుండి రక్షించబడుతోంది.',

    // KPI Badges & Metrics
    kpiActiveCrops: 'నమోదిత పంటలు',
    kpiHighRisk: 'అధిక మిగులు ప్రమాదం',
    kpiValueAtRisk: 'ప్రమాదంలో ఉన్న విలువ',
    kpiProtectedYield: 'రక్షించిన పంట',
    kpiTotalRedirected: 'మళ్లించిన మొత్తం దిగుబడి',
    kpiTotalValueProtected: 'రక్షించిన ఆదాయం',
    kpiActiveFarmers: 'క్రియాశీల రైతులు',
    kpiBuyerNetwork: 'కొనుగోలుదారుల నెట్‌వర్క్',
    kpiAvoidedWaste: 'నివారించిన ఆహార వృధా',
    kpiCo2Saved: 'నివారించిన కర్బన ఉద్గారాలు',
    kpiWaterSaved: 'ఆదా చేసిన నీరు',

    // Crop Listing Form
    addNewCrop: 'కొత్త పంటను నమోదు చేయండి',
    cropName: 'పంట పేరు',
    variety: 'రకం',
    quantity: 'అంచనా దిగుబడి',
    unit: 'పరిమాణం (కిలోలు)',
    expectedHarvestDate: 'కోత అంచనా తేదీ',
    minAcceptablePrice: 'కనీస ఆమోదయోగ్యమైన ధర (₹/కిలో)',
    estimatedPrice: 'అంచనా మార్కెట్ ధర (₹/కిలో)',
    qualityGrade: 'నాణ్యత గ్రేడ్',
    storageType: 'నిల్వ రకం',
    farmLocation: 'పొలం ఉన్న ప్రాంతం',
    notes: 'ప్రత్యేక వివరాలు / సాగు పద్ధతి',
    submitCrop: 'పంటను నమోదు చేసి AI స్కాన్ చేయండి',

    // Risk Analysis & Surplus
    surplusRiskScore: 'మిగులు ప్రమాద స్కోరు',
    priceDepressionRisk: 'ధర తగ్గే ప్రమాదం',
    urgencyLevel: 'అత్యవసర స్థాయి',
    rescueWindow: 'రెస్క్యూ విండో',
    daysUntilHarvest: 'కోతకు మిగిలిన రోజులు',
    actionRequired: 'సిఫార్సు చేసిన చర్య',
    contributingFactors: 'AI విశ్లేషణ కారణాలు',
    whyThisRisk: 'ఈ రిస్క్ ఎందుకు పెరిగింది?',
    findBuyersNow: 'కొనుగోలుదారులను చూడండి',

    // Buyer Matching & Offers
    aiBuyerMatchmaking: 'AI కొనుగోలుదారుల సరిపోలిక',
    buyersRankedSubtitle: 'వివిధ అంశాల ఆధారంగా సరిపోలిన కొనుగోలుదారులు',
    compatibility: 'సరిపోలిక శాతం',
    pickupAvailable: 'పికప్ సదుపాయం కలదు',
    farmerDelivery: 'రైతు రవాణా చేయాలి',
    indicativePrice: 'ప్రతిపాదిత ధర',
    estimatedNetReturn: 'అంచనా నికర లాభం',
    submitOffer: 'ఆఫర్ పంపండి',
    sendInquiry: 'ఆసక్తిని తెలియజేయండి',
    whyThisBuyer: 'ఈ కొనుగోలుదారు ఎందుకు సరైనవారు?',
    compareOffers: 'ఆఫర్లను పోల్చండి',

    // Net Earnings Calculator
    netEarningsTitle: 'పారదర్శక నికర ఆదాయ లెక్కింపు',
    grossRevenue: 'మొత్తం అమ్మకం విలువ',
    transportCost: 'రవాణా ఖర్చులు',
    handlingCost: 'హ్యాండ్లింగ్ & ప్యాకింగ్ ఖర్చులు',
    platformFee: 'ప్లాట్‌ఫామ్ కమీషన్ (0%)',
    netFarmerEarnings: 'రైతుకు అందే నికర ఆదాయం',
    effectiveNetPrice: 'కిలోకు నికర ధర',

    // Order Lifecycle
    ordersTitle: 'ఆర్డర్లు మరియు డెలివరీ స్థితి',
    orderStatusScheduled: 'పికప్ షెడ్యూల్ చేయబడింది',
    orderStatusInTransit: 'రవాణాలో ఉంది',
    orderStatusDelivered: 'చేరవేయబడింది',
    orderStatusCompleted: 'పూర్తయింది',
    orderStatusCancelled: 'రద్దు చేయబడింది',
    recordPickup: 'పికప్ నమోదు చేయండి',
    confirmDelivery: 'డెలివరీ నిర్ధారించి రికార్డ్ చేయండి',
    cancelOrder: 'ఆర్డర్ రద్దు చేయండి',

    // Common UI
    loading: 'వేచి ఉండండి...',
    saveChanges: 'మార్పులను సేవ్ చేయండి',
    cancel: 'రద్దు',
    viewAll: 'అన్నీ చూడండి',
    demoBadge: 'డెమో మోడ్',
    verifiedBadge: 'ధృవీకరించబడింది',
    filterAll: 'అన్నీ',
    filterActive: 'క్రియాశీలం',
    filterCompleted: 'పూర్తయినవి',
    speakText: 'వాయిస్ వినండి',
  },
};
