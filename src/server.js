const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

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
    statements: [],
    created_at: new Date(),
    updated_at: new Date(),
  });

  res.status(201).send();
});

app.get('/statement', (req, res) => {
  const { cpf } = req.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if (!customer) {
    return res.status(422).json({ error: 'Customer not found' });
  }

  return res.json(customer.statements);
});

app.listen(3333);
