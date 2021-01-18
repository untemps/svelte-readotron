import ReadingTimer from '../ReadingTimer'

describe('ReadingTimer', () => {
	it('Should instantiate the class with no error', () => {
		expect(() => new ReadingTimer()).not.toThrow()
	})

	describe('isLangExist', () => {
		it('Should return false as lang does not exist', () => {
			expect(ReadingTimer.isLangExist()).toBeFalsy()
			expect(ReadingTimer.isLangExist(null)).toBeFalsy()
			expect(ReadingTimer.isLangExist('Foo')).toBeFalsy()
			expect(ReadingTimer.isLangExist(42)).toBeFalsy()
			expect(ReadingTimer.isLangExist(() => null)).toBeFalsy()
			expect(ReadingTimer.isLangExist([])).toBeFalsy()
			expect(ReadingTimer.isLangExist({})).toBeFalsy()
		})

		it('Should return true as lang does exist', () => {
			expect(ReadingTimer.isLangExist(Object.keys(ReadingTimer.rates)[1])).toBeTruthy()
			expect(ReadingTimer.isLangExist('de')).toBeTruthy()
		})
	})

	describe('getTime', () => {
		it('Should return 0 as lang does not exist', () => {
			const instance = new ReadingTimer()
			expect(instance.getTime('foo', 'foo')).toBeFalsy()
		})

		it('Should return text minimum reading time', () => {
			const instance = new ReadingTimer()
			const text = 'Text with exactly five words'
			expect(instance.getTime(text)).toBe(1)
		})

		it('Should return text reading time', () => {
			const instance = new ReadingTimer()
			const wordCount = 255
			const rate = ReadingTimer.rates.en
			const { str: text } = generateTokenizedText(null, wordCount, wordCount)
			expect(instance.getTime(text)).toBe(Math.ceil(wordCount / rate))
		})
	})

	describe('getWordCount', () => {
		it('Should return 0 as text is undefined', () => {
			const instance = new ReadingTimer()
			expect(instance.getWordCount()).toBeFalsy()
			expect(instance.getWordCount(null)).toBeFalsy()
		})

		it('Should return 0 as text is empty', () => {
			const instance = new ReadingTimer()
			expect(instance.getWordCount('')).toBeFalsy()
		})

		it('Should return text word count', () => {
			const instance = new ReadingTimer()
			const text = 'Text with exactly five words'
			expect(instance.getWordCount(text)).toBe(5)
		})
	})
})
