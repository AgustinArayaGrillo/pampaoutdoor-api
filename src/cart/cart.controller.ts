import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.service.getOrCreateCart(user);
  }

  @Post('items')
  addItem(@CurrentUser() user: User, @Body() dto: AddToCartDto) {
    return this.service.addItem(user, dto);
  }

  @Put('items/:id')
  updateItem(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number,
  ) {
    return this.service.updateItem(user, id, quantity);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.service.removeItem(user, id);
  }

  @Delete()
  clearCart(@CurrentUser() user: User) {
    return this.service.clearCart(user);
  }
}
