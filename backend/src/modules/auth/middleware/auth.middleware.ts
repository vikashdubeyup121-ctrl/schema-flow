import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtService } from '../service/jwt.service';

export const authMiddleware = async (req: FastifyRequest, reply: FastifyReply) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Missing or invalid authorization header' } });
  }

  const token = authHeader.split(' ')[1];
  const jwtService = new JwtService();

  try {
    const payload = jwtService.verify(token);
    (req as any).user = payload;
  } catch (err) {
    return reply.status(401).send({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired token' } });
  }
};
