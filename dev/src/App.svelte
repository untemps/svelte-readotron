<script>
    import Readotron from '../../src'

    let contentPromise = null
    let numParagraphs = 15
    let readProgress = 0

    const getContent = async () => {
        try {
            const res = await fetch(`https://baconipsum.com/api/?type=all-meat&paras=${numParagraphs}&format=html`)
            const text = await res.text()
            return text.replace(/<p>/, '<p class="headline">')
        } catch (err) {
            throw err;
        }
    }

    const onReadotronChange = ({detail: {time, words, progress}}) => {
        readProgress = progress
    }

    contentPromise = getContent()
</script>

<article class="root">
    <h1 class="title">Veggie Catharsis</h1>
    <div class="infos">
        <span>By</span>
        <img class="avatar" src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50" alt="Thomas Teack">
        <span class="name">Thomas Teack</span>
        <span>Oct 19, 2021</span>
        {#await contentPromise then _}
            <Readotron selector=".text" withScroll
                       on:change={onReadotronChange}>
                <span class="readotron" slot="content" let:time let:words>{time} min read ({words} words)</span>
                <span class="error" slot="error" let:error>Oops</span>
            </Readotron>
        {/await}
    </div>
    <section class="content">
        {#await contentPromise}
            <div class="loading">Loading...</div>
        {:then content}
            <div class="text">{@html content}</div>
        {:catch err}
            <div class="error">{err.message}</div>
        {/await}
    </section>
    <div class="progress-bar" style="width: {readProgress * 100}%"></div>
</article>

<style>
    :global(.root) {
        font-size: 1em;
        font-weight: 400;
        padding: 1em;
        margin: 0 auto;
    }
    @media (min-width: 640px) {
        :global(.root) {
            font-size: 2em;
			max-width: 70%;
            padding: 3em 1em 1em 1em;
        }
    }
    :global(.title) {
        font-family: Vollkorn, serif;
        color: #a3c428;
        font-size: 3em;
        font-weight: 600;
        font-style: italic;
        line-height: .95;
        margin: 0 0 .6em 0;
    }
    @media (min-width: 800px) {
        :global(.title) {
            font-size: 6em;
        }
    }
    :global(.infos) {
        color: #aaa;
    }
    :global(.infos *) {
        margin-right: .5em;
    }
    :global(.infos .avatar) {
        display: none;
    }
    @media (min-width: 640px) {
        :global(.infos .avatar) {
            display: inline;
            width: 48px;
            border-radius: 50%;
            vertical-align: middle;
        }
    }
    :global(.infos .name) {
        color: #a3c428;
        font-weight: 600;
    }
    :global(.infos .readotron) {
        color: #0075ff;
        font-weight: 600;
    }
    :global(.text) {
        text-align: left;
    }
    :global(.text .headline) {
        color: #666;
        border-bottom: 2px dotted #ddd;
        padding-bottom: 10px;
        margin-bottom: 10px;
    }
    @media (min-width: 800px) {
        :global(.text .headline) {
            padding-bottom: 30px;
            margin-bottom: 30px;
        }
    }
    :global(.error) {
        color: red;
        font-weight: 600;
    }
    :global(.progress-bar) {
        background-color: #0075ff;
        height: 10px;
        position: fixed;
        left: 0;
        bottom: 0;
    }
</style>
