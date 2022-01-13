/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from '@testing-library/svelte'
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

	it('renders empty string as no selector is passed down to the component', async () => {
		const { getByTestId } = render(Readotron, { props: { selector: null } })
		expect(getByTestId('__readotron-root__')).toBeInTheDocument()
		await waitFor(() => expect(getByTestId('__readotron-root__')).toHaveTextContent('No content to parse'))
	})

	it('renders error string as selector does not exist in the DOM', async () => {
		const { getByTestId } = render(Readotron, { props: { selector: '#bar' } })
		expect(getByTestId('__readotron-root__')).toBeInTheDocument()
		await waitFor(() => expect(getByTestId('__readotron-root__')).toHaveTextContent('Element #bar cannot be found'))
	})

	it('renders parsed values in default template', async () => {
		const { getByTestId } = render(Readotron, { props: { selector: '#foo' } })
		await waitFor(() => expect(getByTestId('__readotron-root__')).toHaveTextContent('1 min read'))
	})

	it('renders parsed values in custom template', async () => {
		const template = '%time% minute'
		const { getByTestId } = render(Readotron, { props: { selector: '#foo', template } })
		await waitFor(() => expect(getByTestId('__readotron-root__')).toHaveTextContent('1 minute'))
	})

	it('renders error slot', async () => {
		const { getByTestId } = render(ErrorSlotTest, {
			props: { component: Readotron, selector: '#bar' },
		})
		await waitFor(() => expect(getByTestId('__readotron-error__')).toBeInTheDocument())
	})

	it('renders content slot', async () => {
		const { getByTestId } = render(ContentSlotTest, {
			props: { component: Readotron, selector: '#foo' },
		})
		await waitFor(() => expect(getByTestId('__readotron-content__')).toBeInTheDocument())
	})

	it('triggers change event', async () => {
		const onChange = jest.fn()
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
