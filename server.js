const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Load/Save data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('خطا در بارگیری داده:', err);
  }
  return { periods: [], entries: [], active: null };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('خطا در ذخیره داده:', err);
    return false;
  }
}

// ==================== PERIODS ====================

// GET تمام دوره‌ها
app.get('/api/periods', (req, res) => {
  const data = loadData();
  res.json({ periods: data.periods, active: data.active });
});

// GET یک دوره
app.get('/api/periods/:id', (req, res) => {
  const data = loadData();
  const period = data.periods.find(p => p.id === req.params.id);
  if (!period) return res.status(404).json({ error: 'دوره یافت نشد' });
  res.json(period);
});

// POST - دوره جدید
app.post('/api/periods', (req, res) => {
  const { name, breed, count, date, initW, hallCounts, hallInitW, hallMotherAge, activeHalls, code } = req.body;
  
  if (!name || !date || !count) {
    return res.status(400).json({ error: 'نام، تاریخ و تعداد الزامی‌اند' });
  }

  const data = loadData();
  const id = 'p_' + Date.now();
  const newPeriod = {
    id,
    code: code || ('D-' + Math.random().toString(36).substr(2, 4).toUpperCase()),
    name,
    breed: breed || '',
    count,
    date,
    initW: initW || 42,
    motherAge: req.body.motherAge || 0,
    hallCounts: hallCounts || [],
    hallInitW: hallInitW || [],
    hallMotherAge: hallMotherAge || [],
    activeHalls: activeHalls || 6,
    createdAt: new Date().toISOString()
  };

  data.periods.push(newPeriod);
  if (!data.active) data.active = id;
  saveData(data);
  
  res.status(201).json({ message: 'دوره ایجاد شد', period: newPeriod });
});

// PUT - ویرایش دوره
app.put('/api/periods/:id', (req, res) => {
  const data = loadData();
  const idx = data.periods.findIndex(p => p.id === req.params.id);
  
  if (idx === -1) return res.status(404).json({ error: 'دوره یافت نشد' });

  const { name, breed, count, date, initW } = req.body;
  if (name) data.periods[idx].name = name;
  if (breed) data.periods[idx].breed = breed;
  if (count) data.periods[idx].count = count;
  if (date) data.periods[idx].date = date;
  if (initW) data.periods[idx].initW = initW;

  saveData(data);
  res.json({ message: 'دوره ویرایش شد', period: data.periods[idx] });
});

// DELETE - حذف دوره
app.delete('/api/periods/:id', (req, res) => {
  const data = loadData();
  data.periods = data.periods.filter(p => p.id !== req.params.id);
  data.entries = data.entries.filter(e => e.periodId !== req.params.id);
  if (data.active === req.params.id) data.active = data.periods[0]?.id || null;
  
  saveData(data);
  res.json({ message: 'دوره حذف شد' });
});

// SET ACTIVE
app.post('/api/active/:id', (req, res) => {
  const data = loadData();
  const period = data.periods.find(p => p.id === req.params.id);
  if (!period) return res.status(404).json({ error: 'دوره یافت نشد' });

  data.active = req.params.id;
  saveData(data);
  res.json({ message: 'دوره فعال شد', active: data.active });
});

// ==================== ENTRIES (تلفات/وزن/جیره) ====================

// GET تمام entries یک دوره
app.get('/api/entries/:periodId', (req, res) => {
  const data = loadData();
  const entries = data.entries.filter(e => e.periodId === req.params.periodId);
  res.json({ entries });
});

// GET یک entry
app.get('/api/entry/:id', (req, res) => {
  const data = loadData();
  const entry = data.entries.find(e => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'رکورد یافت نشد' });
  res.json(entry);
});

// POST - entry جدید (تلفات/وزن/جیره)
app.post('/api/entries', (req, res) => {
  const { periodId, type, date, hall, count, weight, feed, medicine, note } = req.body;
  
  if (!periodId || !type || !date) {
    return res.status(400).json({ error: 'periodId، type و date الزامی‌اند' });
  }

  const data = loadData();
  const period = data.periods.find(p => p.id === periodId);
  if (!period) return res.status(404).json({ error: 'دوره یافت نشد' });

  const id = 'e_' + Date.now();
  const newEntry = {
    id,
    periodId,
    type, // 'mortality' | 'weight' | 'feed' | 'medicine'
    date,
    hall: hall || 0,
    count: count || null,
    weight: weight || null,
    feed: feed || null,
    medicine: medicine || null,
    note: note || '',
    createdAt: new Date().toISOString()
  };

  data.entries.push(newEntry);
  saveData(data);
  
  res.status(201).json({ message: 'رکورد ثبت شد', entry: newEntry });
});

// PUT - ویرایش entry
app.put('/api/entries/:id', (req, res) => {
  const data = loadData();
  const idx = data.entries.findIndex(e => e.id === req.params.id);
  
  if (idx === -1) return res.status(404).json({ error: 'رکورد یافت نشد' });

  const { count, weight, feed, medicine, note } = req.body;
  if (count !== undefined) data.entries[idx].count = count;
  if (weight !== undefined) data.entries[idx].weight = weight;
  if (feed !== undefined) data.entries[idx].feed = feed;
  if (medicine !== undefined) data.entries[idx].medicine = medicine;
  if (note) data.entries[idx].note = note;

  saveData(data);
  res.json({ message: 'رکورد ویرایش شد', entry: data.entries[idx] });
});

// DELETE - حذف entry
app.delete('/api/entries/:id', (req, res) => {
  const data = loadData();
  data.entries = data.entries.filter(e => e.id !== req.params.id);
  saveData(data);
  res.json({ message: 'رکورد حذف شد' });
});

// ==================== SUMMARY ====================

// GET خلاصه یک دوره
app.get('/api/summary/:periodId', (req, res) => {
  const data = loadData();
  const entries = data.entries.filter(e => e.periodId === req.params.periodId);
  
  const summary = {
    totalMortality: entries.filter(e => e.type === 'mortality').reduce((s, e) => s + (e.count || 0), 0),
    totalFeed: entries.filter(e => e.type === 'feed').reduce((s, e) => s + (e.feed || 0), 0),
    avgWeight: entries.filter(e => e.type === 'weight').reduce((s, e) => s + (e.weight || 0), 0) / 
               (entries.filter(e => e.type === 'weight').length || 1),
    entries: entries.length
  };
  
  res.json(summary);
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🐔 API مرغداری فعال است' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 API مرغداری در پورت ${PORT} فعال است`);
  console.log(`📊 http://localhost:${PORT}/api/health`);
});
