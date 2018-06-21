// @flow
import ListClass from './list';

export function List<T>(list: T[]): ListClass<T> {
	return new ListClass(list, []);
}
