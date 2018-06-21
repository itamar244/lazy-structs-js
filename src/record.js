// @flow
import LazyBase from './base';

type Updator = {|
	filter: () => void,
	stop: () => void,
	setKey: (key: any) => void,
	setValue: (value: any) => void,
|};

type Mutator<K, V> = (key: K, value: V, updator: Updator) => any;

type Dict<K, V> = { [K]: V };

export default class Record<K, V> extends LazyBase<
	[K, V],
	Dict<K, V>,
	Mutator<K, V>
> {
	constructor(data: Dict<K, V>, mutators: Mutator<K, V>[]) {
		super(data, mutators);
	}

	__withNewMutator<T, U>(mutator: Mutator<K, V>): Record<T, U> {
		return (new Record(this._data, this._mutators.concat(mutator)): any);
	}

	__iterate(func: ([K, V], stop: () => any) => any) {
		const data = this._data;
		const mutators = this._mutators;
		const updator = {
			filter: () => { filtered = true; },
			stop: () => { stopped = true; },
			setKey: (nextKey) => { key = nextKey; },
			setValue: (nextValue) => { value = nextValue; },
		};
		let stopped = false;
		let filtered;
		let key;
		let value;

		for (const _key in data) {
			filtered = false;
			key = _key;
			value = data[(_key: any)];

			for (let j = 0; j < mutators.length && !filtered; j++) {
				mutators[j]((key: any), value, updator);
			}

			if (!filtered) {
				func([(key: any), value], updator.stop);
				if (stopped) {
					return;
				}
			}
		}
	}

	finish() {
		const obj: Dict<K, V> = {};
		this.__iterate(item => {
			obj[item[0]] = item[1];
		});
		return obj;
	}

	map<T, U>(func: (K, V) => [T, U]): Record<T, U> {
		return this.__withNewMutator((key, value, updator) => {
			const res = func(key, value);
			updator.setKey(res[0]);
			updator.setValue(res[1]);
		});
	}

	filter(func: (K, V) => bool): Record<K, V> {
		return this.__withNewMutator((key, value, updator) => {
			if (!func(key, value)) {
				updator.filter();
			}
		});
	}
}
