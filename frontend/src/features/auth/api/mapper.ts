import type { User } from '../types/User';
import type { AuthResponse } from '../types/AuthDTO';

export function mapAuthResponseToUser(dto: AuthResponse): User {
  return {
    id: dto.user.id,
    email: dto.user.email,
    name: dto.user.name,
    avatarUrl: dto.user.avatar_url,
  };
}
