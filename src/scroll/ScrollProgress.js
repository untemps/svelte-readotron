/**
 * Fallback noop function
 * @method noop
 * @returns {undefined}
 */
const noop = () => {}

/**
 * ScrollProgress class
 * @constructor ScrollProgress
 * @param {Function} handleUpdate method to call on scroll update
 * @returns {undefined}
 */
class ScrollProgress {
	#onChange = null

	#viewportHeight = 0
	#viewportWidth = 0
	#progress = 0

	#boundScrollHandler = null
	#boundResizeHandler = null

	constructor(onChange) {
		// assign function to call on update
		this.#onChange = typeof onChange === 'function' ? onChange : noop

		// set initial values
		this.#viewportHeight = this.#getViewportHeight()
		this.#viewportWidth = this.#getViewportWidth()

		this.#progress = this.#getProgress()

		// trigger initial update function
		this.#onChange?.(this.#progress.x, this.#progress.y)

		// bind event functions
		this.#boundScrollHandler = this.#onScroll.bind(this)
		this.#boundResizeHandler = this.#onResize.bind(this)

		// add event listeners
		window.addEventListener('scroll', this.#boundScrollHandler)
		window.addEventListener('resize', this.#boundResizeHandler)
	}

	/**
	 * Trigger update callback
	 * @method trigger
	 * @returns {undefined}
	 */
	trigger() {
		this.#onChange?.(this.#progress.x, this.#progress.y)
	}

	/**
	 * Destroy scroll observer, remove listeners and update callback
	 * @method destroy
	 * @returns {undefined}
	 */
	destroy() {
		window.removeEventListener('scroll', this.#boundScrollHandler)
		window.removeEventListener('resize', this.#boundResizeHandler)
		this.#onChange = null
	}

	/**
	 * Get vertical trajectory of the viewport
	 * @method #getViewportHeight
	 * @returns {Number}
	 */
	#getViewportHeight() {
		return document.body.scrollHeight - window.innerHeight
	}

	/**
	 * Get horizontal trajectory of the viewport
	 * @method #getViewportWidth
	 * @returns {Number}
	 */
	#getViewportWidth() {
		return document.body.scrollWidth - window.innerWidth
	}

	/**
	 * Get scroll progress on both axis
	 * @method #getProgress
	 * @returns {Object}
	 */
	#getProgress() {
		const x = typeof window.scrollX === 'undefined' ? window.pageXOffset : window.scrollX
		const y = typeof window.scrollY === 'undefined' ? window.pageYOffset : window.scrollY

		return {
			x: this.#viewportWidth === 0 ? 0 : Math.abs(x / this.#viewportWidth),
			y: this.#viewportHeight === 0 ? 0 : Math.abs(y / this.#viewportHeight),
		}
	}

	/**
	 * Get scroll progress on both axis
	 * @method #onScroll
	 * @returns {undefined}
	 */
	#onScroll() {
		this.#progress = this.#getProgress()
		this.#onChange?.(this.#progress.x, this.#progress.y)
	}

	/**
	 * Update viewport metrics, recalculate progress and call update callback
	 * @method #onResize
	 * @returns {undefined}
	 */
	#onResize() {
		this.#viewportHeight = this.#getViewportHeight()
		this.#viewportWidth = this.#getViewportWidth()

		this.#progress = this.#getProgress()

		// trigger update function
		this.#onChange?.(this.#progress.x, this.#progress.y)
	}
}

export default ScrollProgress
