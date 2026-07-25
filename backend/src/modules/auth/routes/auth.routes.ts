import { FastifyPluginAsync } from 'fastify';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';
import { GoogleService } from '../service/google.service';
import { JwtService } from '../service/jwt.service';
import { RefreshTokenService } from '../service/refreshToken.service';
import { prisma } from '../../../infrastructure/db';
import { authMiddleware } from '../middleware/auth.middleware';

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Dependency Injection
  const jwtService = new JwtService();
  const refreshTokenService = new RefreshTokenService(prisma);
  const authService = new AuthService(prisma, jwtService, refreshTokenService);
  const googleService = new GoogleService();
  const authController = new AuthController(authService, googleService);

  // Routes
  app.get('/google', authController.googleLogin);
  app.get('/google/callback', authController.googleCallback);
  app.post('/refresh', authController.refresh);
  app.post('/logout', authController.logout);
  app.get('/me', { preHandler: [authMiddleware] }, authController.me);
};
