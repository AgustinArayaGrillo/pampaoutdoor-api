import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { CategoriesService } from '../categories/categories.service';

const mockCategory = { id: 1, name: 'Camperas', slug: 'camperas' };

const mockProduct = {
  id: 1,
  name: 'Campera Softshell',
  brand: 'Ansilta',
  price: 89900,
  oldPrice: null,
  sizes: ['S', 'M', 'L'],
  colors: ['Negro', 'Rojo'],
  featured: true,
  isActive: true,
  stock: 10,
  category: mockCategory,
};

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  getCount: jest.fn().mockResolvedValue(1),
  getMany: jest.fn().mockResolvedValue([mockProduct]),
  getRawMany: jest.fn().mockResolvedValue([{ brand: 'Ansilta' }]),
};

const mockRepo = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockCategoriesService = {
  findById: jest.fn().mockResolvedValue(mockCategory),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockRepo },
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
    mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  // ── findAll ───────────────────────────────────────────────
  describe('findAll', () => {
    it('debe retornar productos paginados', async () => {
      const result = await service.findAll({ page: 1, limit: 12 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('lastPage');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('debe aplicar filtro de búsqueda', async () => {
      await service.findAll({ search: 'campera', page: 1, limit: 12 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('debe aplicar filtro de categoría', async () => {
      await service.findAll({ category: 'camperas', page: 1, limit: 12 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('debe aplicar filtro de precio mínimo y máximo', async () => {
      await service.findAll({ minPrice: 50000, maxPrice: 150000, page: 1, limit: 12 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne', () => {
    it('debe retornar un producto por id', async () => {
      mockRepo.findOne.mockResolvedValue(mockProduct);
      const result = await service.findOne(1);
      expect(result).toEqual(mockProduct);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ────────────────────────────────────────────────
  describe('create', () => {
    it('debe crear un producto correctamente', async () => {
      mockRepo.create.mockReturnValue(mockProduct);
      mockRepo.save.mockResolvedValue(mockProduct);

      const dto = {
        name: 'Campera Softshell',
        brand: 'Ansilta',
        categoryId: 1,
        price: 89900,
        sizes: ['S', 'M', 'L'],
        colors: ['Negro'],
      };

      const result = await service.create(dto as any);

      expect(mockCategoriesService.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove', () => {
    it('debe eliminar un producto existente', async () => {
      mockRepo.findOne.mockResolvedValue(mockProduct);
      mockRepo.remove.mockResolvedValue(mockProduct);

      const result = await service.remove(1);
      expect(result).toEqual({ message: 'Producto eliminado' });
      expect(mockRepo.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('debe lanzar NotFoundException al eliminar producto inexistente', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── getFeatured ───────────────────────────────────────────
  describe('getFeatured', () => {
    it('debe retornar solo productos destacados', async () => {
      mockRepo.find.mockResolvedValue([mockProduct]);
      const result = await service.getFeatured();
      expect(mockRepo.find).toHaveBeenCalledWith({ where: { featured: true, isActive: true } });
      expect(result).toEqual([mockProduct]);
    });
  });

  // ── getBrands ─────────────────────────────────────────────
  describe('getBrands', () => {
    it('debe retornar lista de marcas únicas', async () => {
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      const result = await service.getBrands();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
