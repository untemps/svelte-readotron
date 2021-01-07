<script>
    import {onDestroy, onMount} from 'svelte'

    import ReadingTimer from '../core/ReadingTimer'
    import DOMWaiter from '../core/DOMWaiter'
    import interpolate from '../utils/interpolate'

    export let selector
    export let lang = 'en'
    export let template = '%time% min read'

    let readingTime = 0
    let wordCount = 0
    let error = null

    let waiter = null
    let timer = null

    onMount(async () => {
        if (!selector) {
            return
        }
        try {
            waiter = new DOMWaiter()
            const el = await waiter.wait(selector)

            timer = new ReadingTimer()
            readingTime = timer.getTime(el.textContent, lang)
        } catch (err) {
            error = err.message
        }
    })

    onDestroy(() => {
        !!waiter && waiter.unwait()
    })
</script>

<span {...$$restProps}>
    {#if !!readingTime && !!template}
        {interpolate(template, {time: readingTime}, '%')}
    {/if}
    {#if !!error}
        {error}
    {/if}
</span>
