// Centralized type definitions for the application

// Content types for cards
export type ContentType = 'TEXT' | 'AUDIO' | 'VIDEO' | 'IMAGE';

// Review response types
export type ReviewResponse = 'AGAIN' | 'HARD' | 'EASY';

// Core entity types
export interface Card {
  id: number;
  createdAt: string;
  updatedAt: string;
  groupId: string;
  group?: {
    id: string;
    name: string;
  };
  // Question side
  questionText?: string;
  questionType: ContentType;
  questionMediaUrl?: string;
  // Answer side
  answerText?: string;
  answerType: ContentType;
  answerMediaUrl?: string;
  // Spaced repetition fields
  nextReviewAt: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  cards: Card[];
  parentId?: string | null;
  children?: Group[];
}

// Legacy aliases for backward compatibility
export type CardType = Card;
export type GroupType = Group;

// Message types
export interface Message {
  id: string;
  firstName: string;
  lastName: string;
  content: string;
  timestamp: string;
}

export type MessageType = Message;

// API types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

// Form-related types
export interface CardFormData {
  questionText?: string;
  questionType?: ContentType;
  questionMediaUrl?: string;
  answerText?: string;
  answerType?: ContentType;
  answerMediaUrl?: string;
}

// Card statistics
export interface CardStats {
  cardId: number;
  totalReviews: number;
  easyCount: number;
  hardCount: number;
  againCount: number;
  currentInterval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
}

// Group statistics
export interface GroupStats {
  groupId: string;
  totalCards: number;
  dueCards: number;
  newCards: number;
  learningCards: number;
  matureCards: number;
}

// Review request
export interface ReviewCardRequest {
  cardId: number;
  response: ReviewResponse;
}

export interface GroupFormData {
  name: string;
}

// Component prop types
export interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

// State management types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface GroupState extends LoadingState {
  groupsList: Group[];
}
// Error handling types
export interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
