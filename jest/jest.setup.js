const { toBeInTheDocument, toHaveAttribute, toHaveStyle } = require('@testing-library/jest-dom/matchers')
import '@testing-library/jest-dom/extend-expect'

expect.extend({ toBeInTheDocument, toHaveAttribute, toHaveStyle })

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
global.generateTokenizedText = (separator = '%', maxWordCount = 50, minWordCount = 10) => {
	let str = ''
	let int = ''
	let tok = {}
	const l = Math.ceil(Math.random() * (maxWordCount - minWordCount)) + minWordCount
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

global._sleep = (ms = 100) => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
