import { User, PrismaClient } from '@prisma/client';
import { JwtService } from './jwt.service';
import { RefreshTokenService } from './refreshToken.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  async findOrCreateUser(email: string, name: string, pictureUrl?: string): Promise<User> {
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { email, name, pictureUrl },
      });
    }
    return user;
  }

  async login(user: User): Promise<AuthTokens> {
    const accessToken = this.jwtService.sign({ userId: user.id, email: user.email });
    const refreshToken = await this.refreshTokenService.createToken(user.id);
    return { accessToken, refreshToken };
  }
  
  async refreshSession(oldRefreshToken: string): Promise<AuthTokens | null> {
    const userId = await this.refreshTokenService.verifyToken(oldRefreshToken);
    if (!userId) {
      return null;
    }
    
    await this.refreshTokenService.revokeToken(oldRefreshToken);
    
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    
    return this.login(user);
  }
  
  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeToken(refreshToken);
  }
}
