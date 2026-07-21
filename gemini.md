# ResumeSummary AI

> Central project documentation for AI assistants and contributors.

---

# Project Overview

## Product

ResumeSummary AI

## Description

ResumeSummary AI is an AI-powered web application that helps users generate recruiter-ready professional resume summaries from their existing resumes.

Users upload a PDF or DOCX resume, and the application extracts relevant information such as experience, skills, projects, education, and achievements to generate high-quality professional summaries optimized for recruiters and ATS systems.

This project is **NOT** a resume builder.

Its primary objective is to become the best AI Resume Summary Generator.

---

# Goals

The application should be

- Fast
- Modern
- Minimal
- Responsive
- Accessible
- AI-first
- Production Ready

Every feature should improve the user experience without adding unnecessary complexity.

---

# Tech Stack

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Hook Form
- Zod
- Lucide React

---

## Backend

Next.js Route Handlers

No separate Express backend unless future scaling requires it.

---

## AI

Provider should be abstracted.

Examples

- OpenAI
- Gemini
- Claude

AI implementation should never be tightly coupled with UI components.

---

## Resume Parsing

PDF

- pdf-parse

DOCX

- mammoth

---

## Database

PostgreSQL

ORM

Prisma

---

## Authentication

Better Auth

---

## Storage

Cloudinary

or

Vercel Blob

Temporary storage only.

---

## Deployment

Frontend

Vercel

Database

Neon PostgreSQL

---

# Folder Structure

```
src/
│
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── sections/
│   ├── cards/
│   ├── upload/
│   └── summary/
│
├── features/
│
├── lib/
│
├── services/
│
├── hooks/
│
├── utils/
│
├── types/
│
├── constants/
│
└── styles/
```

---

# Development Principles

Always

- Build reusable components.
- Keep components small.
- Avoid duplicated code.
- Use composition over large components.
- Prefer server components whenever possible.
- Use client components only when interactivity is required.

---

# Design Philosophy

The website should feel like a premium AI SaaS.

Design keywords

- Premium
- Minimal
- Elegant
- Spacious
- Trustworthy
- Modern
- Clean

Avoid

- clutter
- unnecessary gradients
- oversized icons
- excessive animations

---

# UI Guidelines

Use

- rounded corners
- subtle shadows
- soft borders
- glassmorphism where appropriate
- generous whitespace
- smooth hover effects

Do not overdesign.

---

# Typography

Maintain a strong hierarchy.

Use

Large Hero

Section Heading

Subheading

Body

Caption

Avoid inconsistent font sizes.

---

# Color System

Dark-first UI

Background

Dark charcoal

Primary

Indigo

Purple

Accent

Blue

Success

Emerald

Text

White

Muted

Gray

---

# Icons

Use Lucide React only.

Do not mix icon libraries.

---

# Animations

Use Framer Motion.

Animations should feel

- smooth
- subtle
- premium

Avoid

- bouncing
- spinning
- distracting effects

Preferred animations

- Fade
- Slide
- Stagger
- Scale
- Hover Lift
- Blur Reveal

---

# Accessibility

Every page should include

Semantic HTML

Keyboard navigation

ARIA labels

Visible focus states

Sufficient color contrast

---

# Performance Rules

Never create unnecessary re-renders.

Lazy load heavy components.

Use dynamic imports where appropriate.

Optimize images.

Avoid large client bundles.

---

# State Management

Prefer

Server Components

Local State

Context

Introduce global state only when clearly justified.

Avoid unnecessary complexity.

---

# Forms

Use

React Hook Form

+

Zod validation

Never manage complex forms with useState alone.

---

# API Rules

Always

Validate inputs

Return typed responses

Handle errors gracefully

Never expose internal errors.

---

# Error Handling

Every API route should

Validate request

Handle exceptions

Return meaningful messages

Log unexpected errors

---

# Code Style

Use

TypeScript everywhere.

Never use

any

unless absolutely necessary.

Prefer

Interfaces

Meaningful variable names

Small functions

Readable code

---

# Component Rules

Every component should have a single responsibility.

Avoid components larger than ~250 lines when possible.

Split into reusable pieces.

---

# Naming Conventions

Components

PascalCase

Hooks

useSomething

Utilities

camelCase

Constants

UPPER_SNAKE_CASE

Files

kebab-case

---

# AI Architecture

Never call AI directly from UI components.

Preferred flow

UI

↓

Server Action / API Route

↓

AI Service

↓

Provider

↓

Response

This allows providers to be replaced without changing UI.

---

# Security

Never expose API keys.

Validate uploaded files.

Restrict upload size.

Sanitize extracted text.

Rate limit AI endpoints.

---

# Future Features

- LinkedIn About Generator
- Cover Letter Generator
- Resume Score
- ATS Checker
- Grammar Improvements
- Interview Introduction
- Bio Generator
- Version History
- Summary Templates
- Career-specific summaries

---

# Things AI Should Never Do

Do not install unnecessary packages.

Do not change project architecture without approval.

Do not introduce multiple styling systems.

Do not duplicate components.

Do not ignore TypeScript errors.

Do not use inline styles unless necessary.

Do not create monolithic files.

---

# AI Assistant Rules

When implementing new features

1. Reuse existing components first.

2. Maintain design consistency.

3. Follow the existing folder structure.

4. Prefer composition.

5. Keep code readable.

6. Use proper TypeScript types.

7. Add loading and empty states.

8. Add proper error handling.

9. Make every component responsive.

10. Maintain accessibility.

---

# Definition of Done

A feature is complete only if

✅ Responsive

✅ Accessible

✅ Type-safe

✅ Reusable

✅ Production Ready

✅ No console errors

✅ No TypeScript errors

✅ No ESLint warnings

✅ Mobile optimized

✅ Dark mode compatible

✅ Matches the existing design system

---

# Vision

ResumeSummary AI should become the simplest and highest-quality AI tool for generating professional resume summaries.

Every design and engineering decision should support one goal:

**Help users create recruiter-ready summaries in under 30 seconds through an elegant, fast, and trustworthy experience.**