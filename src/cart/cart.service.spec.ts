import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { ProductsService } from '../products/products.service';

const mockUser = { id: 1, name: 'Test', email: 'test@test.com' };

const mockProduct = {
  id: 1, name: 'Campera', brand: 'Ansilta',
  price: 89900, sizes: ['M', 'L'], colors: ['Negro'],
};

const mockCartItem = {
  id: 10, product: mockProduct, quantity: 2,
  selectedSize: 'M', selectedColor: 'Negro',
};

const mockCart = {
  id: 1, user: mockUser, items: [mockCartItem], updatedAt: new Date(),
};

const mockCartRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockItemRepo = {
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockProductsService = {
  findOne: jest.fn().mockResolvedValue(mockProduct),
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: mockCartRepo },
        { provide: getRepositoryToken(CartItem), useValue: mockItemRepo },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  // ── getOrCreateCart ───────────────────────────────────────
  describe('getOrCreateCart', () => {
    it('debe retornar el carrito existente con total calculado', async () => {
      mockCartRepo.findOne.mockResolvedValue(mockCart);

      const result = await service.getOrCreateCart(mockUser as any);

      expect(result).toHaveProperty('total');
      expect(result.total).toBe(89900 * 2); // price * quantity
    });

    it('debe crear un carrito nuevo si no existe', async () => {
      mockCartRepo.findOne.mockResolvedValue(null);
      mockCartRepo.create.mockReturnValue({ user: mockUser, items: [] });
      mockCartRepo.save.mockResolvedValue({ id: 2, user: mockUser, items: [] });

      const result = await service.getOrCreateCart(mockUser as any);

      expect(mockCartRepo.save).toHaveBeenCalled();
      expect(result.total).toBe(0);
    });
  });

  // ── addItem ───────────────────────────────────────────────
  describe('addItem', () => {
    it('debe incrementar cantidad si el item ya existe en el carrito', async () => {
      mockCartRepo.findOne.mockResolvedValue({ ...mockCart });
      mockItemRepo.save.mockResolvedValue({ ...mockCartItem, quantity: 3 });

      await service.addItem(mockUser as any, {
        productId: 1, quantity: 1, selectedSize: 'M', selectedColor: 'Negro',
      });

      expect(mockItemRepo.save).toHaveBeenCalled();
    });

    it('debe agregar un item nuevo si no existe en el carrito', async () => {
      const cartSinItem = { ...mockCart, items: [] };
      mockCartRepo.findOne.mockResolvedValue(cartSinItem);
      mockItemRepo.create.mockReturnValue(mockCartItem);
      mockItemRepo.save.mockResolvedValue(mockCartItem);

      await service.addItem(mockUser as any, {
        productId: 1, quantity: 1, selectedSize: 'L',
      });

      expect(mockItemRepo.save).toHaveBeenCalled();
    });
  });

  // ── removeItem ────────────────────────────────────────────
  describe('removeItem', () => {
    it('debe eliminar el item del carrito', async () => {
      mockCartRepo.findOne.mockResolvedValue({ ...mockCart });
      mockItemRepo.remove.mockResolvedValue(mockCartItem);

      await service.removeItem(mockUser as any, 10);
      expect(mockItemRepo.remove).toHaveBeenCalledWith(mockCartItem);
    });

    it('debe lanzar NotFoundException si el item no existe', async () => {
      mockCartRepo.findOne.mockResolvedValue({ ...mockCart, items: [] });

      await expect(service.removeItem(mockUser as any, 999))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── clearCart ─────────────────────────────────────────────
  describe('clearCart', () => {
    it('debe vaciar todos los items del carrito', async () => {
      mockCartRepo.findOne.mockResolvedValue({ ...mockCart });
      mockItemRepo.remove.mockResolvedValue([]);

      await service.clearCart(mockUser as any);
      expect(mockItemRepo.remove).toHaveBeenCalledWith(mockCart.items);
    });
  });
});
