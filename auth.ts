import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { db } from "@/app/db"
import { users } from "@/app/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  })],
  callbacks: {
    async signIn({ user, profile }) {
      if (!profile) return false

      try {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.google_id, profile.sub as string)
        })

        if (!existingUser) {
          await db.insert(users).values({
            google_id: profile.sub as string,
            email: user.email as string,
            username: user.name as string,
            avatar_url: user.image as string,
            created_at: new Date(),
            updated_at: new Date(),
          } as typeof users.$inferInsert)
        }

        return true
      } catch (error) {
        console.error('Error saving user to database:', error)
        return false
      }
    },
    async session({ session }) {
      if (session.user) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, session.user.email as string)
        })
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.name = dbUser.username
        }
      }
      return session
    }
  }
})