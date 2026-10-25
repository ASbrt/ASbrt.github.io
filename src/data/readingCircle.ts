// Content lives separately from the page markup so each session can be edited
// without touching the visual layout. TypeScript checks that every session
// has the same basic structure.
export interface ReadingSession {
  number: string
  date: string
  title: string
  subtitle: string
  required: string[]
  optional: string[]
}

export const sessions: ReadingSession[] = [
  {
    number: '01',
    date: '16 November 2026',
    title: 'Capital, Inequality and Wealth',
    subtitle: 'Distribution and social relations',
    required: [
      'Thomas Piketty, Capital in the Twenty-First Century — Introduction; Chapter 1: “What Is Capital?” and “Capital and Wealth”.',
    ],
    optional: [
      'Karl Marx, Wage Labour and Capital — “The Nature and Growth of Capital” and “Relation of Wage-Labour to Capital”.',
    ],
  },
  {
    number: '02',
    date: '14 December 2026',
    title: 'Money, Deficits and the State',
    subtitle: 'Public finance and monetary institutions',
    required: [
      'Stephanie Kelton, The Deficit Myth — Chapter 1, “Don’t Think of a Household”, and selected passages from Chapter 2, “Think of Inflation”.',
      'European Commission — “What is the euro area?” (short institutional overview).',
    ],
    optional: [
      'Stephanie Kelton, The Deficit Myth — remainder of Chapter 2 and Chapter 3, “The National Debt (That Isn’t)”.',
      'Bank of England — “Money in the Modern Economy: An Introduction” (2014).',
    ],
  },
  {
    number: '03',
    date: '18 January 2027',
    title: 'Hegemony, Ideology and the State',
    subtitle: 'Political power and institutions',
    required: [
      'Antonio Gramsci, Selections from the Prison Notebooks — “Political Struggle and Military War” (pp. 229–238); “The Transition from the War of Manoeuvre…” (pp. 238–239); “Hegemony (Civil Society) and Separation of Powers” (pp. 245–246); “The State” (pp. 257–264).',
    ],
    optional: [
      'Antonio Gramsci, Selections from the Prison Notebooks — “Analysis of Situations: Relations of Force” (pp. 175–185) and “Rationalisation of Production and Work” (pp. 301–306).',
    ],
  },
  {
    number: '04',
    date: '15 February 2027',
    title: 'Full Employment and Capitalism',
    subtitle: 'Economic possibilities and political resistance',
    required: [
      'Michał Kalecki — “Political Aspects of Full Employment” (1943), complete essay.',
      'Anatole Kaletsky, Capitalism 4.0 — Chapter 12, “Toward a New Economics”, and Chapter 13, “The Adaptive Mixed Economy”.',
    ],
    optional: [
      'Anatole Kaletsky, Capitalism 4.0 — Chapter 16, “Economic Policy in Capitalism 4.0”, and Chapter 17, “Politics in Capitalism 4.0”.',
    ],
  },
  {
    number: '05',
    date: '15 March 2027',
    title: 'Democracy, Debt and Capitalism',
    subtitle: 'Democratic choices and economic constraints',
    required: [
      'Wolfgang Streeck, Buying Time — Introduction; Chapter 2 sections “Capitalism and Democracy in the Neoliberal Revolution”, “The Crisis of the Tax State”, “From Tax State to Debt State”, “Debt State and Distribution” and “The Politics of the Debt State”.',
    ],
    optional: [
      'Wolfgang Streeck, Buying Time — “The European Union as a Liberalization Machine” and “Democracy in Euroland?”.',
      'Revisit Anatole Kaletsky, Capitalism 4.0 — Chapter 17.',
    ],
  },
]
