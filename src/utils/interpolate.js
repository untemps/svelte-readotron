export default (str, tok, sep = '%') => {
	if (!str) {
		return null
	}

	sep = sep.replace(/([\[\^\$\.|\?\*\+\(\)])+/gm, (c) =>
		c
			.split('')
			.map((i) => '\\' + i)
			.join('')
	)

	return str.replace(new RegExp(`${sep}([^${sep}]+\\b)${sep}`, 'gm'), (_, r) =>
		!!tok && tok[r] !== null && tok[r] !== undefined ? tok[r] : r
	)
}
