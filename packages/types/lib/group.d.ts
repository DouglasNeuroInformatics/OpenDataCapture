export type Group = {
  id?: string;
  name: string;
};

export type CreateGroupData = Omit<Group, 'id'>;
