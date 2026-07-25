import { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/cookie';
import { AuthService } from '../service/auth.service';
import { GoogleService } from '../service/google.service';
import { prisma } from '../../../infrastructure/db';

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService
  ) {}

  googleLogin = async (req: FastifyRequest, reply: FastifyReply) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri || '')}&response_type=code&scope=${encodeURIComponent('email profile')}`;
    reply.redirect(authUrl);
  };

  googleCallback = async (req: FastifyRequest<{ Querystring: { code: string } }>, reply: FastifyReply) => {
    const code = req.query.code;
    if (!code) {
      return reply.status(400).send({ success: false, error: { code: 'INVALID_REQUEST', message: 'Missing code' } });
    }

    try {
      const accessToken = await this.googleService.getTokens(code);
      const profile = await this.googleService.getProfile(accessToken);

      const user = await this.authService.findOrCreateUser(profile.email, profile.name, profile.pictureUrl);
      const tokens = await this.authService.login(user);

      this.setRefreshCookie(reply, tokens.refreshToken);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      reply.redirect(`${frontendUrl}/?token=${tokens.accessToken}`);
    } catch (error: any) {
      req.log.error(error);
      reply.status(401).send({ success: false, error: { code: 'AUTH_FAILED', message: 'Authentication failed' } });
    }
  };

  refresh = async (req: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHENTICATED', message: 'No refresh token provided' } });
    }

    try {
      const tokens = await this.authService.refreshSession(refreshToken);
      if (!tokens) {
        reply.clearCookie('refresh_token', { path: '/' });
        return reply.status(401).send({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Invalid refresh token' } });
      }

      this.setRefreshCookie(reply, tokens.refreshToken);
      reply.send({ success: true, data: { accessToken: tokens.accessToken } });
    } catch (error: any) {
      reply.clearCookie('refresh_token', { path: '/' });
      reply.status(401).send({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Invalid refresh token' } });
    }
  };

  logout = async (req: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    reply.clearCookie('refresh_token', { path: '/' });
    reply.send({ success: true, data: {} });
  };

  me = async (req: FastifyRequest, reply: FastifyReply) => {
    // req.user is set by auth middleware
    const userReq = (req as any).user;
    if (!userReq) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Not authenticated' } });
    }
    const user = await prisma.user.findUnique({ where: { id: userReq.userId } });
    if (!user) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHENTICATED', message: 'User not found' } });
    }
    reply.send({ success: true, data: { user } });
  };

  private setRefreshCookie(reply: FastifyReply, token: string) {
    reply.setCookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }
}
