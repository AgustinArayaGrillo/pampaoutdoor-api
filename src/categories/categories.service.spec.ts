import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';

const mockCategory = {
  id: 1,
  name: 'Camperas',
  slug: 'camperas',
  description: 'Camperas técnicas',
  products: [],
};

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  // ── findAll ───────────────────────────────────────────────
  describe('findAll', () => {
    it('debe retornar todas las categorías', async () => {
      mockRepo.find.mockResolvedValue([mockCategory]);
      const result = await service.findAll();
      expect(result).toEqual([mockCategory]);
      expect(mockRepo.find).toHaveBeenCalledWith({ relations: { products: true } });
    });
  });

  // ── findBySlug ────────────────────────────────────────────
  describe('findBySlug', () => {
    it('debe retornar categoría por slug', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);
      const result = await service.findBySlug('camperas');
      expect(result).toEqual(mockCategory);
    });

    it('debe lanzar NotFoundException si el slug no existe', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findBySlug('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  // ── findById ──────────────────────────────────────────────
  describe('findById', () => {
    it('debe retornar categoría por id', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);
      const result = await service.findById(1);
      expect(result).toEqual(mockCategory);
    });

    it('debe lanzar NotFoundException si el id no existe', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ────────────────────────────────────────────────
  describe('create', () => {
    it('debe crear una nueva categoría', async () => {
      mockRepo.findOne.mockResolvedValue(null); // no existe
      mockRepo.create.mockReturnValue(mockCategory);
      mockRepo.save.mockResolvedValue(mockCategory);

      const result = await service.create('Camperas', 'camperas', 'Camperas técnicas');
      expect(result).toEqual(mockCategory);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si el slug ya existe', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory); // ya existe
      await expect(service.create('Camperas', 'camperas')).rejects.toThrow(ConflictException);
    });
  });

  // ── update ────────────────────────────────────────────────
  describe('update', () => {
    it('debe actualizar una categoría existente', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);
      mockRepo.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { name: 'Camperas Nuevo' });
      expect(mockRepo.update).toHaveBeenCalledWith(1, { name: 'Camperas Nuevo' });
    });

    it('debe lanzar NotFoundException si la categoría no existe', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.update(999, { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove', () => {
    it('debe eliminar una categoría existente', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toEqual({ message: 'Categoría eliminada' });
    });

    it('debe lanzar NotFoundException si la categoría no existe', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
