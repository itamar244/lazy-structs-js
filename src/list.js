// @flow
import LazyBase, {
	type BaseState,
	createState,
} from './base';

interface State<T> extends BaseState {
	value: T;
	i: number;
};

type Mutator<T> = (state: State<T>) => any;

export default class List<T> extends LazyBase<
	T,
	T[],
	Mutator<T>
> {
	constructor(data: T[], mutators: Mutator<T>[]) {
		super(data, mutators);
	}

	__withNewMutator<U>(mutator: Mutator<T>): List<U> {
		return (new List(this._data, this._mutators.concat(mutator)): any);
	}

	__iterate<U>(func: (U, stop: () => any) => any) {
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
				state.i++;
				func((state.value: any), stop);
			}
		}
	}

	finish() {
		const arr = [];
		this.__iterate(item => arr.push(item));
		return arr;
	}

	take(amount: number) {
		if (amount === 0) return [];

		const arr = [];
		this.__iterate((item, stop) => {
			if (arr.push(item) === amount) {
				stop();
			}
		});
		return arr;
	}

	some(predicate: (T) => bool) {
		let found = false;

		this.__iterate((val, stop) => {
			if (predicate(val)) {
				stop();
				found = true;
			}
		});
		return found;
	}

	every(predicate: (T) => bool) {
		let failed = false;

		this.__iterate((val, stop) => {
			if (predicate(val)) {
				stop();
				failed = true;
			}
		});
		return !failed;
	}

	// mutators
	map<U>(func: (T, number) => U): List<U> {
		return this.__withNewMutator((state) => {
			state.value = (func(state.value, state.i): any);
		});
	}

	filter(func: (T, number) => bool): List<T> {
		return this.__withNewMutator((state) => {
			if (!func(state.value, state.i)) {
				state.filter = true;
			}
		});
	}

	slice(from: number, to: number): List<T> {
		let sliced = 0;

		return this.__withNewMutator((state) => {
			if (sliced < from) state.filter = true;
			if (sliced >= to) state.stop = true;
			sliced += 1;
		});
	}
}
