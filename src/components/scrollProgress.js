/**
 * Fallback noop function
 * @method noop
 * @returns {undefined}
 */
function noop() {}

/**
 * ScrollProgress class
 * @constructor ScrollProgress
 * @param {Function} handleUpdate method to call on scroll update
 * @returns {undefined}
 */
class ScrollProgress {
	constructor(handleUpdate) {
		// assign function to call on update
		this._handleUpdate = typeof handleUpdate === 'function' ? handleUpdate : noop

		// set initial values
		this._viewportHeight = this._getViewportHeight()
		this._viewportWidth = this._getViewportWidth()

		this._progress = this._getProgress()

		// trigger initial update function
		this._handleUpdate(this._progress.x, this._progress.y)

		// bind event functions
		this._onScroll = this._onScroll.bind(this)
		this._onResize = this._onResize.bind(this)

		// add event listeners
		window.addEventListener('scroll', this._onScroll)
		window.addEventListener('resize', this._onResize)
	}

	/**
	 * Get vertical trajectory of the viewport
	 * @method _getViewportHeight
	 * @returns {Number}
	 */
	_getViewportHeight = function() {
		return document.body.scrollHeight - window.innerHeight
	}

	/**
	 * Get horizontal trajectory of the viewport
	 * @method _getViewportWidth
	 * @returns {Number}
	 */
	_getViewportWidth = function() {
		return document.body.scrollWidth - window.innerWidth
	}

	/**
	 * Get scroll progress on both axis
	 * @method _getProgress
	 * @returns {Object}
	 */
	_getProgress = function() {
		var x = typeof window.scrollX === 'undefined' ? window.pageXOffset : window.scrollX
		var y = typeof window.scrollY === 'undefined' ? window.pageYOffset : window.scrollY

		return {
			x: this._viewportWidth === 0 ? 0 : x / this._viewportWidth,
			y: this._viewportHeight === 0 ? 0 : y / this._viewportHeight,
		}
	}

	/**
	 * Get scroll progress on both axis
	 * @method _getProgress
	 * @returns {undefined}
	 */
	_onScroll = function() {
		this._progress = this._getProgress()
		this._handleUpdate(this._progress.x, this._progress.y)
	}

	/**
	 * Update viewport metrics, recalculate progress and call update callback
	 * @method _onResize
	 * @returns {undefined}
	 */
	_onResize = function() {
		this._viewportHeight = this._getViewportHeight()
		this._viewportWidth = this._getViewportWidth()

		this._progress = this._getProgress()

		// trigger update function
		this._handleUpdate(this._progress.x, this._progress.y)
	}

	/**
	 * Trigger update callback
	 * @method trigger
	 * @returns {undefined}
	 */
	trigger = function() {
		this._handleUpdate(this._progress.x, this._progress.y)
	}

	/**
	 * Destroy scroll observer, remove listeners and update callback
	 * @method destroy
	 * @returns {undefined}
	 */
	destroy = function() {
		window.removeEventListener('scroll', this._onScroll)
		window.removeEventListener('resize', this._onResize)
		this._handleUpdate = null
	}
}

export default ScrollProgress
