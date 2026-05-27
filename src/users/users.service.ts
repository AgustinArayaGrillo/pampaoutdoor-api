import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(email: string, name: string, password: string): Promise<User> {
    const exists = await this.repo.findOne({ where: { email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    const hashed = await bcrypt.hash(password, 10);
    const user = this.repo.create({ email, name, password: hashed });
    return this.repo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }
}
