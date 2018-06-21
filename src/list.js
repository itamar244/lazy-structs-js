// @flow
type Manipulator<T> =
	(arg: T, i: number, cancel: () => void) => any;

interface ListAPI<T> {
	each(func: (T) => any): void;
	finish(): T[];
	take(amount: number): T[];
	some(predicate: (T) => boolean): boolean;
	every(predicate: (T) => boolean): boolean;

	map<U>(predicate: (T, number) => U): ListAPI<U>;
	filter(predicate: (T, number) => boolean): ListAPI<T>;
}

function iterate<T, U>(
	origin: T[],
	manipulators: Manipulator<T>[],
	func: (U, stop: () => any) => any,
) {
	const cancel = () => {
		filtered = true;
	};
	const stop = () => {
		stopped = true;
	};
	let returnedCount = 0;
	let stopped = false;
	let filtered;

	for (let i = 0; i < origin.length; i++) {
		let value: any = origin[i];

		filtered = false;

		for (let j = 0; j < manipulators.length && !filtered; j++) {
			value = manipulators[j](value, returnedCount, cancel);
		}

		if (!filtered) {
			returnedCount++;
			func(value, stop);
			if (stopped) {
				return;
			}
		}
	}
}

export default function List<T>(origin: T[]): ListAPI<T> {
	const manipulators: Manipulator<T>[] = [];

	const list: ListAPI<T> = {
		each(func: (T) => any) {
			iterate(origin, manipulators, func);
		},

		finish() {
			const arr = [];
			iterate(origin, manipulators, item => arr.push(item));
			return arr;
		},

		take(amount: number) {
			if (amount === 0) return [];

			const arr = [];
			iterate(origin, manipulators, (item, stop) => {
				if (arr.push(item) === amount) {
					stop();
				}
			});
			return arr;
		},

		some(predicate: (T) => boolean) {
			let found = false;

			iterate(origin, manipulators, (val, stop) => {
				if (predicate(val)) {
					stop();
					found = true;
				}
			});
			return found;
		},

		every(predicate: (T) => boolean) {
			let failed = false;

			iterate(origin, manipulators, (val, stop) => {
				if (predicate(val)) {
					stop();
					failed = true;
				}
			});
			return !failed;
		},

		map<U>(func: (T, number) => U) {
			manipulators.push(func);
			return (list: any);
		},

		filter(func: (T, number) => boolean) {
			manipulators.push((v, i, cancel): any => {
				if (!func(v, i)) {
					cancel();
				}
				return v;
			});
			return list;
		},
	};

	return list;
}
