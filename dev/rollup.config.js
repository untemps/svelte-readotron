import svelte from 'rollup-plugin-svelte'
import css from 'rollup-plugin-css-only'
import replace from '@rollup/plugin-replace'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
	input: 'src/index.js',
	output: {
		format: 'es',
		file: 'dist/index.js',
	},
	plugins: [
		svelte(),
		css({ output: 'index.css' }),
		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		babel({
			exclude: 'node_modules/**',
			babelHelpers: 'bundled',
		}),
		resolve(),
		commonjs(),
		serve({
			open: true,
			contentBase: ['dist', 'public'],
		}),
		livereload(),
	],
}
