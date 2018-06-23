// @flow
import LazyBase, {
	type BaseState,
	type Settings,
	type Mutator,
	createState,
} from './base';

interface State<T> extends BaseState {
	value: T;
	i: number;
};

export default class List<T> extends LazyBase<T, T[], State<T>> {
	constructor(
		data: T[],
		mutators: Mutator<State<T>>[],
		settings: Settings,
	) {
		super(data, mutators, settings);
	}

	__getValueFromState(state: State<T>): T {
		return state.value;
	}

	__iterate<U>(func: (State<U>) => any): void {
		const mutators = this._mutators;
		const data = this._data;
		const {state, stop} = createState({i: 0, value: undefined});

		for (let i = 0; i < data.length; i++) {
			state.filter = false;
			state.value = data[i];

			for (let j = 0; j < mutators.length && !state.filter; j++) {
				mutators[j](state);
			}

			if (state.stop) {
				return;
			}
			if (!state.filter) {
				func(state);
				state.i++;
			}
		}
	}

	finish() {
		const arr = [];
		this.__iterate(state => arr.push(state.value));
		return arr;
	}

	take(amount: number) {
		if (amount === 0) return [];

		const arr = [];
		this.__iterate((state) => {
			if (arr.push(state.value) === amount) {
				state.stop = true;
			}
		});
		return arr;
	}

	some(predicate: (T) => bool) {
		let found = false;

		this.__iterate((state) => {
			if (predicate(state.value)) {
				state.stop = true;
				found = true;
			}
		});
		return found;
	}

	every(predicate: (T) => bool) {
		let failed = false;

		this.__iterate((state) => {
			if (predicate(state.value)) {
				state.stop = true;
				failed = true;
			}
		});
		return !failed;
	}

	// mutators
	map<U>(func: (T, number) => U): List<U> {
		// $FlowIgnore
		return this._withNewMutator((state) => {
			state.value = (func(state.value, state.i): any);
		});
	}

	filter(func: (T, number) => bool): List<T> {
		return this._withNewMutator((state) => {
			if (!func(state.value, state.i)) {
				state.filter = true;
			}
		});
	}

	slice(from: number, to: number): List<T> {
		let sliced = 0;

		return this._withNewMutator((state) => {
			if (sliced < from) state.filter = true;
			if (sliced >= to) state.stop = true;
			sliced += 1;
		});
	}
}
