import {
  IsString, IsOptional, IsDateString, IsArray,
  ValidateNested, IsNumber, Min, IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'Software Development Services' })
  @IsString()
  description: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 125.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'customer-uuid' })
  @IsString()
  customerId: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  issueDate: string;

  @ApiProperty({ example: '2024-01-29' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE'], default: 'DRAFT' })
  @IsOptional()
  @IsIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE'])
  status?: string;

  @ApiPropertyOptional({ example: 'Net 14 payment terms.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
