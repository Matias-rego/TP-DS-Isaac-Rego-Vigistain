import {Router} from 'express';
import { createStatus } from "@/modules/status/status.controller.js"

const route = Router();


route.post('/', createStatus);

export default route;