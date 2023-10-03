import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/svelte'
import { waitFor } from '@testing-library/dom'

import Readotron from '../Readotron.svelte'
import ErrorSlotTest from './ErrorSlotTest.svelte'
import ContentSlotTest from './ContentSlotTest.svelte'

describe('Readotron', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div><span id="foo">Foo</span></div>'
	})

	afterEach(() => {
		document.body.innerHTML = ''
	})

	test('renders empty string as no selector is passed down to the component', async () => {
		render(Readotron, { props: { selector: null } })
		expect(screen.getByTestId('__readotron-root__')).toBeInTheDocument()
		await waitFor(() => expect(screen.getByTestId('__readotron-root__')).toHaveTextContent('No content to parse'))
	})

	test('renders error string as selector does not exist in the DOM', async () => {
		render(Readotron, { props: { selector: '#bar' } })
		expect(screen.getByTestId('__readotron-root__')).toBeInTheDocument()
		await waitFor(() =>
			expect(screen.getByTestId('__readotron-root__')).toHaveTextContent('Element #bar cannot be found')
		)
	})

	test('renders parsed values in default template', async () => {
		render(Readotron, { props: { selector: '#foo' } })
		await waitFor(() => expect(screen.getByTestId('__readotron-root__')).toHaveTextContent('1 min read'))
	})

	test('renders parsed values in custom template', async () => {
		const template = '%time% minute'
		render(Readotron, { props: { selector: '#foo', template } })
		await waitFor(() => expect(screen.getByTestId('__readotron-root__')).toHaveTextContent('1 minute'))
	})

	test('renders parsed values in custom function template', async () => {
		const template = (time, words) => `${time} <strong>minute(s)</strong> and ${words} <i>word(s)</i>`
		render(Readotron, { props: { selector: '#foo', template } })
		await waitFor(() =>
			expect(screen.getByTestId('__readotron-root__')).toHaveTextContent('1 minute(s) and 1 word(s)')
		)
	})

	test('renders parsed values in custom function template returning random type', async () => {
		const template = (time, words) => [1, 2, 3]
		render(Readotron, { props: { selector: '#foo', template } })
		await waitFor(() => expect(screen.getByTestId('__readotron-root__')).toHaveTextContent('1,2,3'))
	})

	test('renders error slot', async () => {
		render(ErrorSlotTest, {
			props: { component: Readotron, selector: '#bar' },
		})
		await waitFor(() => expect(screen.getByTestId('__readotron-error__')).toBeInTheDocument())
	})

	test('renders content slot', async () => {
		const { getByTestId } = render(ContentSlotTest, {
			props: { component: Readotron, selector: '#foo' },
		})
		await waitFor(() => expect(getByTestId('__readotron-content__')).toBeInTheDocument())
	})

	test('triggers change event', async () => {
		const onChange = vi.fn(() => 0)
		const { component } = render(Readotron, {
			props: { selector: '#foo', withScroll: true },
		})
		component.$on('change', onChange)
		await fireEvent.scroll(global, { target: { scrollY: 100 } })
		await waitFor(() => {
			expect(onChange).toHaveBeenCalledWith(new CustomEvent({ detail: { time: 1, words: 1, progress: 100 } }))
		})
	})
})
