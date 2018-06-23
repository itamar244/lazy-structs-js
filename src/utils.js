// @flow
export function toString(val: any): string {
	return val == null ? '' + val : val.toString();
}
