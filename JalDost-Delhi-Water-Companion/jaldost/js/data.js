export const ACTIONS = [
  {
    id: 'reuse-ro-water',
    title: 'Reuse RO reject water',
    description: 'Collect it for mopping, cleaning or flushing instead of sending it straight down the drain.',
    category: 'At home',
    estimatedLitres: 8,
    difficulty: 'Easy',
    xpReward: 20,
    active: true,
    icon: '↻',
    tone: 'blue',
    evidence: {
      source: null,
      assumption: 'One practical reuse of a small household collection.',
      confidence: 'illustrative',
      reviewedAt: '2026-09-01'
    }
  },
  {
    id: 'bucket-over-running-water',
    title: 'Choose a bucket where practical',
    description: 'Use a bucket for one routine instead of leaving a tap or shower running continuously.',
    category: 'Daily routine',
    estimatedLitres: 18,
    difficulty: 'Easy',
    xpReward: 30,
    active: true,
    icon: '▤',
    tone: 'navy',
    evidence: {
      source: null,
      assumption: 'A single shorter bucket-based routine compared with continuous flow.',
      confidence: 'illustrative',
      reviewedAt: '2026-09-01'
    }
  },
  {
    id: 'report-visible-leak',
    title: 'Report a visible leak',
    description: 'Note the location and report a leaking public tap or pipe through the appropriate civic channel.',
    category: 'Neighbourhood',
    estimatedLitres: 25,
    difficulty: 'Medium',
    xpReward: 40,
    active: true,
    icon: '!',
    tone: 'orange',
    evidence: {
      source: null,
      assumption: 'Prototype credit for early reporting; not the full volume of the leak.',
      confidence: 'low',
      reviewedAt: '2026-09-01'
    }
  },
  {
    id: 'tap-off-brushing',
    title: 'Turn the tap off while brushing',
    description: 'Use only the water you need instead of keeping the tap running throughout the routine.',
    category: 'Daily routine',
    estimatedLitres: 6,
    difficulty: 'Easy',
    xpReward: 15,
    active: true,
    icon: '◒',
    tone: 'teal',
    evidence: {
      source: null,
      assumption: 'One brushing routine with intermittent rather than continuous flow.',
      confidence: 'illustrative',
      reviewedAt: '2026-09-01'
    }
  }
];

export const MILESTONES = [
  { id: 'first-action', type: 'actions', threshold: 1, title: 'First drop' },
  { id: 'hundred-litres', type: 'savings', threshold: 100, title: '100 litre mark' },
  { id: 'seven-day-streak', type: 'streak', threshold: 7, title: 'Water-wise week' }
];
