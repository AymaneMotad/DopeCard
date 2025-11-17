import { usersRouter } from "./routers/users";
import { adminRouter } from "./routers/adminRoute";
import { passesRouter } from "./routers/passesRouter";
import { cardsRouter } from "./routers/cardsRouter";
import { scannerRouter } from "./routers/scannerRouter";
import { analyticsRouter } from "./routers/analyticsRouter";
import { notificationsRouter } from "./routers/notificationsRouter";
import { customersRouter } from "./routers/customersRouter";
import { pdfRouter } from "./routers/pdfRouter";
import { router } from "./trpc";

export const appRouter = router({
  users: usersRouter,
  admin: adminRouter,
  passes: passesRouter,
  cards: cardsRouter,
  scanner: scannerRouter,
  analytics: analyticsRouter,
  notifications: notificationsRouter,
  customers: customersRouter,
  pdf: pdfRouter,
});

export type AppRouter = typeof appRouter;