// @flow
import LazyBase from './base';

type Updator = {|
	filter: () => void,
	stop: () => void,
	set: (value: any) => void,
|};

type Mutator<T> = (arg: T, i: number, updator: Updator) => any;


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

	__iterate<T, U>(func: (U, stop: () => any) => any) {
		const mutators = this._mutators;
		const origin = this._data;
		const updator = {
			filter: () => {
				filtered = true;
			},
			stop: () => {
				stopped = true;
			},
			set: (nextValue) => {
				value = nextValue;
			},
		};
		let returnedCount = 0;
		let stopped = false;
		let filtered;
		let value;

		for (let i = 0; i < origin.length; i++) {
			filtered = false;
			value = origin[i];

			for (let j = 0; j < mutators.length && !filtered; j++) {
				mutators[j](value, returnedCount, updator);
			}

			if (!filtered) {
				returnedCount++;
				func((value: any), updator.stop);
				if (stopped) {
					return;
				}
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
		return this.__withNewMutator((val, i, updator) => {
			updator.set(func(val, i));
		});
	}

	filter(func: (T, number) => bool): List<T> {
		return this.__withNewMutator((val, i, updator): any => {
			if (!func(val, i)) {
				updator.filter();
			}
		});
	}

	slice(from: number, to: number): List<T> {
		let sliced = 0;

		return this.__withNewMutator((val, _, updator) => {
			if (sliced < from) updator.filter();
			if (sliced >= to) updator.stop();
			sliced += 1;
		});
	}
}
