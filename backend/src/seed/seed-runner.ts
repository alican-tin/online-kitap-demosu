import { PrismaClient, UserRole } from "@prisma/client";
import { faker } from "@faker-js/faker";
import * as bcrypt from "bcryptjs";

// Test accounts (password: 123456)
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync("123456", 10);

const ADMIN_USER = {
  name: "Alican Tin",
  email: "alican@demo.local",
  passwordHash: DEFAULT_PASSWORD_HASH,
  role: UserRole.ADMIN,
};

const CUSTOMER_USER = {
  name: "Caner Kaya",
  email: "caner@demo.local",
  passwordHash: DEFAULT_PASSWORD_HASH,
  role: UserRole.CUSTOMER,
};

const DAY_MS = 24 * 60 * 60 * 1000;

const toAscii = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "");

const buildEmail = (name: string, index: number) => {
  const base = toAscii(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
  const local = base ? `${base}.${index + 1}` : `kullanici${index + 1}`;

  return `${local}@demo.local`;
};

const buildUserTimestamps = (now: Date, minYears: number, maxYears: number) => {
  const createdFrom = new Date(now.getFullYear() - maxYears, now.getMonth(), 1);
  const createdTo = new Date(now.getFullYear() - minYears, now.getMonth(), 1);
  const updatedTo = new Date(now.getTime() - DAY_MS * 7);

  const createdAt = faker.date.between({ from: createdFrom, to: createdTo });
  const updatedAt = faker.date.between({ from: createdAt, to: updatedTo });

  return { createdAt, updatedAt };
};

// Static catalog: titles/authors/image paths are hand-curated.
const BOOKS = [
  {
    title: "Saatleri Ayarlama Enstitüsü",
    author: "Ahmet Hamdi Tanpınar",
    imagePath: "/images/saatleri-ayarlama-enstitusu.jpg",
  },
  {
    title: "Kürk Mantolu Madonna",
    author: "Sabahattin Ali",
    imagePath: "/images/kurk-mantolu-madonna.jpg",
  },
  {
    title: "İnce Memed",
    author: "Yaşar Kemal",
    imagePath: "/images/ince-memed.jpg",
  },
  {
    title: "Tutunamayanlar",
    author: "Oğuz Atay",
    imagePath: "/images/tutunamayanlar.jpg",
  },
  {
    title: "Huzur",
    author: "Ahmet Hamdi Tanpınar",
    imagePath: "/images/huzur.jpg",
  },
  {
    title: "Aylak Adam",
    author: "Yusuf Atılgan",
    imagePath: "/images/aylak-adam.jpg",
  },
  {
    title: "Ankara",
    author: "Yakup Kadri Karaosmanoğlu",
    imagePath: "/images/ankara.jpg",
  },
  {
    title: "Çalıkuşu",
    author: "Reşat Nuri Güntekin",
    imagePath: "/images/calikusu.jpg",
  },
  {
    title: "Dokuzuncu Hariciye Koğuşu",
    author: "Peyami Safa",
    imagePath: "/images/dokuzuncu-hariciye-kogusu.jpg",
  },
  {
    title: "Kuyucaklı Yusuf",
    author: "Sabahattin Ali",
    imagePath: "/images/kuyucakli-yusuf.jpg",
  },
  {
    title: "Yaban",
    author: "Yakup Kadri Karaosmanoğlu",
    imagePath: "/images/yaban.jpg",
  },
  {
    title: "Mai ve Siyah",
    author: "Halit Ziya Uşaklıgil",
    imagePath: "/images/mai-ve-siyah.jpg",
  },
  {
    title: "Aşk-ı Memnu",
    author: "Halit Ziya Uşaklıgil",
    imagePath: "/images/ask-i-memnu.jpg",
  },
  {
    title: "Sinekli Bakkal",
    author: "Halide Edib Adıvar",
    imagePath: "/images/sinekli-bakkal.jpg",
  },
  {
    title: "Bir Düğün Gecesi",
    author: "Adalet Ağaoğlu",
    imagePath: "/images/bir-dugun-gecesi.jpg",
  },
  {
    title: "Puslu Kıtalar Atlası",
    author: "İhsan Oktay Anar",
    imagePath: "/images/puslu-kitalar-atlasi.jpg",
  },
  {
    title: "Ölmeye Yatmak",
    author: "Adalet Ağaoğlu",
    imagePath: "/images/olmeye-yatmak.jpg",
  },
  {
    title: "Tehlikeli Oyunlar",
    author: "Oğuz Atay",
    imagePath: "/images/tehlikeli-oyunlar.jpg",
  },
  {
    title: "Fatih-Harbiye",
    author: "Peyami Safa",
    imagePath: "/images/fatih-harbiye.jpg",
  },
  {
    title: "Kiralık Konak",
    author: "Yakup Kadri Karaosmanoğlu",
    imagePath: "/images/kiralik-konak.jpg",
  },
  {
    title: "Sergüzeşt",
    author: "Samipaşazade Sezai",
    imagePath: "/images/serguzest.jpg",
  },
  {
    title: "Memleket Hikayeleri",
    author: "Refik Halit Karay",
    imagePath: "/images/memleket-hikayeleri.jpg",
  },
  {
    title: "Serenad",
    author: "Zülfü Livaneli",
    imagePath: "/images/serenad.jpg",
  },
  {
    title: "Kaşağı",
    author: "Ömer Seyfettin",
    imagePath: "/images/kasagi.jpg",
  },
];

const SALES_HISTORY_YEARS = 3; // Generate sales within the last N years.

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const buildRevenueBuckets = (sales: Array<{ soldAt: Date; totalAmount: number }>) => {
  const buckets = new Map<string, { amount: number; periodStart: Date; periodEnd: Date }>();

  for (const sale of sales) {
    const periodStart = startOfMonth(sale.soldAt);
    const periodEnd = endOfMonth(sale.soldAt);
    const key = `${periodStart.getFullYear()}-${periodStart.getMonth() + 1}`;
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.amount += sale.totalAmount;
    } else {
      buckets.set(key, {
        amount: sale.totalAmount,
        periodStart,
        periodEnd,
      });
    }
  }

  return Array.from(buckets.values());
};

