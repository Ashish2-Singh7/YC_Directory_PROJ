import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { client } from "./sanity/lib/client";
import { AUTHOR_BY_GITHUB_ID_QUERY } from "./lib/query";
import { writeClient } from "./sanity/lib/write-client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user, profile }) { // Changed: Destructured user directly
      try {
        const existingUser = await client.withConfig({ useCdn: false }).fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
          id: profile.id, // Corrected: Access id from profile
        });

        if (!existingUser) {
          await writeClient.create({
            _type: "author",
            id: profile.id,  // Corrected: Access id from profile
            name: user.name, // Corrected: Access name from user
            username: profile.login, // Corrected: Access login from profile
            email: user.email, // Corrected: Access email from user
            image: user.image, // Corrected: Access image from user
            bio: profile.bio || "", // Corrected: Access bio from profile
          });
        }
        return true;
      } catch (error) {
        console.error("Error during signIn:", error); // Added: Detailed error logging
        return false; // Important: Handle the error and prevent sign-in
      }
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        try {
          const user = await client.withConfig({ useCdn: false }).fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id: profile.id });
          if (user) {
            token.id = user._id;
          }


        } catch (error) {
          console.error("Error fetching user in jwt:", error);
          // Consider how to handle this error.  
          // You might want to add a custom error property to the token.
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) { // Use optional chaining
        session.id = token.id;
      }
      return session;
    },
  },
});