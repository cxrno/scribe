import {uuid, point,pgTable, text, timestamp, json, pgEnum} from "drizzle-orm/pg-core";

export const mediaType = pgEnum('media_type', 
    ['picture', 'video', 'audio', 'sketch', 'document']);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    google_id: text('google_id').unique().notNull(),
    email: text('email').unique().notNull(),
    username: text('username').unique().notNull(),
    avatar_url: text('avatar_url').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const reports = pgTable('reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').references(() => users.id).notNull(),
    title: text('title'),
    description: text('description'),
    tags: text('tags').array(),
    location: point('location'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const attachments = pgTable('attachments', {
    id: uuid('id').primaryKey().defaultRandom(),
    report_id: uuid('report_id').references(() => reports.id).notNull(),
    media_type: mediaType('media_type').notNull(),
    title: text('title'),
    description: text('description'),
    media_url: text('media_url').notNull(),
    location: point('location'),
    metadata: json('metadata'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
})