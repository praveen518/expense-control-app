# ExpenseControlApp

A React Native mobile application for personal expense tracking and budget management using a "pocket-based" budgeting system.

## 📱 Overview

**ExpenseControlApp** helps users manage their finances by:
- Creating **pockets** (budget categories) with allocated amounts
- Tracking **expenses** within each pocket
- Monitoring **income** and **balance**
- Viewing monthly summaries and insights on a **dashboard**
- Managing **salary** and other settings

The app uses **local-first architecture** with SQLite for persistent storage and in-memory stores for reactive UI updates.

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  (React Native Screens + Components)                         │
│  - DashboardScreen, PocketsScreen, ProfileScreen, etc.      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ useSyncExternalStore
                     │ (reactive subscriptions)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Store Layer                              │
│  (In-Memory State + Business Logic)                         │
│  - ExpenseStore, PocketStore, IncomeStore, BalanceStore     │
│  - settingsStore (salary, etc.)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Direct calls (adapters)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Adapter Layer                             │
│  (Database Abstraction)                                      │
│  - expense.adapter.ts, pocket.adapter.ts, income.adapter.ts│
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL queries
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  - SQLite (react-native-quick-sqlite)                        │
│  - AsyncStorage (for settings & balance)                    │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **UI Never Touches Database Directly**
   - Screens only interact with **stores** via `useSyncExternalStore`
   - Stores handle all database operations through **adapters**

2. **Stores Are Single Source of Truth**
   - Stores hold in-memory state (Map/Array)
   - Stores expose **selectors** (computed values) and **mutations** (write operations)
   - Stores notify subscribers when state changes

3. **Adapters Are Thin Database Wrappers**
   - Adapters only execute SQL queries
   - No business logic, no validation
   - Return raw data structures

4. **Actions Coordinate Multiple Stores**
   - Some operations affect multiple stores (e.g., adding expense updates ExpenseStore + BalanceStore)
   - **Action functions** (e.g., `addExpenseWithBalance`) coordinate these updates

---

## 📂 Project Structure

```
src/
├── app/
│   └── App.tsx                    # Bootstrap: DB init, migrations, store hydration
├── components/                    # Reusable UI components
│   ├── AddExpenseModal.tsx
│   ├── AppHeader.tsx
│   ├── dashboard/                 # Dashboard-specific components
│   └── UndoDeleteBanner.tsx
├── db/                            # Database layer
│   ├── db.ts                      # DB connection
│   ├── schema.ts                  # Table schemas
│   ├── migrations.ts              # Versioned migrations
│   ├── expense.adapter.ts        # Expense CRUD operations
│   ├── pocket.adapter.ts         # Pocket CRUD operations
│   └── income.adapter.ts         # Income CRUD operations
├── store/                         # State management
│   ├── expense/
│   │   ├── ExpenseStore.ts       # Expense state + selectors
│   │   ├── expenseStore.instance.ts
│   │   └── expense.actions.ts   # Coordinated expense + balance updates
│   ├── pocket/
│   │   ├── PocketStore.ts
│   │   └── pocketStore.instance.ts
│   ├── income/
│   │   ├── incomeStore.ts
│   │   ├── incomeStore.instance.ts
│   │   └── income.actions.ts
│   ├── balance/
│   │   ├── balanceStore.ts       # Overall balance (AsyncStorage)
│   │   ├── balanceStore.instance.ts
│   │   └── balance.types.ts
│   └── settingsStore.ts          # Salary & settings (AsyncStorage)
├── screens/                       # Screen components
│   ├── DashboardScreen.tsx
│   ├── PocketsScreen.tsx
│   ├── PocketDetailsScreen.tsx
│   ├── ProfileScreen.tsx
│   └── ...
├── navigation/                    # Navigation setup
│   ├── AppNavigator.tsx          # Bottom tabs
│   ├── DashboardStack.tsx
│   ├── PocketsStack.tsx
│   └── ProfileStack.tsx
├── hooks/                         # Custom React hooks
│   ├── useSettings.ts            # useSalary() hook
│   └── usePockets.ts
├── types/                         # TypeScript types
│   ├── expense.ts
│   ├── pocket.ts
│   └── income.ts
├── utils/                         # Utility functions
│   ├── currency.ts               # formatINR()
│   ├── month.ts                  # Month helpers
│   └── ...
└── finance/                       # Finance calculations
    ├── financeSummary.ts
    └── ensureSalaryIncome.ts
```

---

## 🔄 Data Flow

