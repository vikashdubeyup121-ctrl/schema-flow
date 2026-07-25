import { PresenceRepository } from '../repository/presence.repository';
import { Presence } from '../types';

export class PresenceService {
  constructor(private readonly presenceRepository: PresenceRepository) {}

  async initializePresence(socketId: string, userId: string, diagramId: string): Promise<Presence> {
    const presence: Presence = {
      socketId,
      userId,
      diagramId,
      connectedAt: Date.now(),
    };
    await this.presenceRepository.savePresence(socketId, presence);
    return presence;
  }

  async updateCursor(socketId: string, cursor: { x: number; y: number }): Promise<Presence | undefined> {
    const presence = await this.presenceRepository.getPresence(socketId);
    if (presence) {
      presence.cursor = cursor;
      await this.presenceRepository.savePresence(socketId, presence);
    }
    return presence;
  }

  async updateSelection(socketId: string, selectedObjectIds: string[]): Promise<Presence | undefined> {
    const presence = await this.presenceRepository.getPresence(socketId);
    if (presence) {
      presence.selectedObjectIds = selectedObjectIds;
      await this.presenceRepository.savePresence(socketId, presence);
    }
    return presence;
  }

  async removePresence(socketId: string): Promise<Presence | undefined> {
    const presence = await this.presenceRepository.getPresence(socketId);
    if (presence) {
      await this.presenceRepository.removePresence(socketId);
    }
    return presence;
  }

  async getRoomPresences(diagramId: string): Promise<Presence[]> {
    return this.presenceRepository.getRoomPresences(diagramId);
  }
}
