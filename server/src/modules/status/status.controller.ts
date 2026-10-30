import type { Request, Response } from 'express';
import type { IdDto } from '@/shared/common.schema.js';
import type { RegisterStatusDto, StatusQueryDto } from './status.schema.js';
import type { StatusService } from './status.service.js';
import { emitEvent } from '@/websocket.js';
import { EVENTS } from '@/shared/events.js';
import { UnauthorizedError } from '@/shared/http-errors.js';

export class StatusController {
  constructor(private service: StatusService) { }

  public registerStatus = async (req: Request, res: Response) => {
    const data = req.validated.body as RegisterStatusDto;

    if (!req.user) {
      throw new UnauthorizedError('No autenticado');
    }

    const entry = await this.service.createStatus({
      id_order: data.id_order,
      id_user: req.user.id,
      status: data.status,
      comment: data.comment,
    });

    // TODO: usar data.notifyClient para disparar la notificación al
    // cliente (mail/whatsapp/etc) cuando corresponda.
    emitEvent(EVENTS.statusChanged, entry);

    return res.status(201).json(entry);
  };

  public getStatusOfOrder = async (req: Request, res: Response) => {
    const { id } = req.validated.params as IdDto;

    const history = await this.service.findByOrderId(id);
    return res.status(200).json(history);
  };

  public getAllStatus = async (req: Request, res: Response) => {
    const query = req.validated.query as StatusQueryDto;

    res.json(await this.service.findAll(query));
  };
}