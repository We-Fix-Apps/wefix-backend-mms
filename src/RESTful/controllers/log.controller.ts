import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { USER_DATA } from '../../db/seeds/usersSeed';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { Actions } from '../types/log.types';

export const getAllLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const logs = [];
  
  USER_DATA.forEach((user) => {
    const _user = { ...user };
    
    logs.push({
      log: {
        id: uuidv4(),
        actionType: Actions.IN,
        description: 'i logged in',
        time: new Date(2021, 11, 24, 9, 10),
        isArchived: false,
        user: _user,
      },
    });
    
    logs.push({
      log: {
        id: uuidv4(),
        actionType: Actions.BREAK,
        description: 'break time!!',
        time: new Date(2021, 11, 24, 1, 30),
        isArchived: false,
        user: _user,
      },
    });
  });

  res.status(200).json({
    success: true,
    message: 'Logs fetched successfully',
    logs,
  });
});

