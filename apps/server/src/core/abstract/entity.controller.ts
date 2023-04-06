export abstract class EntityController<Entity> {
  abstract create(createDto: unknown): Promise<Entity>;

  abstract findAll(): Promise<Entity[]>;

  // abstract findOne(id: string): Promise<Entity>;

  // abstract update(id: string, updateDto: unknown): Promise<Entity>;

  // abstract remove(id: string): Promise<Entity>;
}