### 1. **Reading Data (UI → Store → Adapter → DB)**

**Example: Dashboard displaying expenses**

```
DashboardScreen
  │
  │ useSyncExternalStore(expenseStore.subscribe, expenseStore.getDashboardSummary)
  │
  ▼
ExpenseStore.getDashboardSummary(month)
  │
  │ Reads from: this.expenses (Map<string, Expense>)
  │ Computes: totalSpent, daysRemaining
  │
  ▼
Returns computed value → UI re-renders
```

**Code Example:**

```tsx
// DashboardScreen.tsx
const expenseSummary = useSyncExternalStore(
  expenseStore.subscribe.bind(expenseStore),
  () => expenseStore.getDashboardSummary(month)
);

// expenseSummary = { totalSpent: 5000, daysRemaining: 15 }
```

**What's exposed to screens:**
- ✅ **Selectors**: `getDashboardSummary()`, `getExpensesForMonth()`, `getPocketSummaryForMonth()`
- ✅ **Subscription**: `store.subscribe()` for reactive updates
- ❌ **NOT exposed**: Direct database access, internal Maps, raw SQL queries

---

### 2. **Writing Data (UI → Action/Store → Adapter → DB)**

**Example: Adding an expense**

```
PocketDetailsScreen
  │
  │ User fills AddExpenseModal, clicks "Save"
  │
  │ onSubmit={(expense) => expenseStore.addExpense(expense)}
  │
  ▼
ExpenseStore.addExpense(expense)
  │
  │ 1. Validates expense (invariant checks)
  │ 2. Calls: insertExpenseRow(expense) → SQLite INSERT
  │ 3. Updates: this.expenses.set(expense.id, expense)
  │ 4. Updates: balanceStore (via internal call)
  │ 5. Bumps version, clears memo cache
  │ 6. Emits to subscribers → UI re-renders
  │
  ▼
expense.adapter.ts → insertExpenseRow()
  │
  │ QuickSQLite.execute(DB_NAME, "INSERT INTO expenses ...")
  │
  ▼
SQLite Database (persisted)
```

**Code Example:**

```tsx
// PocketDetailsScreen.tsx
<AddExpenseModal
  onSubmit={(expense) => expenseStore.addExpense(expense)}
/>

// ExpenseStore.ts
addExpense(expense: Expense) {
  invariant(expense.id, 'Expense must have id');
  insertExpenseRow(expense);  // ← Adapter call
  this.expenses.set(expense.id, expense);
  balanceStore.onExpenseAdded(expense.amount);  // ← Side effect
  this.bumpVersion();
  this.emit();  // ← Notify subscribers
}
```

**What screens can do:**
- ✅ Call **store mutations**: `expenseStore.addExpense()`, `pocketStore.addPocket()`
- ✅ Call **action functions**: `addExpenseWithBalance()` (coordinates multiple stores)
- ❌ **NOT allowed**: Direct adapter calls, direct SQL queries, direct AsyncStorage access

---

### 3. **Coordinated Updates (Multiple Stores)**

**Example: Adding expense with balance update**

Some operations affect multiple stores. Use **action functions** to coordinate:

```tsx
// expense.actions.ts
export function addExpenseWithBalance(expense: Expense) {
  expenseStore.addExpense(expense);
  balanceStore.applyDebit(Math.abs(expense.amount), 'expense:add');
}

// UI calls:
addExpenseWithBalance(expense);  // Updates both stores atomically
```

**Why actions exist:**
- Ensures **atomic updates** (both stores update together)
- Prevents **inconsistencies** (e.g., expense added but balance not updated)
- Centralizes **business logic** (e.g., "expense = negative, balance decreases")

---

## 🗄️ Database Schema

### Tables

**`expenses`**
```sql
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  pocketId TEXT NOT NULL,
  amount INTEGER NOT NULL,        -- Signed: negative = expense, positive = income
  month TEXT NOT NULL,            -- YYYY-MM format
  date INTEGER,                   -- Epoch timestamp
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER,
  deletedAt INTEGER,
  isDeleted INTEGER DEFAULT 0,    -- Soft delete flag
  note TEXT
);
```

**`pockets`**
```sql
CREATE TABLE pockets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  allocated INTEGER NOT NULL,     -- Monthly allocation
  createdAt TEXT NOT NULL
);
```

**`income`**
```sql
CREATE TABLE income (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,           -- Always positive
  source TEXT NOT NULL,           -- "Salary", "Gift", "Bonus", etc.
  month TEXT NOT NULL,            -- YYYY-MM
  date INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER,
  isDeleted INTEGER DEFAULT 0,
  deletedAt INTEGER
);
```

