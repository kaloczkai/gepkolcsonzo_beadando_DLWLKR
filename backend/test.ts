import express from 'express';

const app = express();
app.use(express.json());

app.post('/transactions', async (req, res) => {
  try {
    const { amount } = req.body;
    res.status(201).json({ ok: true, received: amount });
  } catch (error) {
    res.status(500).json({ error: 'hiba' });
  }
}); // ⬅️ FONTOS zárás

app.listen(3000, () => {
  console.log('OK');
});
