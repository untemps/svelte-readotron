import { interpolate } from '../interpolate'

const WORDS = [
	'year',
	'learn',
	'key',
	'cook',
	'crosswalk',
	'script',
	'chief',
	'plan',
	'meat',
	'vague',
	'demonstrator',
	'dictionary',
	'visible',
	'bomber',
	'variation',
	'leader',
	'channel',
	'litigation',
	'royalty',
	'impulse',
	'package',
	'oppose',
	'privilege',
	'begin',
	'operation',
	'herd',
	'hemisphere',
	'incongruous',
	'horror',
	'pipe',
	'start',
	'vertical',
	'worry',
	'reform',
	'unlike',
	'exhibition',
	'disagree',
	'allow',
	'patrol',
	'combine',
	'impress',
	'invisible',
	'cage',
	'log',
	'snow',
	'undertake',
	'division',
	'ethics',
	'damage',
	'responsible',
]
const generateString = (separator = '%') => {
	let str = ''
	let int = ''
	let tok = {}
	const l = Math.ceil(Math.random() * 50) + 10
	for (let i = 0; i < l; i++) {
		const r = Math.random() > 0.7
		const w = WORDS[Math.floor(Math.random() * WORDS.length)]
		str += `${i > 0 ? ' ' : ''}${r ? separator : ''}${w}${r ? separator : ''}`
		if (r) {
			tok[w] = 'gag'
			int += `${i > 0 ? ' ' : ''}${r ? tok[w] : ''}`
		} else {
			int += `${i > 0 ? ' ' : ''}${r ? separator : ''}${w}${r ? separator : ''}`
		}
	}
	return { str, int, tok }
}

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
			const { str, tok, int } = generateString()
			expect(interpolate(str, tok)).toBe(int)
		}
	})
})
