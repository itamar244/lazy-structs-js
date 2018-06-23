// @flow
import type {Settings} from './base';
import ListClass from './list';
import RecordClass from './record';

export function List<T>(
	list: T[],
	settings: Settings = {},
): ListClass<T> {
	return new ListClass(list, [], settings);
}

export function Record<K, V>(
	obj: { [K]: V },
	settings: Settings = {},
): RecordClass<K, V> {
	return new RecordClass(obj, [], settings);
}
