import CredentialsProvider from "next-auth/providers/credentials";
import { NuxtAuthHandler } from "#auth";
import { SigninMessage } from "~/server/utils/signin_message";

const config = useRuntimeConfig();

export default NuxtAuthHandler({
  secret: config.authSecret,
  session: {
    strategy: "jwt",
  },
  providers: [
    // @ts-ignore for some reason analyzer thinks .default doesn't exist
    CredentialsProvider.default({
      name: "Solana",
      credentials: {
        message: {
          label: "Message",
          type: "text",
        },
        signature: {
          label: "Signature",
          type: "text",
        },
      },

      async authorize(credentials: any, req: any) {
        try {
          const signinMessage = new SigninMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(config.public.nextauthUrl);

          if (signinMessage.domain !== nextAuthUrl.host) {
            return null;
          }

          const csrfToken: string = req.body?.csrfToken;

          if (signinMessage.nonce !== csrfToken) {
            return null;
          }

          const validationResult = await signinMessage.validate(
            credentials?.signature || ""
          );

          if (!validationResult)
            throw new Error("Could not validate the signed message");

          return {
            id: signinMessage.publicKey,
          };
        } catch (e) {
          console.log("ERROR", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // @ts-ignore
      session.publicKey = token.sub;
      if (session.user) {
        session.user.name = token.sub;
      }
      return session;
    },
  },
});
