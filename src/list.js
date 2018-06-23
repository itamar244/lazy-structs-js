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

	__iterate(func: (State<T>) => any): void {
		const mutators = this._mutators;
		const data = this._data;
		const state: State<T> = createState({i: 0, value: undefined});

		for (let i = 0; i < data.length; i++) {
			state.filter = false;
			state.value = data[i];

			for (
				let j = 0;
				j < mutators.length && !state.filter && !state.stop;
				j++
			) {
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
		this.__iterate(state => { arr.push(state.value); });
		return arr;
	}

	take(amount: number): T[] {
		if (amount === 0) return [];

		const arr = [];
		this.__iterate((state) => {
			if (arr.push(state.value) === amount) {
				state.stop = true;
			}
		});
		return arr;
	}

	join(seperator: string = ','): string {
		let string = '';
		let first = true;
		this.__iterate((state) => {
			if (first) {
				string = '' + (state.value: any);
				first = false;
			} else {
				string += seperator + (state.value: any);
			}
		});
		return string;
	}

	find(predicate: (T, number) => bool): T | void {
		let value;
		this.__iterate((state) => {
			if (predicate(state.value, state.i)) {
				state.stop = true;
				value = state.value;
			}
		});
		return value;
	}

	get(i: number): T | void {
		let value;
		this.__iterate((state) => {
			if (state.i == i) {
				value = state.value;
				state.stop = true;
			}
		});
		return value;
	}

	reduce(reducer: (T, T, number) => T): T {
		let value;
		this.__iterate((state) => {
			value = state.i === 0 ? state.value : reducer(
				value,
				state.value,
				state.i,
			);
		});
		return (value: any);
	}

	reduceWithInit<U>(initialValue: U, reducer: (U, T, number) => U): U {
		let value;
		this.__iterate((state) => {
			value = reducer(
				state.i === 0 ? initialValue : value,
				state.value,
				state.i,
			);
		});
		return (value: any);
	}

	some(predicate: (T) => bool): bool {
		let found = false;

		this.__iterate((state) => {
			if (predicate(state.value)) {
				state.stop = true;
				found = true;
			}
		});
		return found;
	}

	every(predicate: (T) => bool): bool {
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
		return this.mutate((state) => {
			state.value = (func(state.value, state.i): any);
		});
	}

	filter(func: (T, number) => bool): List<T> {
		return this.mutate((state) => {
			if (!func(state.value, state.i)) {
				state.filter = true;
			}
		});
	}

	slice(from: number, to: number): List<T> {
		let sliced = 0;

		return this.mutate((state) => {
			if (sliced < from) state.filter = true;
			if (sliced >= to) state.stop = true;
			sliced += 1;
		});
	}
}
