import type { NextFunction, Request, Response } from "express";
import type { IdDto } from "@/shared/common.schema.js";
import type { CreateFailuresDto } from "./failure.schema.js";
import type { FailureService } from "./failure.service.js";

export class FailureController {
  constructor(private service: FailureService) { }

  public createFailures = async (req: Request, res: Response, next: NextFunction) => {
    const failures = req.validated.body as CreateFailuresDto;

    try {
      const created = await this.service.createMany(failures);

      return res.status(201).json({
        message: "Fallas registradas con éxito",
        failures: created,
      });
    } catch (error) {
      next(error);
    }
  };

  // Antes era getFailureOfEquipment; ahora la falla cuelga de la orden.
  public getFailuresOfOrder = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.validated.params as IdDto;

    try {
      const failures = await this.service.findByOrderId(id);
      return res.status(200).json(failures);
    } catch (error) {
      next(error);
    }
  };
}