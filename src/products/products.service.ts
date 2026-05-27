import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(query: QueryProductDto) {
    const { search, category, brand, minPrice, maxPrice, featured, page = 1, limit = 12 } = query;

    const qb = this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :active', { active: true });

    if (search) {
      qb.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(product.brand) LIKE :search OR LOWER(product.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (category) {
      qb.andWhere('LOWER(category.slug) = :category', { category: category.toLowerCase() });
    }

    if (brand) {
      qb.andWhere('LOWER(product.brand) = :brand', { brand: brand.toLowerCase() });
    }

    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (featured !== undefined) {
      qb.andWhere('product.featured = :featured', { featured });
    }

    const total = await qb.getCount();
    const products = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('product.createdAt', 'DESC')
      .getMany();

    return {
      data: products,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(dto: CreateProductDto) {
    const category = await this.categoriesService.findById(dto.categoryId);
    const { categoryId, ...rest } = dto;
    const product = this.repo.create({ ...rest, category });
    return this.repo.save(product);
  }

  async update(id: number, dto: Partial<CreateProductDto>) {
    const product = await this.findOne(id);
    if (dto.categoryId) {
      product.category = await this.categoriesService.findById(dto.categoryId);
    }
    const { categoryId, ...rest } = dto;
    Object.assign(product, rest);
    return this.repo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.repo.remove(product);
    return { message: 'Producto eliminado' };
  }

  async getFeatured() {
    return this.repo.find({ where: { featured: true, isActive: true } });
  }

  async getBrands() {
    const result = await this.repo
      .createQueryBuilder('product')
      .select('DISTINCT product.brand', 'brand')
      .where('product.isActive = true')
      .getRawMany();
    return result.map((r) => r.brand);
  }
}
