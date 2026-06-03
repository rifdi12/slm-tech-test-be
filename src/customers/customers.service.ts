import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const { page = 1, limit = 10, search, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { invoices: true } },
          invoices: {
            select: { totalAmount: true, status: true },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    const enriched = customers.map((c) => {
      const totalBilled = c.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const { invoices: _, ...customer } = c;
      return { ...customer, totalBilled };
    });

    return {
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const totalBilled = customer.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    return { ...customer, totalBilled };
  }

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('A customer with this email already exists');
    }

    return this.prisma.customer.create({ data: dto });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);

    if (dto.email) {
      const existing = await this.prisma.customer.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('A customer with this email already exists');
      }
    }

    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.customer.delete({ where: { id } });
  }
}
