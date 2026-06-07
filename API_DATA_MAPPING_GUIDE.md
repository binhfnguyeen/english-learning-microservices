# API Data Mapping Guide - Frontend Display

## Overview
Hướng dẫn chi tiết về cách dữ liệu từ Backend API được ánh xạ đến Frontend UI.

---

## 1. HOME PAGE (`/`)

### API Call
```typescript
GET /api/topics?page=0&size=5
```

### Response Structure
```json
{
  "code": 1000,
  "result": {
    "content": [
      { "id": 1, "name": "Topic 1", "description": "...", "totalVocabs": 5 },
      { "id": 2, "name": "Topic 2", "description": "...", "totalVocabs": 8 }
    ],
    "totalElements": 2,
    "last": true
  }
}
```

### Frontend Data Extraction
```typescript
const response = await authApis.get(`${endpoints.topics}?page=0&size=5`);
const topics = response.data.result.content;  // ✅ Get content array

// Map to LearningTopic structure
type TopicDto = {
  id: number;
  name: string;
  description?: string;
  totalVocabs?: number;
};

type LearningTopic = {
  id: string;
  name: string;
  color: string;
  lessons: LearningLesson[];
};
```

### UI Display Path
1. Home page fetches topics from `/api/topics`
2. Maps each topic to `LearningTopic` with lessons
3. Renders via `LearningPath` component with colored sections
4. Each lesson links to `/lesson/{lessonId}`

---

## 2. PROFILE PAGE (`/(auth)/profile`)

### API Calls
```typescript
// Get user profile
GET /api/secure/profile

// Get progress overview
GET /api/progress/{userId}/overview
```

### Response Structures

#### Profile Response
```json
{
  "code": 1000,
  "result": {
    "id": 1,
    "firstName": "Minh",
    "lastName": "Anh",
    "email": "user@example.com",
    "phone": "0123456789",
    "avatar": "https://...",
    "username": "minh_anh",
    "isActive": true,
    "role": "USER"
  }
}
```

#### Progress Overview Response
```json
{
  "code": 1000,
  "result": {
    "user": { /* user info */ },
    "daysStudied": 5,
    "wordsLearned": 25,
    "xp": 150,
    "cefr": "A1",
    "proficiency": "Beginner"
  }
}
```

### Frontend Data Extraction
```typescript
// In ClientRightPanel
const user = context?.user;
const response = await authApis.get(endpoints.progress(user.id));
const progress = response.data.result;

// Display
daysStudied: progress.daysStudied
wordsLearned: progress.wordsLearned
xp: progress.xp
cefr: progress.cefr
```

---

## 3. TOPICS PAGE (`/topics`)

### API Call
```typescript
GET /api/topics?page=0&size=10&keyword=optional
```

### Response
```json
{
  "code": 1000,
  "result": {
    "content": [
      {
        "id": 1,
        "name": "Vocabulary",
        "description": "Basic words",
        "totalVocabs": 10
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "number": 0,
    "size": 10,
    "first": true,
    "last": false
  }
}
```

### Frontend Usage
```typescript
const res = await authApis.get(url);
const content = res.data.result.content || [];  // ✅ Get content
setHasMore(!res.data.result.last);              // ✅ Check if more pages exist

if (page === 0) {
  setTopics(content);
} else {
  setTopics(prev => [...prev, ...content]);     // ✅ Infinite scroll
}
```

---

## 4. RIGHT SIDEBAR STATS (`ClientRightPanel`)

### Components
- ✅ Flame icon with `daysStudied`
- ✅ BookText icon with `wordsLearned`
- ✅ Target icon with daily goal progress
- ✅ Bot icon for AI Assistant

### Data Flow
```
User ID (from Context)
    ↓
API: /api/progress/{userId}/overview
    ↓
ProgressOverviewDto {
  daysStudied: 5,
  wordsLearned: 25,
  xp: 150,
  cefr: "A1",
  proficiency: "Beginner"
}
    ↓
Display in cards with icons
```

---

## 5. LEFT SIDEBAR NAVIGATION

### Routes (FIXED in recent commit)
| Label | href | Component |
|-------|------|-----------|
| 🎓 Học tập | `/topics` | Topics page |
| 🏆 Bảng xếp hạng | `/tests` | Tests page |
| 📖 Từ điển | `/conservation` | Chat/Conservation page |
| 👤 Hồ sơ | `/profile` or `/login` | Profile page |

