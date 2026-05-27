import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAll() {
    return this.repo.find({ relations: { products: true } });
  }

  async findBySlug(slug: string) {
    const cat = await this.repo.findOne({ where: { slug }, relations: { products: true } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async findById(id: number) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async create(name: string, slug: string, description?: string) {
    const exists = await this.repo.findOne({ where: { slug } });
    if (exists) throw new ConflictException('La categoría ya existe');
    return this.repo.save(this.repo.create({ name, slug, description }));
  }

  async update(id: number, data: Partial<Category>) {
    await this.findById(id);
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.repo.delete(id);
    return { message: 'Categoría eliminada' };
  }
}
