class ReadingTimer {
	static rates = Object.freeze({
		default: 200,
		ar: 181,
		zh: 260,
		nl: 228,
		en: 236,
		fi: 195,
		fr: 214,
		de: 260,
		he: 224,
		it: 285,
		ko: 226,
		es: 278,
		sv: 218,
	})

	static isLangExist(lang) {
		return !!lang && !!ReadingTimer.rates[lang]
	}

	getTime(text, lang) {
		if (!ReadingTimer.isLangExist(lang)) {
			return 0
		}
		const rate = ReadingTimer.rates[lang]
		const wordCount = this.getWordCount(text)
		return Math.ceil(wordCount / rate)
	}

	getWordCount(text) {
		if (!text) {
			return 0
		}
		const value = text.trim()
		return value.split(/\s+/).length
	}
}

export default ReadingTimer
