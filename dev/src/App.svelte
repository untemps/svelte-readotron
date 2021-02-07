<script>
    import Readotron from '../../src'

    let contentPromise = null
    let areOptionsOpen = true
    let optionParagraphs = 15
    let readProgress = 0

    const getContent = async () => {
        try {
            const res = await fetch(`https://baconipsum.com/api/?type=all-meat&paras=${optionParagraphs}&format=html`)
            const text = await res.text()
            return text.replace(/<p>/, '<p class="headline">')
        } catch (err) {
            throw err;
        }
    }

    const onReadotronChange = ({detail: {time, words, progress}}) => {
        readProgress = progress
    }

    const onOptionsButtonClick = () => {
        areOptionsOpen = !areOptionsOpen
    }

    const onParagraphsChange = (event) => {
        optionParagraphs = event.target.value
        contentPromise = getContent()
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
    <aside class="options">
        <button class="options-btn" aria-label="Ouvrir" on:click={onOptionsButtonClick}><i class="gg-options"></i>
        </button>
        {#if areOptionsOpen}
            <h3>Settings</h3>
            <label for="paragraphs">Paragraphs: <strong>{optionParagraphs}</strong></label>
            <input id="paragraphs" type="range" min="5" max="50" step="5" value={optionParagraphs}
                   on:change={onParagraphsChange}>
        {/if}
    </aside>
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
        font-weight: 400;
        padding: 1em;
        margin: 0 auto;
    }
    @media (min-width: 640px) {
        :global(.root) {
            max-width: 50%;
            padding: 6em 1em 1em 1em;
        }
    }
    :global(.title) {
        font-family: Vollkorn, serif;
        color: #a3c428;
        font-size: 6em;
        font-weight: 600;
        font-style: italic;
        line-height: .95;
        margin: 0 0 0.3em 0;
    }
    :global(.options) {
        position: fixed;
        right: 20px;
        top: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: aliceblue;
        padding: .4em;
        box-shadow: -5px 5px 10px -5px rgba(0, 0, 0, 0.5);
        -webkit-box-shadow: -5px 5px 10px -5px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: -5px 5px 10px -5px rgba(0, 0, 0, 0.5);
    }
    :global(.options .options-btn) {
        background: none;
        border: none;
        color: black;
        padding: 2em;
        font-size: .4em;
        cursor: pointer;
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
        padding-bottom: 30px;
        margin-bottom: 30px;
    }
    :global(.progress-bar) {
        background-color: #0075ff;
        height: 10px;
        position: fixed;
        left: 0;
        bottom: 0;
    }
</style>
