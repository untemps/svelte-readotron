import ReadingTimer from '../ReadPerMinute'

describe('ReadPerMinute', () => {
	describe('constructor', () => {
		it('Instantiates class with no error', () => {
			expect(() => new ReadingTimer()).not.toThrow()
		})
	})

	describe('isLangExist', () => {
		it('Returns false as lang is not specified', () => {
			expect(ReadingTimer.isLangExist()).toBeFalsy()
		})

		it.each([
			[null, false],
			['Foo', false],
			[42, false],
			[() => null, false],
			[[], false],
			[{}, false],
			[Object.keys(ReadingTimer.rates)[1], true],
			['de', true],
		])('Returns lang existence', (value, expected) => {
			expect(ReadingTimer.isLangExist(value)).toBe(expected)
		})
	})

	describe('parse', () => {
		it('Parses text using default values', () => {
			const instance = new ReadingTimer()
			expect(instance.parse()).toEqual({ time: 1, words: 1, rate: ReadingTimer.rates.en })
			expect(
				instance.parse(generateTokenizedText(null, ReadingTimer.rates.en, ReadingTimer.rates.en).str)
			).toEqual({ time: 1, words: ReadingTimer.rates.en, rate: ReadingTimer.rates.en })
		})

		it.each([
			[
				generateTokenizedText(null, 255, 255).str,
				'en',
				{ time: Math.ceil(255 / ReadingTimer.rates.en), words: 255, rate: ReadingTimer.rates.en },
			],
			[
				generateTokenizedText(null, ReadingTimer.rates.en, ReadingTimer.rates.en).str,
				'en',
				{ time: 1, words: ReadingTimer.rates.en, rate: ReadingTimer.rates.en },
			],
			[null, 'en', { time: 1, words: 1, rate: ReadingTimer.rates.en }],
			[
				generateTokenizedText(null, ReadingTimer.rates.default, ReadingTimer.rates.default).str,
				null,
				{ time: 1, words: ReadingTimer.rates.default, rate: ReadingTimer.rates.default },
			],
			[
				generateTokenizedText(null, ReadingTimer.rates.default, ReadingTimer.rates.default).str,
				'foo',
				{ time: 1, words: ReadingTimer.rates.default, rate: ReadingTimer.rates.default },
			],
			[null, null, { time: 1, words: 1, rate: ReadingTimer.rates.default }],
		])('Parses text using specified values', (text, lang, expected) => {
			const instance = new ReadingTimer()
			expect(instance.parse(text, lang)).toEqual(expected)
		})

		it.each([
			[
				generateTokenizedText(null, ReadingTimer.rates.en, ReadingTimer.rates.en).str,
				'fr',
				{ time: 1, words: ReadingTimer.rates.en, rate: ReadingTimer.rates.en },
			],
		])('Parses text regarding lang rate', (text, lang, expected) => {
			const instance = new ReadingTimer()
			expect(instance.parse(text, lang)).not.toEqual(expected)
		})
	})
})
