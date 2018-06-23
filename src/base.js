// @flow
export interface BaseState {
	filter: boolean;
	stop: boolean;
}

export interface Settings {}

export type Mutator<State> = State => any;

export function createState<State: BaseState>(partial: $Shape<State>): State {
	return Object.assign(partial, {
		filter: false,
		stop: false,
	});
}

export default class LazyBase<Item, Data, State> {
	+_data: Data;
	+_mutators: Mutator<State>[];
	+_settings: Settings;
	+__iterate: (func: (State) => any) => any;
	+__getValueFromState: State => Item;

	constructor(data: Data, mutators: Mutator<State>[], settings: Settings) {
		this._data = data;
		this._mutators = mutators;
		this._settings = settings;
	}

	mutate(mutator: Mutator<State>): this {
		return new this.constructor(
			this._data,
			this._mutators.concat(mutator),
			this._settings,
		);
	}

	each(func: Item => any) {
		this.__iterate(state => func(this.__getValueFromState(state)));
	}

	count() {
		let size = 0;
		this.__iterate(() => {
			++size;
		});
		return size;
	}
}
