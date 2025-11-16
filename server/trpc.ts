import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const trpc = initTRPC.create();

export const router = trpc.router;
export const publicProcedure = trpc.procedure;

// Protected procedure for authenticated users
export const protectedProcedure = trpc.procedure.use(async ({ ctx, next }) => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session,
      user: session.user,
    },
  });
});

// Admin procedure - only admins can access
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only admins can access this resource',
    });
  }

  return next({ ctx });
});
