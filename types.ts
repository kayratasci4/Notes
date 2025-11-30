export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export enum AIActionType {
  SUMMARIZE = 'SUMMARIZE',
  FIX_GRAMMAR = 'FIX_GRAMMAR',
  CONTINUE_WRITING = 'CONTINUE_WRITING',
  GENERATE_TITLE = 'GENERATE_TITLE',
  MAKE_LONGER = 'MAKE_LONGER'
}

export interface AIResponseState {
  isLoading: boolean;
  error: string | null;
  successMessage?: string;
}