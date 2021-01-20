import { render } from '@testing-library/svelte'
import { waitFor } from '@testing-library/dom'

import Readotron from '../Readotron.svelte'

import ReadingTimer from '../../core/ReadPerMinute'

jest.mock('../../core/ReadPerMinute')

const selector = '#foo'

ReadingTimer.mockImplementation(() => {
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
