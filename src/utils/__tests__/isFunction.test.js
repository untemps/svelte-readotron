import isFunction from '../isFunction'

describe('isFunction', () => {
	it.each([
		[() => {}],
		[function() {}],
		[Array.prototype.concat],
		[async () => {}],
		[function*(){}],
		[Proxy],
	])('Returns true', (value) => {
		expect(isFunction(value)).toBeTruthy()
	})
	
	it.each([
		[1],
		['foo'],
		[['foo', 'bar', 'gag']],
		[{ 'foo': 1 }],
		[true],
		[new Date],
		[new Error],
		[/foo/],
	])('Returns false', (value) => {
		expect(isFunction(value)).toBeFalsy()
	})
})
