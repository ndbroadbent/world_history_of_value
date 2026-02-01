export interface Entity {
  name: string;
  value: number;
  title?: string; // e.g., "Pharaoh", "Emperor", "CEO"
}

export interface TimePoint {
  year: number; // negative for BCE
  totalWorldValue: number; // in USD
  population: number; // world population
  averageNetWorth: number; // per capita
  medianNetWorth: number; // per adult
  wealthiestPerson: Entity | null;
  wealthiestEmpire: Entity | null;
  mostValuableCompany: Entity | null;
}

export interface CalculationLine {
  label: string;
  value?: string;
  formula?: string;
  indent?: number; // 0, 1, 2 for nesting
  isTotal?: boolean;
  isSectionHeader?: boolean;
}

export interface Calculation {
  summary: string; // e.g., "1M people × 41 labor-hours × $10/hr = ~$410M"
  lines: CalculationLine[];
}

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  image?: string;
  category:
    | "tool"
    | "empire"
    | "company"
    | "person"
    | "technology"
    | "event"
    | "resource";
  valueImpact?: string;
  calculation?: Calculation;
}

export interface TimelineData {
  timePoints: TimePoint[];
  events: TimelineEvent[];
}
