import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { fireEvent } from '@testing-library/dom'

import ScrollProgress from '../ScrollProgress.js'

describe('ScrollProgress: coverage only', () => {
	let instance

	beforeEach(() => {
		window = Object.assign(window, {
			innerWidth: 0,
			innerHeight: 0,
			scrollX: undefined,
			scrollY: undefined,
		})
	})

	afterEach(() => {
		instance.destroy()
	})

	test('sets trigger function to noop', async () => {
		const onScroll = vi.fn(() => 0)
		instance = new ScrollProgress(onScroll)
	})

	test('fallbacks calculation properties', async () => {
		instance = new ScrollProgress(0)
	})
})

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

	test('triggers handler on scroll', async () => {
		const onScroll = vi.fn(() => 0)
		instance = new ScrollProgress(onScroll)
		await fireEvent.scroll(window, { target: { scrollY: 300 } })
		expect(onScroll).toHaveBeenNthCalledWith(1, 0, 0)
		expect(onScroll).toHaveBeenNthCalledWith(2, 0, 0.5)
	})

	test('triggers handler on resize', async () => {
		const onScroll = vi.fn(() => 0)
		window.scrollY = 300
		instance = new ScrollProgress(onScroll)
		await fireEvent.resize(window, { target: { innerHeight: 1200 } })
		expect(onScroll).toHaveBeenNthCalledWith(1, 0, 0.5)
		expect(onScroll).toHaveBeenNthCalledWith(2, 0, 0.25)
	})

	test('triggers handler on trigger function call', async () => {
		const onScroll = vi.fn(() => 0)
		window.scrollY = 300
		instance = new ScrollProgress(onScroll)
		instance.trigger()
		expect(onScroll).toHaveBeenNthCalledWith(1, 0, 0.5)
		expect(onScroll).toHaveBeenNthCalledWith(2, 0, 0.5)
	})
})
