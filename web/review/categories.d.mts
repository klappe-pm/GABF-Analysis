export const CATEGORY_GROUPS: Record<string, string[]>;
export function categoryGroups(categories: string[]): { key: string; categories: string[] }[];
export function feedbackDetails(note: string, other: string, categories: string[]): { text: string; categories: string[] };
