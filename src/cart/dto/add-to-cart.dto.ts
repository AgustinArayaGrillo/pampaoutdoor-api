import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number = 1;

  @ApiProperty({ example: 'M', required: false })
  @IsOptional()
  @IsString()
  selectedSize?: string;

  @ApiProperty({ example: 'Negro', required: false })
  @IsOptional()
  @IsString()
  selectedColor?: string;
}
