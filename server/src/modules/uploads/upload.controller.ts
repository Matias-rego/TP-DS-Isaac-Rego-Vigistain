import type { Request, Response } from "express";
import { BadRequestError } from "@/shared/http-errors.js";

export class UploadController {
  public upload = async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError("No se recibió ningún archivo");
    }

    return res.status(201).json({
      id: req.file.filename,
      url: req.file.path,
    });
  };
}
