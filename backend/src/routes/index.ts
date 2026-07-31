import { Router } from "express";

import { doctorRoutes } from "./doctor.routes";


export const routes = Router();


routes.use("/doctor", doctorRoutes);