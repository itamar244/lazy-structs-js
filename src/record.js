// @flow
import LazyBase, {
	type BaseState,
	type Mutator,
	type Settings,
	createState,
} from './base';

interface State<K, V> extends BaseState {
	key: K;
	value: V;
}

type Dict<K, V> = { [K]: V };

export default class Record<K, V> extends LazyBase<
	[K, V],
	Dict<K, V>,
	State<K, V>,
> {
	constructor(
		data: Dict<K, V>,
		mutators: Array<(State<K, V>) => any>,
		settings: Settings,
	) {
		super(data, mutators, settings);
	}

	__getValueFromState(state: State<K, V>): [K, V] {
		return [state.key, state.value];
	}

	__iterate(func: (State<K, V>) => any) {
		const data = this._data;
		const mutators = this._mutators;
		const state: State<K, V> = createState({
			key: undefined,
			value: undefined,
		});

		for (const _key in data) {
			state.filter = false;
			state.key = (_key: any);
			state.value = data[state.key];

			for (let j = 0; j < mutators.length && !state.filter; j++) {
				mutators[j](state);
			}

			if (!state.filter) {
				func(state);
				if (state.stop) {
					return;
				}
			}
		}
	}

	finish(): Dict<K, V> {
		const obj: Dict<K, V> = {};
		this.__iterate(state => {
			obj[state.key] = state.value;
		});
		return obj;
	}

	map<T, U>(func: (K, V) => [T, U]): Record<T, U> {
		// $FlowIgnore
		return this.mutate((state: State<T, U>) => {
			const res = func(state.key, state.value);
			state.key = res[0];
			state.value = res[1];
		});
	}

	filter(func: (K, V) => boolean): Record<K, V> {
		return this.mutate(state => {
			if (!func(state.key, state.value)) {
				state.filter = true;
			}
		});
	}
}
