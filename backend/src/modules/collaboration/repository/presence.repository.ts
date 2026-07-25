import { Presence } from '../types';

// Mocking Redis with an in-memory Map for MVP Phase 1
export class PresenceRepository {
  private presences: Map<string, Presence> = new Map(); // socketId -> Presence
  
  async savePresence(socketId: string, presence: Presence): Promise<void> {
    this.presences.set(socketId, presence);
  }

  async getPresence(socketId: string): Promise<Presence | undefined> {
    return this.presences.get(socketId);
  }

  async removePresence(socketId: string): Promise<void> {
    this.presences.delete(socketId);
  }

  async getRoomPresences(diagramId: string): Promise<Presence[]> {
    return Array.from(this.presences.values()).filter(p => p.diagramId === diagramId);
  }
}