### Storage (AsyncStorage)

- **`settings.salary`**: Monthly salary (number)
- **`balance.current`**: Overall balance (number)

---

## 🔄 App Bootstrap Flow

**On app start (`App.tsx`):**

```
1. loadSettings()
   └─> AsyncStorage.getItem('settings.salary')
   └─> Sets in-memory salary

2. openDB()
   └─> QuickSQLite.open('expenses.db')

3. runMigrations()
   └─> Checks PRAGMA user_version
   └─> Runs migrations v0→v1, v1→v2, v2→v3, etc.

4. expenseStore.hydrateFromSQLite()
   └─> selectAllExpensesRaw() → SQLite SELECT
   └─> Loads all expenses into this.expenses Map
   └─> Emits to subscribers

5. pocketStore.hydrateFromSQLite()
   └─> getPockets() → SQLite SELECT
   └─> Loads all pockets into this.pockets Map
   └─> Emits to subscribers

6. incomeStore.hydrateFromSQLite()
   └─> selectAllIncomeRaw() → SQLite SELECT
   └─> Loads all income into this.income Map
   └─> Emits to subscribers

7. balanceStore.hydrate()
   └─> AsyncStorage.getItem('balance.current')
   └─> Sets this.balance
   └─> Emits to subscribers

8. setReady(true) → UI renders
```

**Code:**

```tsx
// App.tsx
useEffect(() => {
  async function bootstrap() {
    await loadSettings();
    openDB();
    await runMigrations();
    expenseStore.hydrateFromSQLite();
    pocketStore.hydrateFromSQLite();
    incomeStore.hydrateFromSQLite();
    await balanceStore.hydrate();
    setReady(true);
  }
  bootstrap();
}, []);
```

---

## 📊 Store Patterns

### Store Structure

Every store follows this pattern:

```tsx
export class ExpenseStore {
  // 1. State
  private expenses = new Map<string, Expense>();
  private listeners = new Set<() => void>();
  private snapshot: Expense[] = [];

  // 2. Subscription (React integration)
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.snapshot = Array.from(this.expenses.values());
    for (const l of this.listeners) l();
  }

  getSnapshot() {
    return this.snapshot;
  }

  // 3. Hydration (load from DB)
  hydrateFromSQLite() {
    const rows = selectAllExpensesRaw();
    this.expenses.clear();
    for (const e of rows) {
      this.expenses.set(e.id, e);
    }
    this.emit();
  }

  // 4. Selectors (read operations)
  getDashboardSummary(month: string) {
    // Compute from this.expenses
    return { totalSpent, daysRemaining };
  }

  // 5. Mutations (write operations)
  addExpense(expense: Expense) {
    insertExpenseRow(expense);  // ← Adapter
    this.expenses.set(expense.id, expense);
    this.emit();
  }
}
```

### Memoization

Stores use **version-based memoization** to cache selector results:

```tsx
private version = 0;
private selectorCache = new Map<string, { version: number; value: any }>();

private memo<T>(key: string, compute: () => T): T {
  const cached = this.selectorCache.get(key);
  if (cached && cached.version === this.version) {
    return cached.value;  // ← Return cached
  }
  const value = compute();
  this.selectorCache.set(key, { version: this.version, value });
  return value;
}

// On mutation:
private bumpVersion() {
  this.version++;
  this.selectorCache.clear();  // ← Invalidate cache
}
```

**Why:** Prevents recomputing expensive selectors on every read. Cache invalidates when data changes.

---

## 🎯 Complete Workflow Examples

### Workflow 1: Adding an Expense

**Step-by-step:**

1. **User opens Pocket Details screen**
   ```tsx
   // PocketDetailsScreen.tsx
   const pocketSummary = useSyncExternalStore(
     pocketStore.subscribe.bind(pocketStore),
     () => pocketStore.getPocketSummaryForMonth(pocketId, currentMonth)
   );
   ```
   - Screen subscribes to `pocketStore`
   - Gets pocket summary (allocated, spent, remaining)

2. **User taps "+" button, opens AddExpenseModal**
   ```tsx
   <AddExpenseModal
     visible={addOpen}
     pocketId={pocketId}
     month={currentMonth}
     onSubmit={(expense) => expenseStore.addExpense(expense)}
   />
   ```

