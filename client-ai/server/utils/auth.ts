import { getServerSession } from "#auth";

export const isAuthenticated = async (event: any) => {
  const session = await getServerSession(event);

  if (!session) {
    throw createError({
      statusCode: 401,
      message: "You must be logged in to access this resource",
    })
  }

  return session;
};
