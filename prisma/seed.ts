import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'alex@miniERP.com' },
    update: {},
    create: {
      email: 'alex@miniERP.com',
      password: hashedPassword,
      name: 'Alex Rivera',
      role: 'ADMIN',
    },
  });

  const customersData = [
    {
      name: 'Jane Doe',
      email: 'jane.doe@techflow.com',
      phone: '+1 (555) 012-3456',
      company: 'TechFlow Inc.',
      address: '123 Tech Street, San Francisco, CA 94105',
      status: 'ACTIVE',
    },
    {
      name: 'Marcus Sterling',
      email: 'm.sterling@globalnet.io',
      phone: '+44 20 7946 0958',
      company: 'GlobalNet Solutions',
      address: '45 Business Park, London, UK EC1A 1BB',
      status: 'ACTIVE',
    },
    {
      name: 'Elena Lund',
      email: 'elund@nordicdesign.se',
      phone: '+46 8 123 45 67',
      company: 'Nordic Design AB',
      address: 'Storgatan 12, Stockholm, Sweden',
      status: 'INACTIVE',
    },
    {
      name: 'Oscar Wilde',
      email: 'o.wilde@creativearts.co.uk',
      phone: '+44 1632 960812',
      company: 'Creative Arts Ltd.',
      address: '7 Gallery Row, Manchester, UK M1 1AE',
      status: 'ACTIVE',
    },
    {
      name: 'Sarah Miller',
      email: 'sarah@millermedia.com',
      phone: '+1 (555) 987-6543',
      company: 'Miller Media Group',
      address: '890 Media Blvd, New York, NY 10001',
      status: 'ACTIVE',
    },
    {
      name: 'TechCorp Solutions',
      email: 'billing@techcorp.com',
      phone: '+1 (555) 234-5678',
      company: 'TechCorp Solutions',
      address: '456 Innovation Way, Austin, TX 78701',
      status: 'ACTIVE',
    },
    {
      name: 'Global Logistics',
      email: 'accounts@globallogistics.com',
      phone: '+1 (555) 345-6789',
      company: 'Global Logistics Inc.',
      address: '789 Freight Ave, Chicago, IL 60601',
      status: 'ACTIVE',
    },
    {
      name: 'Swift Media',
      email: 'billing@swiftmedia.com',
      phone: '+1 (555) 456-7890',
      company: 'Swift Media',
      address: '321 Studio Lane, Los Angeles, CA 90001',
      status: 'ACTIVE',
    },
    {
      name: 'Apex Holdings',
      email: 'finance@apexholdings.com',
      phone: '+1 (555) 567-8901',
      company: 'Apex Holdings LLC',
      address: '654 Corporate Blvd, Dallas, TX 75201',
      status: 'ACTIVE',
    },
    {
      name: 'Zenith Designs',
      email: 'hello@zenithdesigns.com',
      phone: '+1 (555) 678-9012',
      company: 'Zenith Designs Studio',
      address: '987 Creative St, Seattle, WA 98101',
      status: 'ACTIVE',
    },
  ];

  const customers: any[] = [];
  for (const data of customersData) {
    const customer = await prisma.customer.upsert({
      where: { email: data.email },
      update: {},
      create: data,
    });
    customers.push(customer);
  }

  let invoiceCounter = 8838;
  const getInvoiceNumber = () => `INV-${++invoiceCounter}`;

  const createInvoice = async (
    customer: any,
    status: string,
    issueDate: Date,
    dueDate: Date,
    items: { description: string; quantity: number; unitPrice: number }[],
    notes?: string,
  ) => {
    const invoiceItems = items.map((item) => ({
      ...item,
      amount: item.quantity * item.unitPrice,
    }));
    const totalAmount = invoiceItems.reduce((sum, i) => sum + i.amount, 0);

    return prisma.invoice.create({
      data: {
        invoiceNumber: getInvoiceNumber(),
        customerId: customer.id,
        issueDate,
        dueDate,
        status,
        notes,
        totalAmount,
        items: {
          create: invoiceItems,
        },
      },
    });
  };

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);
  const daysAhead = (n: number) => new Date(now.getTime() + n * 86400000);

  await createInvoice(
    customers[0],
    'PAID',
    daysAgo(40),
    daysAgo(26),
    [
      { description: 'Software Development Services', quantity: 80, unitPrice: 125 },
      { description: 'UI/UX Design', quantity: 20, unitPrice: 100 },
    ],
    'Payment received on time. Thank you.',
  );

  await createInvoice(
    customers[1],
    'PAID',
    daysAgo(35),
    daysAgo(21),
    [
      { description: 'Network Infrastructure Consulting', quantity: 40, unitPrice: 150 },
      { description: 'Security Audit', quantity: 16, unitPrice: 200 },
    ],
  );

  await createInvoice(
    customers[2],
    'PAID',
    daysAgo(30),
    daysAgo(16),
    [{ description: 'Brand Identity Package', quantity: 1, unitPrice: 3150 }],
  );

  await createInvoice(
    customers[3],
    'OVERDUE',
    daysAgo(20),
    daysAgo(6),
    [
      { description: 'Creative Direction - Q3 Campaign', quantity: 1, unitPrice: 15000 },
      { description: 'Photography & Editing', quantity: 4, unitPrice: 2475 },
    ],
    'Payment overdue. Please settle at earliest convenience.',
  );

  await createInvoice(
    customers[4],
    'PAID',
    daysAgo(25),
    daysAgo(11),
    [{ description: 'Social Media Management (Monthly)', quantity: 1, unitPrice: 1890 }],
  );

  await createInvoice(
    customers[5],
    'PAID',
    daysAgo(10),
    daysAhead(4),
    [
      { description: 'Full Stack Development', quantity: 30, unitPrice: 125 },
      { description: 'DevOps Setup', quantity: 4, unitPrice: 175 },
    ],
  );

  await createInvoice(
    customers[6],
    'SENT',
    daysAgo(8),
    daysAhead(6),
    [{ description: 'Logistics Software License (Annual)', quantity: 1, unitPrice: 1890 }],
  );

  await createInvoice(
    customers[7],
    'PAID',
    daysAgo(7),
    daysAhead(7),
    [
      { description: 'Video Production', quantity: 1, unitPrice: 8500 },
      { description: 'Post Production & Editing', quantity: 10, unitPrice: 390 },
    ],
  );

  await createInvoice(
    customers[8],
    'OVERDUE',
    daysAgo(15),
    daysAgo(1),
    [
      { description: 'Enterprise Software License', quantity: 2, unitPrice: 2500 },
      { description: 'Implementation Services', quantity: 4, unitPrice: 150 },
    ],
    'Net 14 terms. Account is now overdue.',
  );

  await createInvoice(
    customers[9],
    'DRAFT',
    daysAgo(3),
    daysAhead(25),
    [{ description: 'Logo & Brand Guidelines', quantity: 1, unitPrice: 940 }],
  );

  await createInvoice(
    customers[0],
    'SENT',
    daysAgo(5),
    daysAhead(9),
    [
      { description: 'Backend API Development', quantity: 60, unitPrice: 125 },
      { description: 'Database Optimization', quantity: 8, unitPrice: 150 },
    ],
  );

  await createInvoice(
    customers[1],
    'DRAFT',
    daysAgo(2),
    daysAhead(28),
    [{ description: 'Cloud Architecture Review', quantity: 1, unitPrice: 4200 }],
  );

  console.log('Seeding complete!');
  console.log('');
  console.log('Default credentials:');
  console.log('  Email:    alex@miniERP.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