### Issue Fixed
- ✅ "Từ điển" was pointing to `/topics` (same as "Học tập")
- ✅ Changed to `/conservation` (chat page with AI assistant)

---

## 6. TESTS PAGE (`/tests`)

### API Call
```typescript
GET /api/tests?page=0&size=10
```

### Response
```json
{
  "code": 1000,
  "result": {
    "content": [
      {
        "id": 1,
        "title": "Test 1",
        "description": "English vocabulary",
        "difficultyLevel": "EASY",
        "topic": { "id": 1, "name": "Topic" },
        "questions": [...]
      }
    ],
    "totalElements": 20,
    "last": false
  }
}
```

---

## 7. LEARNED WORDS (Dictionary History)

### API Calls
```typescript
// Get learned words for user
GET /api/learned-words/{userId}

// Add learned word
POST /api/learned-words
{ "vocabularyId": 1, "userId": 123 }
```

### Response
```json
{
  "code": 1000,
  "result": [
    {
      "id": 1,
      "userId": 123,
      "vocabulary": {
        "id": 10,
        "word": "abandon",
        "meaning": "to leave",
        "partOfSpeech": "verb"
      },
      "learnedDate": "2024-01-15T10:00:00"
    }
  ]
}
```

---

## Common Data Access Patterns

### ✅ Correct Patterns

**Single Object:**
```typescript
const data = response.data.result;
const id = data.id;
const name = data.name;
```

**Paginated List:**
```typescript
const items = response.data.result.content;      // ✅ Array
const hasMore = !response.data.result.last;      // ✅ Boolean
const total = response.data.result.totalElements; // ✅ Number
```

**Simple List (non-paginated):**
```typescript
const items = response.data.result;  // Direct array
```

### ❌ Common Mistakes

```typescript
// ❌ WRONG: Missing .content for paginated response
const items = response.data.result;  // Gets page object, not items!

// ❌ WRONG: Accessing undefined fields
const name = response.data.name;  // No name at this level

// ❌ WRONG: Not checking for null/empty
if (!response.data) { }  // Already wrapped in try-catch
```

---

## Debugging API Issues

### Step 1: Check Network Tab
1. Open Browser DevTools → Network
2. Look for API calls
3. Check response in format:
   ```json
   {
     "code": 1000,
     "result": { ... }  // ← Your data is here
   }
   ```

### Step 2: Console Logging
```typescript
const response = await authApis.get(url);
console.log("Full response:", response);
console.log("Data:", response.data);
console.log("Result:", response.data.result);
console.log("Content:", response.data.result.content);  // If paginated
```

### Step 3: Check Component State
```typescript
// Before rendering
console.log("Topics:", topics);
console.log("Loading:", loading);
console.log("Error:", error);
```

---

## Integration Checklist

When adding new API endpoints:

- [ ] Verify response structure: `{ code: 1000, result: T }`
- [ ] Check if paginated: extract from `.content`
- [ ] Check if single object: use directly
- [ ] Check if array: use directly
- [ ] Add error handling: `try-catch` with `setError()`
- [ ] Add loading state: `setLoading(true/false)`
- [ ] Test with actual API response format
- [ ] Verify TypeScript types match API response

---

## Files to Reference

- **Endpoints:** `src/configs/Endpoints.ts` - All API routes
- **API Client:** `src/configs/AuthApis.ts` - Axios with auth
- **Types:** Check each page component for `interface` definitions
- **Context:** `src/configs/UserContext.ts` - User/auth state

---

## Summary Table

| Page | Endpoint | Response Type | Access Path | Data Used |
|------|----------|---------------|-------------|-----------|
| Home | `/topics?page=0&size=5` | Paginated | `.result.content` | Topics list |
| Topics | `/topics?page=0&size=10` | Paginated | `.result.content` | Topics for sidebar |
| Profile | `/secure/profile` | Single | `.result` | User info |
| Progress | `/progress/{uid}/overview` | Single | `.result` | Stats display |
| Tests | `/tests?page=0` | Paginated | `.result.content` | Tests list |
| Learned Words | `/learned-words/{uid}` | Array | `.result` | Word history |

