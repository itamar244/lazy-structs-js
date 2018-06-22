// @flow
export interface BaseState {
	filter: bool,
	stop: bool,
};

export function createState<State: BaseState>(
	partial: $Shape<State>,
): { state: State, stop: () => void } {
	const state = Object.assign(partial, {
		filter: false,
		stop: false,
	});

	return {
		state,
		stop: () => { state.stop = true; },
	};
}

export default class LazyBase<Item, Data, Mutator> {
	+_data: Data;
	+_mutators: Mutator[];
	+__iterate: (func: (Item, stop: () => any) => any) => any;

	constructor(data: Data, mutators: Mutator[]) {
		this._data = data;
		this._mutators = mutators;
	}

	each(func: (Item) => any) {
		this.__iterate((item) => func(item));
	}
}
