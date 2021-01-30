import svelte from 'rollup-plugin-svelte'
import css from 'rollup-plugin-css-only'
import replace from '@rollup/plugin-replace'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import {terser} from 'rollup-plugin-terser'

const production = !!process.env.PRODUCTION

export default {
    input: 'src/index.js',
    output: {
        name: 'svelte-readotron',
        file: 'index.js',
        format: 'umd',
    },
    plugins: [
        svelte(),
        css({output: 'index.css'}),
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'bundled',
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
        }),
        resolve({
            dedupe: ['svelte'],
        }),
        commonjs(),
        production && terser(),
        !production &&
        serve({
            open: true,
            contentBase: ['public'],
            port: 10003,
        }),
        !production &&
        livereload()
    ],
}
