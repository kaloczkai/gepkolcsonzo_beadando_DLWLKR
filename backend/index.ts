import express, { Request, Response } from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import { Machine } from './entity/Machine';
import { Partner } from './entity/Partner';
import { Transaction } from './entity/Transaction';
import { Rental } from './entity/Rental';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(() => console.log('Adatbázis csatlakoztatva'))
  .catch((error) => console.error('Adatbázis hiba:', error));

// Gépek
app.post('/machines', async (req: Request, res: Response) => {
  try {
    if (!/^\d{6}$/.test(req.body.code)) {
      return res.status(400).json({ error: 'A gépkódnak pontosan 6 számjegyűnek kell lennie (000000–999999).' });
    }
    const repo = AppDataSource.getRepository(Machine);
    const machine = repo.create(req.body);
    const saved = await repo.save(machine);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Hiba a gép mentésekor:', error);
    res.status(400).json({ error: 'Hibás adat vagy mentési hiba' });
  }
});

app.get('/machines', async (_req: Request, res: Response) => {
  const machines = await AppDataSource.getRepository(Machine).find();
  res.json(machines);
});

// Partnerek
app.post('/partners', async (req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(Partner);
  const partner = repo.create({ ...req.body, balance: 15000 }); // 🔒 Ne változtasd meg
  const saved = await repo.save(partner);
  res.status(201).json(saved);
});

app.get('/partners', async (_req: Request, res: Response) => {
  const partners = await AppDataSource.getRepository(Partner).find();
  res.json(partners);
});

app.put('/partners/:id', async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Partner);
    const id = Number(req.params.id);
    const partner = await repo.findOneBy({ id });

    if (!partner) {
      return res.status(404).json({ error: 'Partner nem található' });
    }

    const defaultData = {
      name: '',
      representative: '',
      taxNumber: '',
      companyNumber: '',
      headquarters: ''
    };

    const mergedData = { ...defaultData, ...partner, ...req.body };

    repo.merge(partner, mergedData);
    const saved = await repo.save(partner);
    res.json(saved);
  } catch (err) {
    console.error('Partner módosítási hiba:', err);
    res.status(500).json({ error: 'Szerverhiba partner frissítésekor' });
  }
});

// Tranzakciók
app.post('/transactions', async (req: Request, res: Response) => {
  try {
    const transactionRepo = AppDataSource.getRepository(Transaction);
    const partnerRepo = AppDataSource.getRepository(Partner);

    const { partnerId, type, amount, date } = req.body;
    const partner = await partnerRepo.findOneBy({ id: partnerId });

    if (!partner) {
      return res.status(404).json({ error: 'Partner nem található' });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Érvénytelen összeg' });
    }

    if (type === 'credit') {
      partner.balance += numericAmount;
    } else if (type === 'debit') {
      partner.balance -= numericAmount;
    } else {
      return res.status(400).json({ error: 'Ismeretlen tranzakció típus' });
    }

    const transaction = transactionRepo.create({ type, amount: numericAmount, date, partner });
    await partnerRepo.save(partner);
    const savedTransaction = await transactionRepo.save(transaction);

    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Tranzakció mentési hiba:', error);
    res.status(500).json({ error: 'Hiba történt a tranzakció mentésekor' });
  }
});

app.get('/transactions', async (req: Request, res: Response) => {
  const { partnerId, from, to } = req.query;

  const query = AppDataSource.getRepository(Transaction)
    .createQueryBuilder('transaction')
    .leftJoinAndSelect('transaction.partner', 'partner');

  if (partnerId) {
    query.andWhere('partner.id = :partnerId', { partnerId: Number(partnerId) });
  }
  if (from) {
    query.andWhere('transaction.date >= :from', { from });
  }
  if (to) {
    query.andWhere('transaction.date <= :to', { to });
  }

  const results = await query.getMany();
  res.json(results);
});

// Kölcsönzések
app.post('/rentals', async (req: Request, res: Response) => {
  try {
    const { partnerId, machineId, startDate } = req.body;

    const partnerRepo = AppDataSource.getRepository(Partner);
    const machineRepo = AppDataSource.getRepository(Machine);
    const rentalRepo = AppDataSource.getRepository(Rental);

    const partner = await partnerRepo.findOne({
      where: { id: partnerId },
      relations: ['rentals'],
    });

    const machine = await machineRepo.findOneBy({ id: machineId });

    if (!partner || !machine) {
      return res.status(404).json({ error: 'Partner vagy gép nem található' });
    }

    if (partner.balance < -50000) {
      return res.status(400).json({ error: 'A partner tartozása meghaladja az 50 000 Ft-ot, nem kölcsönözhet.' });
    }

    const rental = rentalRepo.create({ partner, machine, startDate });
    const saved = await rentalRepo.save(rental);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Hiba kölcsönzéskor:', err);
    res.status(500).json({ error: 'Hiba történt' });
  }
});

app.get('/rentals', async (_req: Request, res: Response) => {
  const rentals = await AppDataSource.getRepository(Rental).find({
    relations: ['partner', 'machine'],
  });
  res.json(rentals);
});

app.put('/rentals/:id/close', async (req: Request, res: Response) => {
  try {
    const rentalRepo = AppDataSource.getRepository(Rental);
    const partnerRepo = AppDataSource.getRepository(Partner);

    const id = parseInt(req.params.id, 10);
    const { endDate, intact } = req.body;

    const rental = await rentalRepo.findOne({
      where: { id },
      relations: ['partner', 'machine']
    });

    if (!rental || rental.returned) {
      return res.status(404).json({ error: 'Kölcsönzés nem található vagy már lezárták' });
    }

    rental.returned = true;
    rental.endDate = endDate;
    rental.intact = intact;

    const start = new Date(rental.startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    let total = days * rental.machine.dailyRate;
    if (!intact) {
      total += rental.machine.deposit;
    } else {
      total -= rental.machine.deposit;
    }

    rental.partner.balance -= total;
    await partnerRepo.save(rental.partner);
    const saved = await rentalRepo.save(rental);

    res.json(saved);
  } catch (err) {
    console.error('Lezárási hiba:', err);
    res.status(500).json({ error: 'Hiba történt a kölcsönzés lezárásakor' });
  }
});

app.get('/partners/:id', async (req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(Partner);
  const id = Number(req.params.id);
  const partner = await repo.findOneBy({ id });

  if (!partner) {
    return res.status(404).json({ error: 'Partner nem található' });
  }

  res.json(partner);
});

// Szerver indítása
app.listen(port, () => {
  console.log(`Szerver fut a http://localhost:${port} címen`);
});
