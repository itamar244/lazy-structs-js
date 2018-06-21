// @flow
import ListClass from './list';
import RecordClass from './record';

export function List<T>(list: T[]): ListClass<T> {
	return new ListClass(list, []);
}

export function Record<K, V>(obj: { [K]: V }): RecordClass<K, V> {
	return new RecordClass(obj, []);
}
