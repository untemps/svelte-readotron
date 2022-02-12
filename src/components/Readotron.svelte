<script>
    import {createEventDispatcher, onDestroy, onMount} from 'svelte'
    import {ReadPerMinute} from '@untemps/read-per-minute'
    import {DOMObserver} from '@untemps/dom-observer'

	import interpolate from '../utils/interpolate'
	import isFunction from '../utils/isFunction'

    import ScrollProgress from '../scroll/ScrollProgress'

    export let selector
    export let lang = 'en'
    export let template = '%time% min read'
    export let withScroll = false

    let totalTime = 0
    let time = 0
    let words = 0
    let rate = 0
    let isParsed = false
    let error = null
    let empty = 'No content to parse'

    let domObserver = null
    let progressObserver = null

    const dispatch = createEventDispatcher()

    onMount(async () => {
        if (!selector) {
            return
        }
        try {
            domObserver = new DOMObserver()
            const { node: el } = await domObserver.wait(selector, null, {timeout: 1000})

            const rdm = new ReadPerMinute()
            ;({time, time: totalTime, words, rate} = rdm.parse(el.textContent, lang))

            if (withScroll) {
                progressObserver = new ScrollProgress((_, progress) => {
	                time = Math.max(Math.round(totalTime - totalTime * progress), 0)
	                words = Math.max(Math.round((totalTime - totalTime * progress) * rate), 0)
	                dispatch('change', {
		                time,
		                words,
		                progress
	                })
                })
            }

            isParsed = true
        } catch (err) {
            error = err.message
        }
    })

    onDestroy(() => {
        domObserver?.clear()
        progressObserver?.destroy()
    })
</script>

{#if $$slots.error && !!error}
    <slot name="error" {error}/>
{:else if $$slots.content && !error && isParsed}
    <slot name="content" {time} {words}/>
{:else}
    <span data-testid='__readotron-root__' {...$$restProps}>
        {#if !!error}
            {error}
        {:else if isParsed}
			{#if isFunction(template)}
				{@html template(time, words)}
			{:else}
				{interpolate(template, {time, words}, '%')}
			{/if}
		{:else}
			{empty}
        {/if}
    </span>
{/if}
