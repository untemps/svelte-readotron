<script>
    import {onDestroy, onMount} from 'svelte'

    import ReadingTimer from '../core/ReadingTimer'
    import DOMWaiter from '../core/DOMWaiter'
    import interpolate from '../utils/interpolate'

    export let selector
    export let lang = 'en'
    export let template = '%time% min read'

    let time = 0
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
            time = timer.getTime(el.textContent, lang)
        } catch (err) {
            error = err.message
        }
    })

    onDestroy(() => {
        !!waiter && waiter.unwait()
    })
</script>

{#if $$slots.content}
    <slot name="content" {time}/>
{:else}
    <span data-testid='__readotron-root__' {...$$restProps}>
        {#if !!time && !!template}
            {interpolate(template, {time}, '%')}
        {/if}
        {#if !!error}
            {error}
        {/if}
    </span>
{/if}
