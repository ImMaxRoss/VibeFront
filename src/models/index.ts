// Central exports for the models layer

// View Models
export * from './viewModels';

// Adapters
export * from './adapters';

// Type guards and utilities
export const isValidId = (id: string): boolean => {
  return id !== null && id !== undefined && id !== '' && !isNaN(Number(id));
};

export const createEmptyFilter = <T extends Record<string, any>>(defaults: T): T => {
  return { ...defaults };
};

// Common display utilities
export const formatDisplayName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

export const formatParticipantList = (participants: Array<{ displayName: string }>): string => {
  if (participants.length === 0) return 'No participants';
  if (participants.length === 1) return participants[0].displayName;
  if (participants.length === 2) return `${participants[0].displayName} & ${participants[1].displayName}`;
  return `${participants[0].displayName} & ${participants.length - 1} others`;
};

export const createSearchableText = (...texts: (string | null | undefined)[]): string => {
  return texts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};