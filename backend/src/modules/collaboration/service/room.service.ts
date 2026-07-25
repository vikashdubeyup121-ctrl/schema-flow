import { DiagramRoom } from '../types';

export class RoomService {
  private rooms: Map<string, DiagramRoom> = new Map();

  async joinRoom(diagramId: string, socketId: string, userId: string): Promise<void> {
    if (!this.rooms.has(diagramId)) {
      this.rooms.set(diagramId, { diagramId, users: new Set(), sockets: new Set() });
    }
    const room = this.rooms.get(diagramId)!;
    room.users.add(userId);
    room.sockets.add(socketId);
  }

  async leaveRoom(diagramId: string, socketId: string, userId: string): Promise<void> {
    const room = this.rooms.get(diagramId);
    if (!room) return;
    
    room.sockets.delete(socketId);
    
    // In a real app we'd check if this user has other sockets in the same room before removing them entirely
    room.users.delete(userId); 
    
    if (room.sockets.size === 0) {
      this.rooms.delete(diagramId);
    }
  }

  getRoom(diagramId: string): DiagramRoom | undefined {
    return this.rooms.get(diagramId);
  }
}
