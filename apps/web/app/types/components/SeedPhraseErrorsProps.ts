export interface SeedPhraseErrorsProps {
  validationErrors?: any; // temporary
  individualErrors: any[]; // temporary
  numberErrors: { index: number; message: string }[];
  seedPhraseWords: string[];
}