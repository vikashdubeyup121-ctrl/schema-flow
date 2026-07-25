export interface AuthenticatedSocket {
  socketId: string;
  userId: string;
  connectedAt: number;
}

export interface Presence {
  userId: string;
  socketId: string;
  diagramId: string;
  cursor?: { x: number; y: number };
  selectedObjectIds?: string[];
  connectedAt: number;
}

export interface DiagramRoom {
  diagramId: string;
  users: Set<string>; // userIds
  sockets: Set<string>; // socketIds
}

export interface SocketEnvelope<T> {
  eventId: string;
  type: string;
  timestamp: number;
  payload: T;
}

export interface CollaborationOperation {
  operationId: string;
  revision: number;
  userId: string;
  type: string;
  payload: any;
  timestamp: number;
}
