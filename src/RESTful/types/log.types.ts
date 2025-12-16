export enum Actions {
  IN = 'in',
  OUT = 'out',
  BREAK = 'break',
  LEAVE = 'leave',
  SMOKE_BREAK = 'smoke break',
}

export interface Log {
  id: string;
  actionType: Actions;
  description: string;
  time: Date;
  isArchived: boolean;
  user: any;
}


