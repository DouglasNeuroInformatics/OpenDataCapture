export abstract class MockModel<T> {
  protected abstract entityStub: T;

  constructor(createEntityData: T) {
    this.constructorSpy(createEntityData);
  }

  constructorSpy(createEntityData: T): T {
    return createEntityData;
  }

  find(): Promise<T[]> {
    return Promise.resolve([this.entityStub]);
  }

  findOne(): { exec: () => T } {
    return {
      exec: (): T => this.entityStub
    };
  }

  save(): Promise<T> {
    return Promise.resolve(this.entityStub);
  }

  async findOneAndUpdate(): Promise<T> {
    return Promise.resolve(this.entityStub);
  }
}
