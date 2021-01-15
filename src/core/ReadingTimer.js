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

	getTime(text, lang = 'en') {
		if (!ReadingTimer.isLangExist(lang) || text.length <= 0) {
			return 0
		}
		const rate = ReadingTimer.rates[lang]
		const wordCount = this.getWordCount(text)
		return Math.max(Math.ceil(wordCount / rate), 0)
	}

	getWordCount(text) {
		if (!text) {
			return 0
		}
		return text.trim().split(/\s+/).length
	}
}

export default ReadingTimer
