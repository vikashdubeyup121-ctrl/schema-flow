import { buildApp } from './app';
import { config } from './config/app';
import { prisma } from './infrastructure/db';

import { CollaborationGateway } from './modules/collaboration/gateway/collaboration.gateway';
import { RoomService } from './modules/collaboration/service/room.service';
import { PresenceService } from './modules/collaboration/service/presence.service';
import { PresenceRepository } from './modules/collaboration/repository/presence.repository';
import { OperationService } from './modules/collaboration/service/operation.service';
import { SchemaService } from './modules/schema/service/schema.service';
import { SchemaRepository } from './modules/schema/repository/schema.repository';

const start = async () => {
  const app = buildApp();

  // Setup WebSockets
  const roomService = new RoomService();
  const presenceRepo = new PresenceRepository();
  const presenceService = new PresenceService(presenceRepo);
  const schemaRepo = new SchemaRepository(prisma);
  const schemaService = new SchemaService(schemaRepo, prisma);
  const operationService = new OperationService(schemaService, prisma);

  new CollaborationGateway(app.server, roomService, presenceService, operationService);

  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`Server is listening on http://${config.host}:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down gracefully...`);
      await app.close();
      await prisma.$disconnect();
      process.exit(0);
    });
  }
};

start();
