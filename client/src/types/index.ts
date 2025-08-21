// Centralized type definitions for the application

// Core entity types
export interface Card {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
  groupId: string;
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  cards: Card[];
  groups?: Group[];
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
  question: string;
  answer: string;
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
