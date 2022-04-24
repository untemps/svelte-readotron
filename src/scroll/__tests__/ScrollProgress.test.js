/**
 * @jest-environment jsdom
 */

import ScrollProgress from '../ScrollProgress'
import { fireEvent } from '@testing-library/dom'

describe('ScrollProgress', () => {
	let instance

	beforeEach(() => {
		window = Object.assign(window, {
			innerWidth: 800,
			innerHeight: 600,
			scrollX: 0,
			scrollY: 0,
		})
	})

	afterEach(() => {
		instance.destroy()
	})

	it('triggers handler on scroll', async () => {
		const onScroll = jest.fn()
		instance = new ScrollProgress(onScroll)
		await fireEvent.scroll(window, { target: { scrollY: 300 } })
		expect(onScroll).toHaveBeenNthCalledWith(1, 0, 0)
		expect(onScroll).toHaveBeenNthCalledWith(2, 0, 0.5)
	})

	it('triggers handler on resize', async () => {
		const onScroll = jest.fn()
		window.scrollY = 300
		instance = new ScrollProgress(onScroll)
		await fireEvent.resize(window, { target: { innerHeight: 1200 } })
		expect(onScroll).toHaveBeenNthCalledWith(1, 0, 0.5)
		expect(onScroll).toHaveBeenNthCalledWith(2, 0, 0.25)
	})

	it('triggers handler on trigger function call', async () => {
		const onScroll = jest.fn()
		window.scrollY = 300
		instance = new ScrollProgress(onScroll)
		instance.trigger()
		expect(onScroll).toHaveBeenNthCalledWith(1, 0, 0.5)
		expect(onScroll).toHaveBeenNthCalledWith(2, 0, 0.5)
	})
})
