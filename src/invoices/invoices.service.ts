import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  private async generateInvoiceNumber(): Promise<string> {
    const lastInvoice = await this.prisma.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!lastInvoice) {
      return 'INV-0001';
    }

    const parts = lastInvoice.invoiceNumber.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    return `INV-${String(lastNum + 1).padStart(4, '0')}`;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
  }) {
    const { page = 1, limit = 10, search, status, customerId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { company: { contains: search } } },
      ];
    }
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async create(dto: CreateInvoiceDto) {
    const { items, ...invoiceData } = dto;

    const invoiceItems = items.map((item) => ({
      ...item,
      amount: item.quantity * item.unitPrice,
    }));

    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const invoiceNumber = await this.generateInvoiceNumber();

    return this.prisma.invoice.create({
      data: {
        ...invoiceData,
        invoiceNumber,
        totalAmount,
        issueDate: new Date(dto.issueDate),
        dueDate: new Date(dto.dueDate),
        items: { create: invoiceItems },
      },
      include: { customer: true, items: true },
    });
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    await this.findOne(id);

    const { items, ...invoiceData } = dto;

    const updateData: any = { ...invoiceData };
    if (dto.issueDate) updateData.issueDate = new Date(dto.issueDate);
    if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate);

    if (items !== undefined) {
      const invoiceItems = items.map((item) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      }));
      const totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);

      await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      updateData.items = { create: invoiceItems };
      updateData.totalAmount = totalAmount;
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { customer: true, items: true },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.invoice.update({
      where: { id },
      data: { status },
      include: { customer: true, items: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.invoice.delete({ where: { id } });
  }
}
