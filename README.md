# 🐔 API مدیریت مرغداری (Morghdari API)

API برای مدیریت داده‌های مرغداری - ثبت تلفات، وزن کشی، جیره و دارو

## 🚀 شروع سریع

### نصب (Local)
```bash
npm install
npm start
```

API در `http://localhost:3000` قابل دسترسی است.

---

## 📋 Endpoints

### **PERIODS (دوره‌ها)**

#### GET تمام دوره‌ها
```
GET /api/periods
```
**پاسخ:**
```json
{
  "periods": [...],
  "active": "p_..."
}
```

#### POST - دوره جدید
```
POST /api/periods
Content-Type: application/json

{
  "name": "دوره اول 1405",
  "breed": "یزدی",
  "count": 10000,
  "date": "1405/02/30",
  "initW": 42,
  "activeHalls": 6,
  "hallCounts": [1000, 2000, 1500, 1800, 2000, 1700]
}
```

#### PUT - ویرایش دوره
```
PUT /api/periods/{periodId}
```

#### DELETE - حذف دوره
```
DELETE /api/periods/{periodId}
```

#### SET ACTIVE - انتخاب دوره فعال
```
POST /api/active/{periodId}
```

---

### **ENTRIES (تلفات/وزن/جیره)**

#### GET entries یک دوره
```
GET /api/entries/{periodId}
```

#### POST - ثبت entry جدید
```
POST /api/entries
Content-Type: application/json

{
  "periodId": "p_...",
  "type": "mortality",  // mortality | weight | feed | medicine
  "date": "1405/03/05",
  "hall": 1,
  "count": 50,
  "note": "بیماری روده‌ای"
}
```

#### PUT - ویرایش entry
```
PUT /api/entries/{entryId}

{
  "count": 60,
  "note": "تصحیح شد"
}
```

#### DELETE - حذف entry
```
DELETE /api/entries/{entryId}
```

---

### **SUMMARY (خلاصه)**

#### GET خلاصه دوره
```
GET /api/summary/{periodId}
```
**پاسخ:**
```json
{
  "totalMortality": 500,
  "totalFeed": 5000,
  "avgWeight": 450,
  "entries": 45
}
```

---

### **HEALTH**

#### بررسی API
```
GET /api/health
```

---

## 📦 ساختار داده

### Period
```javascript
{
  id: "p_1234567890",
  code: "D-ABCD",
  name: "دوره شمالی 1405",
  breed: "یزدی",
  count: 10000,
  date: "1405/02/30",
  initW: 42,
  hallCounts: [1000, 2000, ...],
  activeHalls: 6,
  createdAt: "2025-06-17T..."
}
```

### Entry
```javascript
{
  id: "e_1234567890",
  periodId: "p_...",
  type: "mortality|weight|feed|medicine",
  date: "1405/03/05",
  hall: 1,
  count: 50,
  weight: 450,
  feed: 500,
  medicine: "آنتی‌بیوتیک",
  note: "توضیحات",
  createdAt: "2025-06-17T..."
}
```

---

## 🔌 اتصال به اپ‌های قدیمی

### مثال برای جایگزین کردن Supabase:

```javascript
// Old way
const r = await fetch(`${CF_URL}/rest/v1/...`);

// New way
const r = await fetch(`https://morghdari-405.liara.run/api/entries`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(entry)
});
```

---

## 🚀 Deploy روی Liara

1. **Repository** رو روی GitHub آپلود کنید
2. **Liara Dashboard** → New App → Node.js
3. **GitHub repo** رو متصل کنید: `hbagheri52/Morghdari-405`
4. **Deploy!**

سرویس خودکار از `main` branch deploy می‌شود.

---

## 📊 نکات مهم

- ✅ **بدون VPN** - داخل ایران قابل دسترسی
- ✅ **JSON File** - بدون نیاز به Database
- ✅ **CORS فعال** - اپ‌های قدیمی می‌تونند استفاده کنند
- ✅ **آسان** - فقط Node.js

---

## 📝 مثال استفاده

### JavaScript
```javascript
// ثبت تلفات
const response = await fetch('https://api.morghdari.ir/api/entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    periodId: 'p_1234',
    type: 'mortality',
    date: '1405/03/05',
    hall: 1,
    count: 50
  })
});

const result = await response.json();
console.log(result.message); // "رکورد ثبت شد"
```

---

## 🐛 مشکلات؟

- API Health: `GET /api/health`
- لاگ‌ها روی Liara Dashboard
- GitHub Issues

---

## 📄 License

MIT

**نویسنده:** hbagheri52
