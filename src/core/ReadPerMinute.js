/**
 * Rates from "How many words do we read per minute? A review and meta-analysis of reading rate" by Marc Brysbaert - Department of Experimental Psychology Ghent University
 */

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

	/**
	 * Returns whether the specified lang is indexed in the rate list.
	 * @param lang  {string}    Lang to test
	 * @returns {boolean}       True if the lang is indexed, false if not
	 */
	static isLangExist(lang) {
		return !!lang && !!ReadPerMinute.rates[lang]
	}

	/**
	 * Parses a string, counts the number the words and divides it by the lang rate to get an estimated reading time.
	 * The function returns an object containing the estimated time, the number of words and the rate used in the calculation.
	 * @param text  {string}                                    String to parse.
	 * @param lang  {string}                                    Lang used to retrieve the reading rate.
	 * @returns {{rate: number, words: number, time: number}}   Object containing the estimated time, the number of words and the rate used in the calculation.
	 */
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
