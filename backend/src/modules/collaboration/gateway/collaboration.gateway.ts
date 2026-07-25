import { Server, Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { RoomService } from '../service/room.service';
import { PresenceService } from '../service/presence.service';
import { OperationService } from '../service/operation.service';
import { AuthenticatedSocket, CollaborationOperation } from '../types';

export let globalIO: Server | null = null;

export class CollaborationGateway {
  private io: Server;

  constructor(
    server: any,
    private readonly roomService: RoomService,
    private readonly presenceService: PresenceService,
    private readonly operationService: OperationService
  ) {
    this.io = new Server(server, {
      cors: { origin: '*' }
    });
    globalIO = this.io;

    // 1. Authentication Middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Unauthorized'));

      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret') as any;
        (socket as any).user = {
          socketId: socket.id,
          userId: decoded.userId,
          connectedAt: Date.now()
        } as AuthenticatedSocket;
        next();
      } catch (err) {
        next(new Error('Invalid JWT'));
      }
    });

    this.initHandlers();
  }

  private initHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as AuthenticatedSocket;
      
      socket.on('JOIN_DIAGRAM', async (payload: { diagramId: string }) => {
        const { diagramId } = payload;
        await this.roomService.joinRoom(diagramId, socket.id, user.userId);
        socket.join(diagramId);

        const presence = await this.presenceService.initializePresence(socket.id, user.userId, diagramId);
        
        // Notify others
        socket.to(diagramId).emit('USER_JOINED', presence);
        
        // Send initial state to user
        const presences = await this.presenceService.getRoomPresences(diagramId);
        socket.emit('ROOM_STATE', presences);
      });

      socket.on('CURSOR_MOVE', async (payload: { diagramId: string; x: number; y: number }) => {
        const { diagramId, x, y } = payload;
        await this.presenceService.updateCursor(socket.id, { x, y });
        socket.to(diagramId).emit('CURSOR_UPDATED', { socketId: socket.id, userId: user.userId, x, y });
      });

      socket.on('SELECTION_CHANGE', async (payload: { diagramId: string; selectedObjectIds: string[] }) => {
        const { diagramId, selectedObjectIds } = payload;
        await this.presenceService.updateSelection(socket.id, selectedObjectIds);
        socket.to(diagramId).emit('SELECTION_UPDATED', { socketId: socket.id, userId: user.userId, selectedObjectIds });
      });

      socket.on('COMMAND', async (payload: { diagramId: string; operation: CollaborationOperation }) => {
        const { diagramId, operation } = payload;
        operation.userId = user.userId;
        
        const result = await this.operationService.processOperation(diagramId, operation);
        
        // Send ACK back to originating socket
        socket.emit('ACK', result);

        if (result.status === 'SUCCESS') {
          // Broadcast to everyone else in the room
          socket.to(diagramId).emit('REMOTE_COMMAND', operation);
        }
      });

      socket.on('disconnect', async () => {
        const presence = await this.presenceService.removePresence(socket.id);
        if (presence) {
          await this.roomService.leaveRoom(presence.diagramId, socket.id, user.userId);
          this.io.to(presence.diagramId).emit('USER_LEFT', { socketId: socket.id, userId: user.userId });
        }
      });
    });
  }
}
