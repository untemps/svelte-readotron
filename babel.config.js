module.exports = api => ({
	"presets": [
		"@babel/preset-env"
	],
	"plugins": [
		"@babel/plugin-proposal-class-properties",
		...(api.env('test') ? ["@babel/plugin-transform-runtime"] : [])
	]
})

