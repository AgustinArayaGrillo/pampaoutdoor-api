import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CartService } from '../cart/cart.service';
import { UserRole } from '../users/user.entity';

const mockUser = { id: 1, name: 'Test', email: 'test@test.com', role: UserRole.CUSTOMER };
const mockAdmin = { id: 2, name: 'Admin', email: 'admin@test.com', role: UserRole.ADMIN };

const mockProduct = { id: 1, name: 'Campera', price: 89900 };

const mockCart = {
  id: 1,
  user: mockUser,
  items: [
    { id: 10, product: mockProduct, quantity: 2, selectedSize: 'M', selectedColor: 'Negro', unitPrice: 89900 },
  ],
  total: 179800,
};

const mockOrder = {
  id: 1,
  user: mockUser,
  items: [{ product: mockProduct, quantity: 2, unitPrice: 89900 }],
  total: 179800,
  status: OrderStatus.PENDING,
  shippingAddress: 'Av. Colón 1234',
  createdAt: new Date(),
};

const mockOrderRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockItemRepo = {
  create: jest.fn(),
};

const mockCartService = {
  getOrCreateCart: jest.fn(),
  clearCart: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: mockItemRepo },
        { provide: CartService, useValue: mockCartService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  // ── createFromCart ────────────────────────────────────────
  describe('createFromCart', () => {
    it('debe crear una orden desde el carrito', async () => {
      mockCartService.getOrCreateCart.mockResolvedValue(mockCart);
      mockItemRepo.create.mockImplementation((data) => data);
      mockOrderRepo.create.mockReturnValue(mockOrder);
      mockOrderRepo.save.mockResolvedValue(mockOrder);
      mockCartService.clearCart.mockResolvedValue(undefined);

      const result = await service.createFromCart(
        mockUser as any,
        { shippingAddress: 'Av. Colón 1234' },
      );

      expect(result).toEqual(mockOrder);
      expect(mockCartService.clearCart).toHaveBeenCalledWith(mockUser);
    });

    it('debe lanzar BadRequestException si el carrito está vacío', async () => {
      mockCartService.getOrCreateCart.mockResolvedValue({ ...mockCart, items: [] });

      await expect(
        service.createFromCart(mockUser as any, { shippingAddress: 'Av. Colón 1234' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── findMyOrders ──────────────────────────────────────────
  describe('findMyOrders', () => {
    it('debe retornar las órdenes del usuario logueado', async () => {
      mockOrderRepo.find.mockResolvedValue([mockOrder]);

      const result = await service.findMyOrders(mockUser as any);

      expect(mockOrderRepo.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockOrder]);
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne', () => {
    it('debe retornar la orden si pertenece al usuario', async () => {
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);
      const result = await service.findOne(1, mockUser as any);
      expect(result).toEqual(mockOrder);
    });

    it('debe lanzar NotFoundException si la orden no existe', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999, mockUser as any)).rejects.toThrow(NotFoundException);
    });

    it('admin puede ver cualquier orden', async () => {
      const otherUserOrder = { ...mockOrder, user: { id: 99 } };
      mockOrderRepo.findOne.mockResolvedValue(otherUserOrder);
      const result = await service.findOne(1, mockAdmin as any);
      expect(result).toEqual(otherUserOrder);
    });
  });

  // ── updateStatus ──────────────────────────────────────────
  describe('updateStatus', () => {
    it('debe actualizar el estado de una orden', async () => {
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);
      mockOrderRepo.save.mockResolvedValue({ ...mockOrder, status: OrderStatus.PAID });

      const result = await service.updateStatus(1, OrderStatus.PAID);
      expect(result.status).toBe(OrderStatus.PAID);
    });

    it('debe lanzar NotFoundException si la orden no existe', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(service.updateStatus(999, OrderStatus.PAID)).rejects.toThrow(NotFoundException);
    });
  });
});
