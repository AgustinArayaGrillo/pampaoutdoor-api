import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Camperas' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'camperas' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Camperas y abrigos', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