3. **User enters amount (e.g., 500), clicks "Save"**
   ```tsx
   // AddExpenseModal.tsx
   const expense: Expense = {
     id: Date.now().toString(),
     pocketId: 'pocket-123',
     amount: -500,  // ← Negative for expense
     month: '2024-01',
     date: Date.now(),
     createdAt: Date.now(),
     isDeleted: false,
     note: 'Lunch'
   };
   onSubmit(expense);
   ```

4. **ExpenseStore.addExpense() is called**
   ```tsx
   // ExpenseStore.ts
   addExpense(expense: Expense) {
     // Validation
     invariant(expense.id, 'Expense must have id');
     
     // Write to DB
     insertExpenseRow(expense);  // ← SQLite INSERT
     
     // Update in-memory state
     this.expenses.set(expense.id, expense);
     
     // Update balance (side effect)
     balanceStore.onExpenseAdded(expense.amount);  // ← Balance decreases
     
     // Invalidate cache, notify subscribers
     this.bumpVersion();
     this.emit();  // ← All subscribed screens re-render
   }
   ```

5. **Adapter executes SQL**
   ```tsx
   // expense.adapter.ts
   export const insertExpenseRow = (expense: Expense) => {
     QuickSQLite.execute(DB_NAME, `
       INSERT INTO expenses (id, pocketId, amount, month, ...)
       VALUES (?, ?, ?, ?, ...)
     `, [expense.id, expense.pocketId, expense.amount, ...]);
   };
   ```

6. **UI automatically updates**
   - `PocketDetailsScreen` re-renders (expense appears in list)
   - `DashboardScreen` re-renders (totalSpent increases, balance decreases)
   - `PocketsScreen` re-renders (remaining budget decreases)

**Data flow:**
```
UI → ExpenseStore.addExpense() → expense.adapter.insertExpenseRow() → SQLite
                                 ↓
                            balanceStore.onExpenseAdded() → AsyncStorage
                                 ↓
                            emit() → All subscribed screens re-render
```

---

### Workflow 2: Viewing Dashboard

**Step-by-step:**

1. **App starts, stores hydrate**
   ```tsx
   // App.tsx bootstrap
   expenseStore.hydrateFromSQLite();  // Loads all expenses from SQLite
   pocketStore.hydrateFromSQLite();  // Loads all pockets from SQLite
   balanceStore.hydrate();            // Loads balance from AsyncStorage
   ```

2. **DashboardScreen mounts**
   ```tsx
   // DashboardScreen.tsx
   const expenseSummary = useSyncExternalStore(
     expenseStore.subscribe.bind(expenseStore),
     () => expenseStore.getDashboardSummary(month)
   );
   
   const balance = useSyncExternalStore(
     balanceStore.subscribe.bind(balanceStore),
     balanceStore.getSnapshot.bind(balanceStore)
   );
   ```

3. **Selectors compute values**
   ```tsx
   // ExpenseStore.getDashboardSummary('2024-01')
   // Iterates through this.expenses Map
   // Filters by month='2024-01' and !isDeleted
   // Sums negative amounts → totalSpent = 5000
   // Calculates days remaining → daysRemaining = 15
   ```

4. **UI renders**
   ```tsx
   <Text>Overall Balance: {formatINR(balance)}</Text>
   <Text>Spent: {formatINR(expenseSummary.totalSpent)}</Text>
   <Text>Remaining: {formatINR(totalIncome - totalSpent)}</Text>
   ```

5. **When data changes (e.g., expense added)**
   - `ExpenseStore.emit()` is called
   - `useSyncExternalStore` detects change
   - `getDashboardSummary()` recomputes (cache invalidated)
   - Component re-renders with new values

**Data flow:**
```
SQLite → ExpenseStore.hydrateFromSQLite() → this.expenses Map
                                              ↓
                                    getDashboardSummary() (selector)
                                              ↓
                                    useSyncExternalStore → UI
```

---

### Workflow 3: Setting Salary

**Step-by-step:**

1. **User navigates to Settings → Change Salary**
   ```tsx
   // ChangeSalaryScreen.tsx
   const salary = useSalary();  // ← useSyncExternalStore wrapper
   ```

2. **User enters new salary (e.g., 50000), clicks "Save"**
   ```tsx
   await setSalary(50000);
   ```

3. **settingsStore.setSalary() updates salary and balance**
   ```tsx
   // settingsStore.ts
   export async function setSalary(value: number) {
     const previousSalary = salary;
     salary = value;
     await AsyncStorage.setItem('settings.salary', String(value));
     emit();  // ← Notify subscribers
     
     // Update balance by delta
     const delta = value - previousSalary;
     if (delta > 0) {
       await balanceStore.applyCredit(delta, 'salary:set');
     } else if (delta < 0) {
       await balanceStore.applyDebit(Math.abs(delta), 'salary:set');
     }
   }
   ```

