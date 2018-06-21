type Manipulator<T, U> =
	(arg: T, i: number, cancel: () => void) => U;

function iterate<T, U>(
	origin: T[],
	manipulators: Manipulator<T, U>[],
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

export default function List<T, U>(origin: T[]) {
	const manipulators: Manipulator<T, U>[] = [];

	const list = {
		each(func: (U) => any) {
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

		map(func: (T, i) => U) {
			manipulators.push(func);
			return list;
		},

		filter(func: (T, i) => boolean) {
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
