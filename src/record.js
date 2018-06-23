// @flow
import LazyBase, {
	type BaseState,
	type Mutator,
	type Settings,
	createState,
} from './base';

interface State<K, V> extends BaseState {
	key: any;
	value: any;
};

type Dict<K, V> = { [K]: V };

export default class Record<K, V> extends LazyBase<
	[K, V],
	Dict<K, V>,
	State<K, V>
> {
	constructor(
		data: Dict<K, V>,
		mutators: Array<(State<K, V>) => any>,
		settings: Settings,
	) {
		super(data, mutators, settings);
	}

	__iterate(func: ([K, V], stop: () => any) => any) {
		const data = this._data;
		const mutators = this._mutators;
		const {state, stop} = createState({
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
				func([(state.key: any), state.value], stop);
				if (state.stop) {
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
		// $FlowIgnore
		return this._withNewMutator((state) => {
			const res = func(state.key, state.value);
			state.key = res[0];
			state.value = res[1];
		});
	}

	filter(func: (K, V) => bool): Record<K, V> {
		return this._withNewMutator((state) => {
			if (!func(state.key, state.value)) {
				state.filter = true;
			}
		});
	}
}
