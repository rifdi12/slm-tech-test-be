import { IsOptional, IsString, IsDateString, IsIn, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateInvoiceItemDto } from './create-invoice.dto';

export class UpdateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE'] })
  @IsOptional()
  @IsIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [CreateInvoiceItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items?: CreateInvoiceItemDto[];
}

export class UpdateInvoiceStatusDto {
  @ApiPropertyOptional({ enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE'] })
  @IsIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE'])
  status: string;
}
