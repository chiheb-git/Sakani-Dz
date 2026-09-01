import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import clientsRouter from "./clients";
import vendorsRouter from "./vendors";
import propertiesRouter from "./properties";
import sitesRouter from "./sites";
import touristSpotsRouter from "./tourist-spots";
import adminRouter from "./admin";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(clientsRouter);
router.use(vendorsRouter);
router.use(propertiesRouter);
router.use(sitesRouter);
router.use(touristSpotsRouter);
router.use(adminRouter);
router.use(statsRouter);

export default router;
