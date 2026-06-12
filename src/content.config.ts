import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tag: z.string(),
    description: z.string(),
    lede: z.string(),
    dateLabel: z.string(),
    stack: z.string(),
    version: z.string(),
    licence: z.string(),
    github: z.url(),
    install: z.string(),
    relatedNote: reference('notes').optional(),
    order: z.number().optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    readingTime: z.string(),
    wordCount: z.string().optional(),
    excerpt: z.string(),
    relatedProject: reference('projects').optional(),
  }),
});

export const collections = { projects, notes };
