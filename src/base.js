// @flow
export type Updator = {|
	filter: () => void,
	stop: () => void,
	set: (value: any) => void,
|};

export default class LazyBase<Item, Data, Mutator> {
	+_data: Data;
	+_mutators: Mutator[];
	+__iterate: (func: (Item, stop: () => any) => any) => void;

	constructor(data: Data, mutators: Mutator[]) {
		this._data = data;
		this._mutators = mutators;
	}

	each(func: (Item) => any) {
		this.__iterate((item) => func(item));
	}
}
