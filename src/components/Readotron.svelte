<script>
    import {createEventDispatcher, onDestroy, onMount} from 'svelte'
    import {ReadPerMinute} from '@untemps/read-per-minute'
    import ScrollProgress from 'scrollprogress'

    import DOMWaiter from '../core/DOMWaiter'
    import interpolate from '../utils/interpolate'

    export let selector
    export let lang = 'en'
    export let template = '%time% min read'
    export let withScroll = false

    let totalTime = 0
    let time = 0
    let words = 0
    let rate = 0
    let error = null

    let domObserver = null
    let progressObserver = null

    const dispatch = createEventDispatcher()

    onMount(async () => {
        if (!selector) {
            return
        }
        try {
            domObserver = new DOMWaiter()
            const el = await domObserver.wait(selector)

            const rdm = new ReadPerMinute()
            ;({time, time: totalTime, words, rate} = rdm.parse(el.textContent, lang))

            if (withScroll) {
                const onScroll = (_, progress) => {
                    time = Math.max(Math.round(totalTime - totalTime * progress), 0)
                    words = Math.max(Math.round((totalTime - totalTime * progress) * rate), 0)
                    dispatch('scroll', {
                        time,
                        words,
                        progress
                    })
                }
                progressObserver = new ScrollProgress(onScroll)
            }
        } catch (err) {
            error = err.message
        }
    })

    onDestroy(() => {
        !!domObserver && domObserver.unwait()
        !!progressObserver && progressObserver.destroy()
    })
</script>

{#if $$slots.content}
    <slot name="content" {time} {words}/>
{:else}
    <span data-testid='__readotron-root__' {...$$restProps}>
        {#if !!template && !error}
            {interpolate(template, {time, words}, '%')}
        {/if}
        {#if !!error}
            {error}
        {/if}
    </span>
{/if}