4. **BalanceStore updates**
   ```tsx
   // balanceStore.ts
   async applyCredit(amount: number, reason: BalanceMutationReason) {
     this.balance += amount;
     await AsyncStorage.setItem('balance.current', String(this.balance));
     this.emit();  // ← Dashboard re-renders
   }
   ```

5. **Dashboard automatically updates**
   - `useSyncExternalStore` detects balance change
   - "Overall Balance" displays new value


✨ Recent Work & UX / Architecture Enhancements

This section documents recent improvements focused on UX polish, theming, and privacy, without changing the core data model or store architecture.

🎨 App-wide Theming (Light / Dark / System)

Introduced a central theme system with support for:

light

dark

system (follows OS preference)

Theme mode is persisted using AsyncStorage

Implemented a dedicated themeStore with:

in-memory state

subscribe() API

useSyncExternalStore integration for reactive UI updates

All screens re-render automatically on theme change without modifying each screen manually, by:

centralizing colors

subscribing once per screen using useThemeMode()

Key characteristics:

Works with React Native New Architecture (Fabric)

No Expo dependencies

No LayoutAnimation usage (avoids Fabric warnings)

No performance-heavy re-render chains

🧠 Store-driven Theme Propagation

Screens explicitly do not manage theme state locally

Theme changes propagate through:

themeStore → useSyncExternalStore → re-render


Prevents prop-drilling and keeps screens declarative

Enables instant, app-wide visual updates

🔐 Privacy Feature: Hide / Show Sensitive Amounts

Implemented a privacy-first UX pattern commonly found in banking apps.

Behavior

Sensitive monetary values can be hidden using masking (₹•••••)

Toggle is persisted across app restarts

Visibility applies to:

Dashboard

Profile

Does not affect:

Pocket detail screens

Expense lists

Progress bars or percentages

Implementation

Introduced a privacyStore:

Boolean flag: isBalanceVisible

Persisted in AsyncStorage

Exposed via useBalanceVisibility() hook

Central formatter:

formatHiddenAmount(value, isVisible)


Avoids conditional JSX duplication

Maintains layout stability when toggling visibility

📊 Dashboard UX Improvements

Several focused UX upgrades were made to improve readability and scalability:

1. Overall Balance Card

Clean separation between:

label

value

Hide/Show toggle placed next to the amount, not the label

Prevents accidental disclosure in public environments

2. “Where Your Money Goes” Section

Introduced Top Usage Pockets logic:

Sorts pockets by percentage of budget spent

Displays top N pockets (default: 3)

Added “View all pockets →” CTA when more pockets exist

Avoids long vertical scrolling as pocket count grows

3. Pocket Progress Summary Mode

Reused PocketProgressList component with:

mode="summary"

maxItems

Single component supports:

dashboard summary

full pockets screen

Keeps UI DRY and consistent

👤 Profile Screen UX Restructure

Refactored Profile screen to clarify responsibilities without adding new features.

New Structure

Header

Context-setting (“Manage your money setup”)

Monthly Setup Card

Salary

Allocated vs remaining

Inline CTA when salary is missing

Quick Actions

Add Income

Recently Deleted

App Settings

Settings navigation separated visually

Improvements

Clear visual hierarchy

Reduced cognitive load

Better separation of financial info vs app controls

Profile screen now acts as a setup & control hub, not an analytics page

🧩 UX Polishing Principles Followed

No layout shifts on state changes

No duplicated sources of truth

No screen-specific business logic

No direct access to AsyncStorage or DB from UI

All new features respect existing:

store patterns

subscription model

selector-based computation

🏁 Summary of Recent Additions
Area	Improvement
Theming	Light / Dark / System with central store
Privacy	Hide/show sensitive amounts
Dashboard	Scalable pocket summary UX
Profile	Clear structure & hierarchy
Architecture	Zero violation of store → UI contract



**Data flow:**
```
UI → settingsStore.setSalary() → AsyncStorage (salary)
                                ↓
                          balanceStore.applyCredit() → AsyncStorage (balance)
                                ↓
                          emit() → Dashboard re-renders
```

---

## 🚫 What Screens Should NOT Do

