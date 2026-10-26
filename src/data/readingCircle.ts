// Reading assignments and page references supplied by the organizer.
export interface Reading {
  source: string
  passages: string[]
}

export interface ReadingSession {
  number: string
  date: string
  title: string
  subtitle: string
  required: Reading[]
  optional: Reading[]
}

export const sessions: ReadingSession[] = [
  {
    "number": "01",
    "date": "16 November 2026",
    "title": "Capital and Inequality",
    "subtitle": "Distribution and social relations",
    "required": [
      {
        "source": "Thomas Piketty, Capital in the Twenty-First Century (2014)",
        "passages": [
          "Introduction: pp. 1–2 and 20–27.",
          "Chapter 1: pp. 46–50 (“What Is Capital?” / “Capital and Wealth”).",
          "Chapter 10: pp. 336–352 (“Inequality of Capital Ownership”)."
        ]
      }
    ],
    "optional": [
      {
        "source": "Karl Marx, Wage Labour and Capital",
        "passages": [
          "“The Nature and Growth of Capital” and “Relation of Wage-Labour to Capital”."
        ]
      }
    ]
  },
  {
    "number": "02",
    "date": "14 December 2026",
    "title": "Money and the State",
    "subtitle": "Public finance and monetary institutions",
    "required": [
      {
        "source": "Stephanie Kelton, The Deficit Myth (2020)",
        "passages": [
          "Chapters 1 and 2 in full."
        ]
      }
    ],
    "optional": [
      {
        "source": "Stephanie Kelton, The Deficit Myth (2020)",
        "passages": [
          "Chapter 3."
        ]
      },
      {
        "source": "Bank of England, “Money in the Modern Economy: An Introduction” (2014)",
        "passages": [
          "Complete article."
        ]
      }
    ]
  },
  {
    "number": "03",
    "date": "18 January 2027",
    "title": "Hegemony and the State",
    "subtitle": "Political power and institutions",
    "required": [
      {
        "source": "Antonio Gramsci, Selections from the Prison Notebooks",
        "passages": [
          "“Political Struggle and Military War”.",
          "“The Transition from the War of Manoeuvre…”",
          "“Hegemony (Civil Society) and Separation of Powers”.",
          "“The State”."
        ]
      }
    ],
    "optional": [
      {
        "source": "Antonio Gramsci, Selections from the Prison Notebooks",
        "passages": [
          "“Analysis of Situations: Relations of Force”.",
          "“Rationalisation of Production and Work”."
        ]
      }
    ]
  },
  {
    "number": "04",
    "date": "15 February 2027",
    "title": "Full Employment and Capitalism",
    "subtitle": "Economic possibilities and political resistance",
    "required": [
      {
        "source": "Michał Kalecki, “Political Aspects of Full Employment” (1943)",
        "passages": [
          "Complete essay."
        ]
      },
      {
        "source": "Anatole Kaletsky, Capitalism 4.0",
        "passages": [
          "Chapters 12–13."
        ]
      }
    ],
    "optional": [
      {
        "source": "Anatole Kaletsky, Capitalism 4.0",
        "passages": [
          "Chapters 16–17."
        ]
      }
    ]
  },
  {
    "number": "05",
    "date": "15 March 2027",
    "title": "Democracy, Debt and Capitalism",
    "subtitle": "Democratic choices and economic constraints",
    "required": [
      {
        "source": "Wolfgang Streeck, Buying Time (second edition, 2017)",
        "passages": [
          "Introduction.",
          "Chapter 2 — selected sections: “Capitalism and Democracy in the Neoliberal Revolution”, “The Crisis of the Tax State”, “From Tax State to Debt State”, “Debt State and Distribution”, and “The Politics of the Debt State”."
        ]
      }
    ],
    "optional": [
      {
        "source": "Wolfgang Streeck, Buying Time (second edition, 2017)",
        "passages": [
          "“The European Union as a Liberalization Machine” and “Democracy in Euroland?”"
        ]
      },
      {
        "source": "Anatole Kaletsky, Capitalism 4.0",
        "passages": [
          "Chapter 17."
        ]
      }
    ]
  }
]
