export interface ImportButtonProps {
  isImporting: boolean;
  isComplete: boolean;
  hasValidationErrors: boolean;
  hasIndividualErrors: boolean;
  hasNumberErrors: boolean;
  expectedWordCount: number;
}
