import { Request } from 'express';
import { User } from '../../entities';

export interface RequestWithUser extends Request {
  user: User;
}

