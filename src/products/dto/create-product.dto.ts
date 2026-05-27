import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Campera Softshell Vinson' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Ansilta' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 'softshell', required: false })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({ example: 89900 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 112000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  oldPrice?: number;

  @ApiProperty({ example: 'Sale', required: false })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiProperty({ example: 'sale', required: false })
  @IsOptional()
  @IsString()
  badgeType?: string;

  @ApiProperty({ example: ['XS', 'S', 'M', 'L', 'XL'] })
  @IsArray()
  sizes: string[];

  @ApiProperty({ example: ['Negro', 'Rojo', 'Gris'] })
  @IsArray()
  colors: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;
}
