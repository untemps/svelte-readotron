import { render } from '@testing-library/svelte'
import { waitFor } from '@testing-library/dom'
import { ReadPerMinute } from '@untemps/read-per-minute'

import Readotron from '../Readotron.svelte'

jest.mock('@untemps/read-per-minute')

const selector = '#foo'

ReadPerMinute.mockImplementation(() => {
	return {
		parse: () => {
			throw new Error('Test error')
		},
	}
})

describe('Readotron', () => {
	it('renders interpolated template', async () => {
		const { getByTestId } = render(Readotron, { target: generateDOM(''), props: { selector } })
		await waitFor(() => expect(getByTestId('__readotron-root__')).toHaveTextContent('Test error'))
	})
})
