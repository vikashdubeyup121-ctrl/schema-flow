export type EventPayload<T = void> = T extends void ? undefined : T;
