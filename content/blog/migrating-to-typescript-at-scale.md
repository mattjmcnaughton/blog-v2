---
title: "Migrating to TypeScript at Scale"
date: "2021-07-22"
description: "Lessons learned from migrating a large JavaScript codebase to TypeScript incrementally."
tags: ["typescript", "javascript", "migration", "engineering"]
---

Last year, our team completed a multi-month migration of our main application from JavaScript to TypeScript. Here's what we learned about doing this at scale without stopping feature development.

## The Strategy: Incremental Migration

We rejected the "big bang" rewrite approach. Instead, we configured TypeScript to allow gradual adoption:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "strict": false,
    "noImplicitAny": false,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

This let us mix `.js` and `.ts` files, converting one file at a time.

## The Migration Order

We found the most effective order was bottom-up:

1. **Shared utilities and types** - Define interfaces for core domain objects
2. **API layer** - Type your API responses
3. **Data layer** - Repositories, stores, and data transformations
4. **Components** - UI components, starting with leaf nodes

```typescript
// Step 1: Define core types
interface Patient {
  id: string;
  name: string;
  dateOfBirth: Date;
  diagnoses: Diagnosis[];
}

// Step 2: Type API responses
async function fetchPatient(id: string): Promise<Patient> {
  const response = await api.get(`/patients/${id}`);
  return response.data as Patient;
}

// Step 3: Type data layer
class PatientRepository {
  async findById(id: string): Promise<Patient | null> {
    // Implementation
  }
}
```

## Handling the Hard Parts

**Third-party libraries without types:**

```typescript
// Create a declarations file: types/legacy-lib.d.ts
declare module "legacy-lib" {
  export function doSomething(input: unknown): unknown;
}
```

**Gradually enabling strict mode:**

We created a "strict files" list that grew over time:

```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "src/core/types.ts",
    "src/core/utils.ts"
    // Add files as they're migrated
  ]
}
```

## Results

After six months:

- **100%** of files converted to TypeScript
- **40%** reduction in runtime type errors in production
- **Significantly improved** IDE experience and developer productivity
- **Zero** feature development delays

The key was treating migration as a background task, not a blocking project. Every PR that touched a JS file converted it to TS. This distributed the work and kept momentum.