const buildSales = (
  bookId: string,
  customerIds: string[],
  unitPrice: number,
  dateFrom: Date,
  dateTo: Date,
) => {
  const salesCount = faker.number.int({ min: 8, max: 20 });
  const minUnitPrice = Math.max(1500, Math.floor(unitPrice * 0.9));
  const maxUnitPrice = Math.max(minUnitPrice, Math.floor(unitPrice * 1.1));

  return Array.from({ length: salesCount }, () => {
    const quantity = faker.number.int({ min: 1, max: 4 });
    const saleUnitPrice = faker.number.int({ min: minUnitPrice, max: maxUnitPrice });
    const soldAt = faker.date.between({ from: dateFrom, to: dateTo });

    return {
      bookId,
      buyerId: faker.helpers.arrayElement(customerIds),
      quantity,
      unitPrice: saleUnitPrice,
      totalAmount: saleUnitPrice * quantity,
      soldAt,
    };
  });
};

const buildCustomers = (count: number, now: Date) =>
  Array.from({ length: count }, (_, index) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const { createdAt, updatedAt } = buildUserTimestamps(now, 1, 6);

    return {
      name,
      email: buildEmail(name, index),
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.CUSTOMER,
      createdAt,
      updatedAt,
    };
  });

const resetDatabase = async (prisma: PrismaClient) => {
  await prisma.revenue.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
};

export const runSeed = async (prisma: PrismaClient) => {
  faker.seed(20260428);

  await resetDatabase(prisma);

  const now = new Date();
  const adminDates = buildUserTimestamps(now, 4, 7);
  const customerDates = buildUserTimestamps(now, 2, 5);

  await prisma.user.create({ data: { ...ADMIN_USER, ...adminDates } });
  await prisma.user.create({ data: { ...CUSTOMER_USER, ...customerDates } });
  await prisma.user.createMany({ data: buildCustomers(12, now) });

  const customers = await prisma.user.findMany({
    where: { role: UserRole.CUSTOMER },
    select: { id: true },
  });

  const customerIds = customers.map((customer) => customer.id);
  const dateFrom = new Date(now.getFullYear() - SALES_HISTORY_YEARS, now.getMonth(), 1);
  const dateTo = new Date(now.getTime() - DAY_MS * 2);

  for (const book of BOOKS) {
    const price = faker.number.int({ min: 4500, max: 35000 });
    const createdBook = await prisma.book.create({
      data: {
        ...book,
        price,
      },
    });

    const salesData = buildSales(createdBook.id, customerIds, price, dateFrom, dateTo);
    await prisma.sale.createMany({ data: salesData });

    const revenueData = buildRevenueBuckets(salesData).map((bucket) => ({
      bookId: createdBook.id,
      amount: bucket.amount,
      periodStart: bucket.periodStart,
      periodEnd: bucket.periodEnd,
    }));

    if (revenueData.length > 0) {
      await prisma.revenue.createMany({ data: revenueData });
    }
  }
};
