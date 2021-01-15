import interpolate from '../interpolate'

describe('interpolate', () => {
	it('Should return null as the string is not specified', () => {
		expect(interpolate()).toBeNull()
	})

	it('Should return the original string as any token is specified', () => {
		expect(interpolate('Foo')).toBe('Foo')
	})

	it('Should return the original with incomplete separator string as any token is specified', () => {
		expect(interpolate('test %time')).toBe('test %time')
	})

	it('Should interpolate the complete separator string with no value as any token is specified', () => {
		expect(interpolate('test %time% before%time% before%time%after %cost%after test')).toBe(
			'test time beforetime beforetimeafter costafter test'
		)
	})

	it('Should interpolate the string with a default separator', () => {
		expect(
			interpolate('test %time% before%time% before%time%after %cost%after test', {
				time: 'foo',
				cost: 'bar',
			})
		).toBe('test foo beforefoo beforefooafter barafter test')
	})

	it('Should interpolate the string with a custom separator', () => {
		expect(
			interpolate(
				'test £time£ before£time£ before£time£after £cost£after test',
				{
					time: 'foo',
					cost: 'bar',
				},
				'£'
			)
		).toBe('test foo beforefoo beforefooafter barafter test')
	})

	it('Should interpolate the string with a complex custom separator', () => {
		expect(
			interpolate(
				'test £-£time£-£ before£-£time£-£ before£-£time£-£after £-£cost£-£after test',
				{
					time: 'foo',
					cost: 'bar',
				},
				'£-£'
			)
		).toBe('test foo beforefoo beforefooafter barafter test')
	})

	it('Should interpolate the string with a reserved separator', () => {
		expect(
			interpolate(
				'test $time$ before$time$ before$time$after $cost$after test',
				{
					time: 'foo',
					cost: 'bar',
				},
				'$'
			)
		).toBe('test foo beforefoo beforefooafter barafter test')
	})

	it('Should interpolate the string with a complex reserved separator', () => {
		expect(
			interpolate(
				'test $*.time$*. before$*.time$*. before$*.time$*.after $*.cost$*.after test',
				{
					time: 'foo',
					cost: 'bar',
				},
				'$*.'
			)
		).toBe('test foo beforefoo beforefooafter barafter test')
	})

	it('Should interpolate batch strings', () => {
		for (var i = 0; i < 100; i++) {
			const { str, tok, int } = generateTokenizedText()
			expect(interpolate(str, tok)).toBe(int)
		}
	})
})
