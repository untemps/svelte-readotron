class ReadingTimer {
	static wpmValues = Object.freeze({
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
		return !!lang && !!ReadingTimer.wpmValues[lang]
	}

	getTime(text, lang) {
		if(!ReadingTimer.isLangExist(lang)) {
			return 0
		}
		const wpm = ReadingTimer.wpmValues[lang]
		const wordCount = this.getWordCount(text)
		return Math.ceil(wordCount / wpm);
	}

	getWordCount(text) {
		if (!text) {
			return 0
		}
		const value = text.trim();
		return value.split(/\s+/).length;
	}
}

export default ReadingTimer
