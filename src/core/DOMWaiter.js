class DOMWaiter {
	_observer = null
	_timeout = null

	async wait(selector, timeout = 1000) {
		return new Promise((resolve, reject) => {
			const el = document.querySelector(selector)

			if (el) {
				resolve(el)
			}

			const error = new Error(`Error: Element ${selector} cannot be found`)
			if (timeout > 0) {
				this._timeout = setTimeout(() => {
					this.unwait()
					reject(error)
				}, timeout)
			} else {
				reject(error)
			}

			this._observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					const nodes = Array.from(mutation.addedNodes)
					for (let node of nodes) {
						if (!!node.matches && node.matches(selector)) {
							this.unwait()
							resolve(node)
							return
						}
					}
				})
			})

			this._observer.observe(document.documentElement, { childList: true, subtree: true })
		})
	}

	unwait() {
		!!this._observer && this._observer.disconnect()
		!!this._timeout && clearTimeout(this._timeout)
	}
}

export default DOMWaiter
