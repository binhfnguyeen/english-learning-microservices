# KIỂM TRA API & RESPONSE DATA - Quick Reference

## API Response Format (All APIs)
```
✅ ALWAYS: { code: 1000, result: YOUR_DATA }
```

---

## Data Access Rules

### 📌 Rule 1: Paginated Response (Most Common)
**When API has pagination: /api/topics?page=0&size=10**

```javascript
// Response:
{
  code: 1000,
  result: {
    content: [ /* YOUR ITEMS HERE */ ],
    totalElements: 100,
    last: false
  }
}

// ✅ CORRECT: Get items from .content
const items = response.data.result.content;

// ❌ WRONG: Direct access won't work
const items = response.data.result;  // This is the page object!
```

### 📌 Rule 2: Single Object
**When API returns one item: /api/progress/{userId}/overview**

```javascript
// Response:
{
  code: 1000,
  result: {
    daysStudied: 5,
    wordsLearned: 25,
    xp: 150
  }
}

// ✅ CORRECT: Use result directly
const data = response.data.result;
const days = data.daysStudied;

// ❌ WRONG: Don't access .content
const data = response.data.result.content;  // undefined!
```

### 📌 Rule 3: Array (Non-Paginated)
**When API returns array: /api/learned-words/{userId}**

```javascript
// Response:
{
  code: 1000,
  result: [ { id: 1, word: "..." }, { id: 2, word: "..." } ]
}

// ✅ CORRECT: Use result as array
const items = response.data.result;
const firstWord = items[0];

// ❌ WRONG: Don't access .content
const items = response.data.result.content;  // undefined!
```

---

## Current Pages & Their Data Sources

| Page | URL | API Endpoint | Data Type | Access |
|------|-----|--------------|-----------|--------|
| **Home** | `/` | `/api/topics?page=0&size=5` | ✅ Paginated | `.content` |
| **Topics** | `/topics` | `/api/topics?page=0&size=10` | ✅ Paginated | `.content` |
| **Tests** | `/tests` | `/api/tests?page=0` | ✅ Paginated | `.content` |
| **Sidebar Stats** | - | `/api/progress/{uid}/overview` | 🔵 Single | Direct |
| **Profile** | `/(auth)/profile` | `/api/secure/profile` | 🔵 Single | Direct |
| **Dictionary** | `/conservation` | `https://api.dictionaryapi.dev/...` | 🟣 External | Direct |

---

## Sidebar Navigation (FIXED)

| Menu Item | Link | Component |
|-----------|------|-----------|
| 🎓 **Học tập** | `/topics` | Topics Learning |
| 🏆 **Bảng xếp hạng** | `/tests` | Tests Page |
| 📖 **Từ điển** | `/conservation` | Chat with AI |
| 👤 **Hồ sơ** | `/profile` | Update Profile |

> ✅ Previously fixed: "Từ điển" was pointing to `/topics` (duplicate), now points to `/conservation` chat page.

---

## Right Sidebar Stats Display

```
GET /api/progress/{userId}/overview

Response: {
  code: 1000,
  result: {
    daysStudied: 5,         // Flame icon
    wordsLearned: 25,       // BookText icon
    xp: 150,                // Goal progress
    cefr: "A1",             // Level
    proficiency: "Beginner"
  }
}

Display:
┌─────────────────┐
│ Tiến độ (Trophy)│
├─────────────────┤
│ 🔥 5 ngày       │
│ 📚 25 từ        │
├─────────────────┤
│ Mục tiêu ngày   │
│ 150/20 XP ████▓ │
├─────────────────┤
│ Trình độ        │
│ A1 - Beginner   │
└─────────────────┘
```

---

## Testing Data Retrieval

### How to Check in Browser Console:

```javascript
// 1. Open DevTools (F12) → Console

// 2. Check network response
fetch('http://api-gateway:8080/api/topics?page=0&size=5', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(data => console.log(data))

// Output should be:
// {
//   code: 1000,
//   result: {
//     content: [ {...}, {...} ],  ← Items are here!
//     totalElements: 50,
//     last: false
//   }
// }

// 3. Extract topics correctly
const topics = data.result.content;  // ✅ Array of topics
console.log(topics);                 // Shows [ {id, name, ...}, ... ]
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| **Empty page** | Missing `.content` on paginated response | Use `.result.content` not `.result` |
| **Undefined data** | Wrong access path | Check API response structure |
| **Stats not showing** | Progress fetch fails silently | Check user ID being passed |
| **Layout shifts** | Data loads after render | Use mounted state check |

---

## Frontend File Locations

- **API Config:** `src/configs/Endpoints.ts`
- **API Client:** `src/configs/AuthApis.ts`
- **User Context:** `src/configs/UserContext.ts`
- **Home Page:** `src/app/(client)/page.tsx`
- **Topics Page:** `src/app/(client)/topics/page.tsx`
- **Tests Page:** `src/app/(client)/tests/page.tsx`
- **Sidebar:** `src/components/Sidebar/`
- **Right Panel:** `src/components/Sidebar/ClientRightPanel.tsx`

---

## Summary

```
All API responses follow: { code: 1000, result: DATA }

If endpoint has pagination (?page=...):
  → Use: response.data.result.content

If endpoint returns single object:
  → Use: response.data.result

If endpoint returns array (no pagination):
  → Use: response.data.result
```

🎯 **Remember:** Always access the correct path based on response type!
