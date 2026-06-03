import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto, UpdateInvoiceStatusDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all invoices with pagination, search, and filter' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE'] })
  @ApiQuery({ name: 'customerId', required: false })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.invoicesService.findAll({ page, limit, search, status, customerId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by ID' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
    return this.invoicesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice' })
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}
