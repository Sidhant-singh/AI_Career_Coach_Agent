import { integer, json, pgTable, varchar } from "drizzle-orm/pg-core";
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),

});

export const HistoryTable = pgTable("historyTable",{
    id : integer().primaryKey().generatedAlwaysAsIdentity(),
    recordId : varchar().notNull(),
    content : json(),
    userEmail : varchar('userEmail').references(() => usersTable.email).notNull(),
    createdAt: varchar(),
    aiAgentType : varchar(),
    metaData : varchar(),
    // New fields for enhanced interview features
    interviewType : varchar(), // 'technical' | 'culture-fit' | 'dsa'
    interviewDuration : integer(), // Duration in minutes
    domain : varchar(), // Interview domain/role
    pdfReportUrl : varchar(), // URL to generated PDF report
    pdfReportId : varchar(), // ImageKit file ID for PDF
    conversationHistory : json(), // Full conversation history
    finalScore : integer(), // Overall interview score
    codeAnalysis : json(), // DSA code analysis data
    avatarVideoUrl : varchar(), // Talking avatar video URL
    avatarVideoId : varchar() // D-ID video ID
})