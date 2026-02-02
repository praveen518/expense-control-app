export type BalanceMutationReason =
  | 'income:add'
  | 'income:remove'
  | 'expense:add'
  | 'expense:delete'
  | 'expense:edit:old'
  | 'expense:edit:new'
  | 'salary:set';