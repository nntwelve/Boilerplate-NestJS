export abstract class MockEntity<T> {
	protected abstract entity_stub: T;

	async create(): Promise<{ save: () => T }> {
		return {
			save: () => this.entity_stub,
		};
	}

	async findById() {
		return this.entity_stub;
	}
	// NOTE: Using async and return Promise will not work
	findOne(): { exec: () => T } {
		return {
			exec: () => this.entity_stub,
		};
	}
	async count() {
		return 1;
	}
	async find() {
		return [this.entity_stub];
	}

	async findByIdAndUpdate() {
		return this.entity_stub;
	}

	async findOneAndUpdate() {
		return this.entity_stub;
	}

	async findByIdAndDelete() {
		return this.entity_stub;
	}

	populate() {
		return this.entity_stub;
	}

	exec() {
		return this.entity_stub;
	}
}
