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

	const regex = new RegExp(`${sep}([^${sep}]+\\b)${sep}`, 'gm')
	return str.replace(regex, (_, r) => {
		return (!!tok && tok[r]) || r
	})
}
