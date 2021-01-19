class ReadPerMinute {
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
		return !!lang && !!ReadPerMinute.rates[lang]
	}

	parse(text = '', lang = 'en') {
		if (!text) {
			text = ''
		}
		if (!ReadPerMinute.isLangExist(lang)) {
			lang = 'default'
		}
		const rate = ReadPerMinute.rates[lang]
		const words = text.trim().split(/\s+/).length
		return {
			time: Math.ceil(words / rate),
			words,
			rate,
		}
	}
}

export default ReadPerMinute
