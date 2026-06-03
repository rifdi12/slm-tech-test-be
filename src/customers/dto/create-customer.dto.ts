import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane.doe@techflow.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1 (555) 012-3456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'TechFlow Inc.' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: '123 Tech Street, San Francisco, CA 94105' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: string;
}
