
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global['svelte-readotron'] = factory());
}(this, (function () { 'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}var t,n,r,a=function(){function t(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t);}var n,r,a;return n=t,a=[{key:"isLangExist",value:function(e){return !!e&&!!t.rates[e]}}],(r=[{key:"parse",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"en";e||(e=""),t.isLangExist(n)||(n="default");var r=t.rates[n],a=e.trim().split(/\s+/).length;return {time:Math.ceil(a/r),words:a,rate:r}}}])&&e(n.prototype,r),a&&e(n,a),t}();t=a,n="rates",r=Object.freeze({default:200,ar:181,zh:260,nl:228,en:236,fi:195,fr:214,de:260,he:224,it:285,ko:226,es:278,sv:218}),n in t?Object.defineProperty(t,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[n]=r;

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var scrollProgress = createCommonjsModule(function (module, exports) {
    /* scrollprogress v3.0.2 - 2017 Jeremias Menichelli - MIT License */
    (function (global, factory) {
       module.exports = factory() ;
    }(commonjsGlobal, (function () {
      /**
       * Fallback noop function
       * @method noop
       * @returns {undefined}
       */
      function noop() {}

      /**
       * ScrollProgress class constructor
       * @constructor ScrollProgress
       * @param {Function} handleUpdate method to call on scroll update
       * @returns {undefined}
       */
      var ScrollProgress = function(handleUpdate) {
        // assign function to call on update
        this._handleUpdate = typeof handleUpdate === 'function'
          ? handleUpdate
          : noop;

        // set initial values
        this._viewportHeight = this._getViewportHeight();
        this._viewportWidth = this._getViewportWidth();

        this._progress = this._getProgress();

        // trigger initial update function
        this._handleUpdate(this._progress.x, this._progress.y);

        // bind event functions
        this._onScroll = this._onScroll.bind(this);
        this._onResize = this._onResize.bind(this);

        // add event listeners
        window.addEventListener('scroll', this._onScroll);
        window.addEventListener('resize', this._onResize);
      };

      /**
       * Get vertical trajectory of the viewport
       * @method _getViewportHeight
       * @returns {Number}
       */
      ScrollProgress.prototype._getViewportHeight = function() {
        return document.body.scrollHeight - window.innerHeight;
      };

      /**
       * Get horizontal trajectory of the viewport
       * @method _getViewportWidth
       * @returns {Number}
       */
      ScrollProgress.prototype._getViewportWidth = function() {
        return document.body.scrollWidth - window.innerWidth;
      };

      /**
       * Get scroll progress on both axis
       * @method _getProgress
       * @returns {Object}
       */
      ScrollProgress.prototype._getProgress = function() {
        var x = typeof window.scrollX === 'undefined'
          ? window.pageXOffset
          : window.scrollX;
        var y = typeof window.scrollY === 'undefined'
          ? window.pageYOffset
          : window.scrollY;

        return {
          x: this._viewportWidth === 0
            ? 0
            : x / this._viewportWidth,
          y: this._viewportHeight === 0
            ? 0
            : y / this._viewportHeight
        };
      };

      /**
       * Get scroll progress on both axis
       * @method _getProgress
       * @returns {undefined}
       */
      ScrollProgress.prototype._onScroll = function() {
        this._progress = this._getProgress();
        this._handleUpdate(this._progress.x, this._progress.y);
      };

      /**
       * Update viewport metrics, recalculate progress and call update callback
       * @method _onResize
       * @returns {undefined}
       */
      ScrollProgress.prototype._onResize = function() {
        this._viewportHeight = this._getViewportHeight();
        this._viewportWidth = this._getViewportWidth();

        this._progress = this._getProgress();

        // trigger update function
        this._handleUpdate(this._progress.x, this._progress.y);
      };

      /**
       * Trigger update callback
       * @method trigger
       * @returns {undefined}
       */
      ScrollProgress.prototype.trigger = function() {
        this._handleUpdate(this._progress.x, this._progress.y);
      };

      /**
       * Destroy scroll observer, remove listeners and update callback
       * @method destroy
       * @returns {undefined}
       */
      ScrollProgress.prototype.destroy = function() {
        window.removeEventListener('scroll', this._onScroll);
        window.removeEventListener('resize', this._onResize);
        this._handleUpdate = null;
      };

      return ScrollProgress;

    })));
    });

    class DOMWaiter {
    	_observer = null
    	_timeout = null

    	async wait(selector, timeout = 1000) {
    		return new Promise((resolve, reject) => {
    			const el = document.querySelector(selector);

    			if (el) {
    				resolve(el);
    			}

    			const error = new Error(`Error: Element ${selector} cannot be found`);
    			if (timeout > 0) {
    				this._timeout = setTimeout(() => {
    					this.unwait();
    					reject(error);
    				}, timeout);
    			} else {
    				reject(error);
    			}

    			this._observer = new MutationObserver((mutations) => {
    				mutations.forEach((mutation) => {
    					const nodes = Array.from(mutation.addedNodes);
    					for (let node of nodes) {
    						if (!!node.matches && node.matches(selector)) {
    							this.unwait();
    							resolve(node);
    							return
    						}
    					}
    				});
    			});

    			this._observer.observe(document.documentElement, { childList: true, subtree: true });
    		})
    	}

    	unwait() {
    		!!this._observer && this._observer.disconnect();
    		!!this._timeout && clearTimeout(this._timeout);
    	}
    }

    var interpolate = (str, tok, sep = '%') => {
    	if (!str) {
    		return null
    	}

    	sep = sep.replace(/([\[\^\$\.|\?\*\+\(\)])+/gm, (c) =>
    		c
    			.split('')
    			.map((i) => '\\' + i)
    			.join('')
    	);

    	return str.replace(new RegExp(`${sep}([^${sep}]+\\b)${sep}`, 'gm'), (_, r) =>
    		!!tok && tok[r] !== null && tok[r] !== undefined ? tok[r] : r
    	)
    };

    /* node_modules/@untemps/svelte-readotron/src/components/Readotron.svelte generated by Svelte v3.32.1 */

    const get_content_slot_changes = dirty => ({
    	time: dirty & /*time*/ 2,
    	words: dirty & /*words*/ 4
    });

    const get_content_slot_context = ctx => ({
    	time: /*time*/ ctx[1],
    	words: /*words*/ ctx[2]
    });

    // (61:0) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t;
    	let if_block0 = !!/*template*/ ctx[0] && !/*error*/ ctx[3] && create_if_block_2(ctx);
    	let if_block1 = !!/*error*/ ctx[3] && create_if_block_1(ctx);
    	let span_levels = [{ "data-testid": "__readotron-root__" }, /*$$restProps*/ ctx[5]];
    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	return {
    		c() {
    			span = element("span");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			set_attributes(span, span_data);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block0) if_block0.m(span, null);
    			append(span, t);
    			if (if_block1) if_block1.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (!!/*template*/ ctx[0] && !/*error*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(span, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!!/*error*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(span, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				{ "data-testid": "__readotron-root__" },
    				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(span);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    // (59:0) {#if $$slots.content}
    function create_if_block(ctx) {
    	let current;
    	const content_slot_template = /*#slots*/ ctx[10].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[9], get_content_slot_context);

    	return {
    		c() {
    			if (content_slot) content_slot.c();
    		},
    		m(target, anchor) {
    			if (content_slot) {
    				content_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (content_slot) {
    				if (content_slot.p && dirty & /*$$scope, time, words*/ 518) {
    					update_slot(content_slot, content_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_content_slot_changes, get_content_slot_context);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(content_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(content_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (content_slot) content_slot.d(detaching);
    		}
    	};
    }

    // (63:8) {#if !!template && !error}
    function create_if_block_2(ctx) {
    	let t_value = interpolate(
    		/*template*/ ctx[0],
    		{
    			time: /*time*/ ctx[1],
    			words: /*words*/ ctx[2]
    		},
    		"%"
    	) + "";

    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*template, time, words*/ 7 && t_value !== (t_value = interpolate(
    				/*template*/ ctx[0],
    				{
    					time: /*time*/ ctx[1],
    					words: /*words*/ ctx[2]
    				},
    				"%"
    			) + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (66:8) {#if !!error}
    function create_if_block_1(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*error*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*error*/ 8) set_data(t, /*error*/ ctx[3]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$$slots*/ ctx[4].content) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	const omit_props_names = ["selector","lang","template","withScroll"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const $$slots = compute_slots(slots);
    	let { selector } = $$props;
    	let { lang = "en" } = $$props;
    	let { template = "%time% min read" } = $$props;
    	let { withScroll = false } = $$props;
    	let totalTime = 0;
    	let time = 0;
    	let words = 0;
    	let rate = 0;
    	let error = null;
    	let domObserver = null;
    	let progressObserver = null;
    	const dispatch = createEventDispatcher();

    	onMount(async () => {
    		if (!selector) {
    			return;
    		}

    		try {
    			domObserver = new DOMWaiter();
    			const el = await domObserver.wait(selector);
    			const rdm = new a();
    			$$invalidate(1, { time, time: totalTime, words, rate } = rdm.parse(el.textContent, lang), time, $$invalidate(2, words));

    			if (withScroll) {
    				const onScroll = (_, progress) => {
    					$$invalidate(1, time = Math.max(Math.round(totalTime - totalTime * progress), 0));
    					$$invalidate(2, words = Math.max(Math.round((totalTime - totalTime * progress) * rate), 0));
    					dispatch("change", { time, words, progress });
    				};

    				progressObserver = new scrollProgress(onScroll);
    			}
    		} catch(err) {
    			$$invalidate(3, error = err.message);
    		}
    	});

    	onDestroy(() => {
    		!!domObserver && domObserver.unwait();
    		!!progressObserver && progressObserver.destroy();
    	});

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("selector" in $$new_props) $$invalidate(6, selector = $$new_props.selector);
    		if ("lang" in $$new_props) $$invalidate(7, lang = $$new_props.lang);
    		if ("template" in $$new_props) $$invalidate(0, template = $$new_props.template);
    		if ("withScroll" in $$new_props) $$invalidate(8, withScroll = $$new_props.withScroll);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	return [
    		template,
    		time,
    		words,
    		error,
    		$$slots,
    		$$restProps,
    		selector,
    		lang,
    		withScroll,
    		$$scope,
    		slots
    	];
    }

    class Readotron extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			selector: 6,
    			lang: 7,
    			template: 0,
    			withScroll: 8
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.1 */

    function create_catch_block_1(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    // (37:38)              <Readotron selector=".text" withScroll                        on:change={onReadotronChange}
    function create_then_block_1(ctx) {
    	let readotron;
    	let current;

    	readotron = new Readotron({
    			props: {
    				selector: ".text",
    				withScroll: true,
    				$$slots: {
    					default: [create_default_slot],
    					error: [
    						create_error_slot,
    						({ error }) => ({ 11: error }),
    						({ error }) => error ? 2048 : 0
    					],
    					content: [
    						create_content_slot,
    						({ time, words }) => ({ 12: time, 13: words }),
    						({ time, words }) => (time ? 4096 : 0) | (words ? 8192 : 0)
    					]
    				},
    				$$scope: { ctx }
    			}
    		});

    	readotron.$on("change", /*onReadotronChange*/ ctx[4]);

    	return {
    		c() {
    			create_component(readotron.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(readotron, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const readotron_changes = {};

    			if (dirty & /*$$scope, words, time*/ 28672) {
    				readotron_changes.$$scope = { dirty, ctx };
    			}

    			readotron.$set(readotron_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(readotron.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(readotron.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(readotron, detaching);
    		}
    	};
    }

    // (40:16) <span class="readotron" slot="content" let:time let:words>
    function create_content_slot(ctx) {
    	let span;
    	let t0_value = /*time*/ ctx[12] + "";
    	let t0;
    	let t1;
    	let t2_value = /*words*/ ctx[13] + "";
    	let t2;
    	let t3;

    	return {
    		c() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" min read (");
    			t2 = text(t2_value);
    			t3 = text(" words)");
    			attr(span, "class", "readotron");
    			attr(span, "slot", "content");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t0);
    			append(span, t1);
    			append(span, t2);
    			append(span, t3);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*time*/ 4096 && t0_value !== (t0_value = /*time*/ ctx[12] + "")) set_data(t0, t0_value);
    			if (dirty & /*words*/ 8192 && t2_value !== (t2_value = /*words*/ ctx[13] + "")) set_data(t2, t2_value);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (41:16) <span class="error" slot="error" let:error>
    function create_error_slot(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			span.textContent = "Oops";
    			attr(span, "class", "error");
    			attr(span, "slot", "error");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (38:12) <Readotron selector=".text" withScroll                        on:change={onReadotronChange}>
    function create_default_slot(ctx) {
    	let t;

    	return {
    		c() {
    			t = space();
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (1:0) <script>     import Readotron from '@untemps/svelte-readotron'      let contentPromise = null     let areOptionsOpen = true     let optionParagraphs = 15     let readProgress = 0     const getContent = async () => {         try {             const res = await fetch(`https://baconipsum.com/api/?type=all-meat&paras=${optionParagraphs}
    function create_pending_block_1(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    // (48:8) {#if areOptionsOpen}
    function create_if_block$1(ctx) {
    	let h3;
    	let t1;
    	let label;
    	let t2;
    	let strong;
    	let t3;
    	let t4;
    	let input;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			h3 = element("h3");
    			h3.textContent = "Settings";
    			t1 = space();
    			label = element("label");
    			t2 = text("Paragraphs: ");
    			strong = element("strong");
    			t3 = text(/*optionParagraphs*/ ctx[2]);
    			t4 = space();
    			input = element("input");
    			attr(label, "for", "paragraphs");
    			attr(input, "id", "paragraphs");
    			attr(input, "type", "range");
    			attr(input, "min", "5");
    			attr(input, "max", "50");
    			attr(input, "step", "5");
    			input.value = /*optionParagraphs*/ ctx[2];
    		},
    		m(target, anchor) {
    			insert(target, h3, anchor);
    			insert(target, t1, anchor);
    			insert(target, label, anchor);
    			append(label, t2);
    			append(label, strong);
    			append(strong, t3);
    			insert(target, t4, anchor);
    			insert(target, input, anchor);

    			if (!mounted) {
    				dispose = listen(input, "change", /*onParagraphsChange*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*optionParagraphs*/ 4) set_data(t3, /*optionParagraphs*/ ctx[2]);

    			if (dirty & /*optionParagraphs*/ 4) {
    				input.value = /*optionParagraphs*/ ctx[2];
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(h3);
    			if (detaching) detach(t1);
    			if (detaching) detach(label);
    			if (detaching) detach(t4);
    			if (detaching) detach(input);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (60:8) {:catch err}
    function create_catch_block(ctx) {
    	let div;
    	let t_value = /*err*/ ctx[9].message + "";
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(t_value);
    			attr(div, "class", "error");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*contentPromise*/ 1 && t_value !== (t_value = /*err*/ ctx[9].message + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (58:8) {:then content}
    function create_then_block(ctx) {
    	let div;
    	let raw_value = /*content*/ ctx[8] + "";

    	return {
    		c() {
    			div = element("div");
    			attr(div, "class", "text");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*contentPromise*/ 1 && raw_value !== (raw_value = /*content*/ ctx[8] + "")) div.innerHTML = raw_value;		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (56:31)              <div class="loading">Loading...</div>         {:then content}
    function create_pending_block(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			div.textContent = "Loading...";
    			attr(div, "class", "loading");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let article;
    	let h1;
    	let t1;
    	let div0;
    	let span0;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let span1;
    	let t6;
    	let span2;
    	let t8;
    	let promise;
    	let t9;
    	let aside;
    	let button;
    	let t10;
    	let t11;
    	let section;
    	let promise_1;
    	let t12;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_1,
    		value: 10,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*contentPromise*/ ctx[0], info);
    	let if_block = /*areOptionsOpen*/ ctx[1] && create_if_block$1(ctx);

    	let info_1 = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 8,
    		error: 9
    	};

    	handle_promise(promise_1 = /*contentPromise*/ ctx[0], info_1);

    	return {
    		c() {
    			article = element("article");
    			h1 = element("h1");
    			h1.textContent = "Veggie Catharsis";
    			t1 = space();
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "By";
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "Thomas Teack";
    			t6 = space();
    			span2 = element("span");
    			span2.textContent = "Oct 19, 2021";
    			t8 = space();
    			info.block.c();
    			t9 = space();
    			aside = element("aside");
    			button = element("button");
    			button.innerHTML = `<i class="gg-options"></i>`;
    			t10 = space();
    			if (if_block) if_block.c();
    			t11 = space();
    			section = element("section");
    			info_1.block.c();
    			t12 = space();
    			div1 = element("div");
    			attr(h1, "class", "title");
    			attr(img, "class", "avatar");
    			if (img.src !== (img_src_value = "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50")) attr(img, "src", img_src_value);
    			attr(img, "alt", "Thomas Teack");
    			attr(span1, "class", "name");
    			attr(div0, "class", "infos");
    			attr(button, "class", "options-btn");
    			attr(button, "aria-label", "Ouvrir");
    			attr(aside, "class", "options");
    			attr(section, "class", "content");
    			attr(div1, "class", "progress-bar");
    			set_style(div1, "width", /*readProgress*/ ctx[3] * 100 + "%");
    			attr(article, "class", "root");
    		},
    		m(target, anchor) {
    			insert(target, article, anchor);
    			append(article, h1);
    			append(article, t1);
    			append(article, div0);
    			append(div0, span0);
    			append(div0, t3);
    			append(div0, img);
    			append(div0, t4);
    			append(div0, span1);
    			append(div0, t6);
    			append(div0, span2);
    			append(div0, t8);
    			info.block.m(div0, info.anchor = null);
    			info.mount = () => div0;
    			info.anchor = null;
    			append(article, t9);
    			append(article, aside);
    			append(aside, button);
    			append(aside, t10);
    			if (if_block) if_block.m(aside, null);
    			append(article, t11);
    			append(article, section);
    			info_1.block.m(section, info_1.anchor = null);
    			info_1.mount = () => section;
    			info_1.anchor = null;
    			append(article, t12);
    			append(article, div1);
    			current = true;

    			if (!mounted) {
    				dispose = listen(button, "click", /*onOptionsButtonClick*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*contentPromise*/ 1 && promise !== (promise = /*contentPromise*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[10] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (/*areOptionsOpen*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(aside, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			info_1.ctx = ctx;

    			if (dirty & /*contentPromise*/ 1 && promise_1 !== (promise_1 = /*contentPromise*/ ctx[0]) && handle_promise(promise_1, info_1)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[8] = child_ctx[9] = info_1.resolved;
    				info_1.block.p(child_ctx, dirty);
    			}

    			if (!current || dirty & /*readProgress*/ 8) {
    				set_style(div1, "width", /*readProgress*/ ctx[3] * 100 + "%");
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(article);
    			info.block.d();
    			info.token = null;
    			info = null;
    			if (if_block) if_block.d();
    			info_1.block.d();
    			info_1.token = null;
    			info_1 = null;
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let contentPromise = null;
    	let areOptionsOpen = true;
    	let optionParagraphs = 15;
    	let readProgress = 0;

    	const getContent = async () => {
    		try {
    			const res = await fetch(`https://baconipsum.com/api/?type=all-meat&paras=${optionParagraphs}&format=html`);
    			const text = await res.text();
    			return text.replace(/<p>/, "<p class=\"headline\">");
    		} catch(err) {
    			throw err;
    		}
    	};

    	const onReadotronChange = ({ detail: { time, words, progress } }) => {
    		$$invalidate(3, readProgress = progress);
    	};

    	const onOptionsButtonClick = () => {
    		$$invalidate(1, areOptionsOpen = !areOptionsOpen);
    	};

    	const onParagraphsChange = event => {
    		$$invalidate(2, optionParagraphs = event.target.value);
    		$$invalidate(0, contentPromise = getContent());
    	};

    	contentPromise = getContent();

    	return [
    		contentPromise,
    		areOptionsOpen,
    		optionParagraphs,
    		readProgress,
    		onReadotronChange,
    		onOptionsButtonClick,
    		onParagraphsChange
    	];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
    	}
    }

    var app = new App({
      target: document.body
    });

    return app;

})));
