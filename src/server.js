const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

function verifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if (!customer) {
    return res.status(422).json({ error: 'Customer not found' });
  }

  req.customer = customer;
  
  return next();
}

function getBalance(statement) {
  return statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);
}

app.post('/account', (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.find(customer => customer.cpf === cpf);

  if (customerAlreadyExists) {
    return res.status(422).json({ error: 'Customer already exists' });
  }

  customers.push({
    id: uuidv4(),
    name,
    cpf,
    statement: [],
    created_at: new Date(),
    updated_at: new Date(),
  });

  res.status(201).send();
});

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;

  return res.json(customer.statement);
});

app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const formatedDate = new Date(`${date} 00:00`);

  const statement = customer.statement.filter(
    operation => operation.created_at.toDateString() === formatedDate.toDateString()
  );

  return res.json(statement);
});

app.post('/deposit', verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { description, amount } = req.body;

  const operation = {
    description,
    amount,
    created_at: new Date(),
    updated_at: new Date(),
    type: 'credit',
  }

  customer.statement.push(operation);

  return res.status(201).json(operation);
});

app.post('/withdraw', verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { amount } = req.body;

  const balance = getBalance(customer.statement);

  if (amount > balance) {
    return res.status(400).json({ error: 'Insuficient founds' });
  }

  const operation = {
    description: 'Saque',
    amount,
    created_at: new Date(),
    updated_at: new Date(),
    type: 'debit',
  }

  customer.statement.push(operation);

  return res.status(201).json(operation);
});

app.listen(3333);
