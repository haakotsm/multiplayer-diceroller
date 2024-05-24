export type Filler = string;

export type Message = {
  from: string;
  content: string;
  order: number;
};

export type MessageWithID = Message & {id: string};

export type DiceRollInput = {
  amount: number;
  sides: number;
};

export type DiceRollResult = {
  user_id: string;
  result: number[];
  timestamp: string;
};

export type DiceRollResultWithID = DiceRollResult & {id: string};
