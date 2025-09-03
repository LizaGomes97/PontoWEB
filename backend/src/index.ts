// backend/src/index.ts

import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
const prisma = new PrismaClient();
const port = 3001;

app.use(cors());
// Middleware para permitir que o Express entenda requisições com corpo em JSON
app.use(express.json());

// Rota de teste (pode manter para verificar se o servidor está no ar)
app.get('/api', (req, res) => {
  res.json({ message: 'Olá, o backend do PontoFácil está funcionando!' });
});

// NOSSA NOVA ROTA DE CADASTRO!
app.post('/api/register', async (req, res) => {
  const { name, email, password, type } = req.body;

  // Validação simples (vamos melhorar depois)
  if (!name || !email || !password || !type) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  try {
    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // O "10" é o "custo" do hash, um bom valor padrão

    // Cria o novo usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, 
        type,
      },
    });

    // Remove a senha do objeto antes de enviar de volta como resposta
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar a conta', error });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
  }

  try {
    // 1. Encontra o usuário pelo e-mail
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' }); // Mensagem genérica por segurança
    }

    // 2. Compara a senha enviada com a senha hasheada no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // 3. Se tudo estiver certo, retorna os dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);

  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error });
  }
});

// Rota para buscar os registros de um funcionário
app.get('/api/time-entries/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  try {
    const entries = await prisma.timeEntry.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar registros de ponto' });
  }
});

// Rota para Check-in
app.post('/api/time-entries/check-in', async (req, res) => {
  const { employeeId, date, time, location } = req.body;
  try {
    const newEntry = await prisma.timeEntry.create({
      data: {
        employeeId,
        date,
        checkIn: time,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      },
    });
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar entrada' });
  }
});

// Rota para Check-out
app.post('/api/time-entries/check-out', async (req, res) => {
    const { employeeId, date, time } = req.body;
    try {
        const todayEntry = await prisma.timeEntry.findFirst({
            where: { employeeId, date },
            orderBy: { createdAt: 'desc' },
        });

        if (!todayEntry || !todayEntry.checkIn) {
            return res.status(400).json({ message: 'Nenhum check-in encontrado para hoje.' });
        }

        // Lógica para calcular as horas trabalhadas
        const [checkInHour, checkInMin] = todayEntry.checkIn.split(':').map(Number);
        const [checkOutHour, checkOutMin] = time.split(':').map(Number);
        const checkInMinutes = checkInHour * 60 + checkInMin;
        const checkOutMinutes = checkOutHour * 60 + checkOutMin;
        const totalHours = parseFloat(((checkOutMinutes - checkInMinutes) / 60).toFixed(2));

        const updatedEntry = await prisma.timeEntry.update({
            where: { id: todayEntry.id },
            data: {
                checkOut: time,
                totalHours: totalHours,
            },
        });
        res.json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar saída' });
    }
});

// Rota para buscar TODOS os funcionários
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { type: 'employee' }, // Filtra para retornar apenas funcionários
      orderBy: { name: 'asc' },
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar funcionários' });
  }
});

// Rota para buscar TODOS os registros de ponto
app.get('/api/time-entries', async (req, res) => {
    try {
        const entries = await prisma.timeEntry.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar todos os registros de ponto' });
    }
});

app.post('/api/employees', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        type: 'employee', // O tipo é fixo, pois esta rota só cria funcionários
      },
    });

    const { password: _, ...employeeWithoutPassword } = newEmployee;
    res.status(201).json(employeeWithoutPassword);

  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar funcionário', error });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});