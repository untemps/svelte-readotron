import { render } from '@testing-library/svelte'
import { waitFor } from '@testing-library/dom'

import Readotron from '../Readotron.svelte'

const selector = '#foo'

describe('Readotron', () => {
	it('renders empty root as selector is does not exist in the DOM', async () => {
		const template = 'bar'
		const { getByTestId } = render(Readotron, {selector, template})
		expect(getByTestId('__readotron-root__')).toBeInTheDocument()
		await waitFor(() => expect(getByTestId('__readotron-root__')).not.toHaveTextContent(template))
	})

	it('renders empty root as time is evaluated to 0', async () => {
		const template = 'bar'
		const { getByTestId } = render(Readotron, {target: generateDOM(), props: { selector, template },})
		await waitFor(() => expect(getByTestId('__readotron-root__')).not.toHaveTextContent(template))
	})
})