**❌ Direct database access:**
```tsx
// DON'T DO THIS
import { QuickSQLite } from 'react-native-quick-sqlite';
QuickSQLite.execute(DB_NAME, 'SELECT * FROM expenses');
```

**❌ Direct adapter calls:**
```tsx
// DON'T DO THIS
import { insertExpenseRow } from '../db/expense.adapter';
insertExpenseRow(expense);  // ← Bypasses store, breaks reactivity
```

**❌ Direct AsyncStorage access:**
```tsx
// DON'T DO THIS
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('balance.current', '1000');
```

**✅ DO THIS INSTEAD:**
```tsx
// Use stores
expenseStore.addExpense(expense);
balanceStore.setOpeningBalance(1000);
setSalary(50000);
```

---

## 🔧 Key Concepts

### 1. **Soft Delete**

Expenses and income are **soft deleted** (marked `isDeleted = true`) instead of hard deleted:

- Allows **undo** within 5 seconds
- Enables **"Recently Deleted"** screen
- **Cleanup job** permanently deletes after 30 days

```tsx
// ExpenseStore.deleteExpense()
markExpenseDeleted(expenseId, Date.now());  // ← Soft delete
// ... 5 seconds later ...
permanentlyDeleteExpenseRow(expenseId);      // ← Hard delete (cleanup)
```

### 2. **Month-Based Filtering**

All expenses/income are tagged with `month: 'YYYY-MM'`:

- Allows **month navigation** (previous/next month)
- Enables **monthly summaries** (spent, remaining)
- **Denormalized** for performance (no date parsing needed)

### 3. **Signed Amounts**

Expenses use **negative amounts**, income uses **positive**:

```tsx
// Expense
{ amount: -500 }  // ← Spending 500

// Income
{ amount: 5000 }  // ← Receiving 5000
```

This allows **single table** for both expenses and income (legacy design).

### 4. **Balance Tracking**

**BalanceStore** maintains overall balance:

- Updated when expenses/income are added/removed
- Persisted in AsyncStorage (`balance.current`)
- Displayed as "Overall Balance" on dashboard

**Balance mutations:**
- `applyCredit(amount)` → Balance increases
- `applyDebit(amount)` → Balance decreases
- `setOpeningBalance(amount)` → Balance set directly

---

## 🧪 Testing

Run tests:
```bash
npm test
```

Test file: `__tests__/App.test.tsx`

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- React Native development environment
- Android Studio (for Android) or Xcode (for iOS)

### Installation

```bash
# Install dependencies
npm install

# iOS only: Install CocoaPods
cd ios && bundle exec pod install && cd ..
```

### Running

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## 📝 Development Guidelines

### Adding a New Screen

1. Create screen component in `src/screens/`
2. Add to appropriate stack in `src/navigation/`
3. Use `useSyncExternalStore` to subscribe to stores
4. Call store mutations (not adapters) for writes

### Adding a New Store

1. Create store class (follow `ExpenseStore` pattern)
2. Create instance file (`store.instance.ts`)
3. Add hydration in `App.tsx` bootstrap
4. Export selectors and mutations

### Adding a New Database Table

1. Add schema in `src/db/schema.ts` or migration
2. Create adapter file (`table.adapter.ts`)
3. Add migration in `src/db/migrations.ts`
4. Create store that uses adapter

---

## 🐛 Known Issues / Notes

- **ExpenseStore** calls `balanceStore.onExpenseAdded()` / `onExpenseRemoved()`, but these methods don't exist in BalanceStore. This may be incomplete implementation. Consider using `applyDebit` / `applyCredit` directly or via action functions.

---

## 📄 License

Private project.

---

## 👥 For New Developers

**Quick Start Checklist:**

1. ✅ Read this README (you're doing it!)
2. ✅ Understand the **3-layer architecture** (UI → Store → Adapter → DB)
3. ✅ Learn **store patterns** (subscribe, hydrate, selectors, mutations)
4. ✅ Review **workflow examples** above
5. ✅ Check `App.tsx` to see bootstrap flow
6. ✅ Look at `DashboardScreen.tsx` to see how screens consume stores
7. ✅ Look at `ExpenseStore.ts` to see store implementation
8. ✅ Look at `expense.adapter.ts` to see database layer

**Key Files to Understand:**

- `src/app/App.tsx` - Bootstrap
- `src/store/expense/ExpenseStore.ts` - Store pattern example
- `src/screens/DashboardScreen.tsx` - Screen pattern example
- `src/db/expense.adapter.ts` - Adapter pattern example

**Questions?** Check the code comments (they're detailed!) or review the workflow examples above.
