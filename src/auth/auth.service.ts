import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, name: string, password: string) {
    const user = await this.usersService.create(email, name, password);
    const token = this.signToken(user.id, user.email);
    return { user: this.sanitize(user), token };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.signToken(user.id, user.email);
    return { user: this.sanitize(user), token };
  }

  private signToken(userId: number, email: string) {
    return this.jwtService.sign({ sub: userId, email });
  }

  private sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
