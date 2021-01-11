<script>
    import Readotron from '../../src'

    let contentP = ''
    let paragraphCount = 15

    const getContent = async () => {
        try {
            const res = await fetch(`https://baconipsum.com/api/?type=all-meat&paras=${paragraphCount}&format=html`)
            const text = await res.text()
            return text.replace(/<p>/, '<p class="headline">')
        } catch (err) {
            throw err;
        }
    }

    const onParagraphCountChange = (event) => {
        paragraphCount = event.target.value
        contentP = getContent()
    }

    contentP = getContent()
</script>

<main>
    <h1>Veggie Catharsis</h1>
    <div class="infos">By <img class="avatar" src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"
                               alt="Thomas Teack"><span class="name">Thomas Teack</span> Oct 19, 2021 -
        {#await contentP then _}
            <Readotron class="readotron" selector=".text">
                <span slot="content" let:time>{time} min</span>
            </Readotron>
        {/await}
    </div>
    <section class="options">
        <label for="paragraphCount">Paragraph Count: {paragraphCount}</label>
        <input id="paragraphCount" type="range" min="5" max="50" step="5" value={paragraphCount}
               on:change={onParagraphCountChange}>
    </section>
    <section class="content">
        {#await contentP}
            <div class="loading">Loading...</div>
        {:then content}
            <div class="text">{@html content}</div>
        {:catch err}
            <div class="error">{err.message}</div>
        {/await}
    </section>
</main>

<style>
    main {
        font-family: Vollkorn, serif;
        font-size: 14px;
        font-weight: 400;
        padding: 1em;
        max-width: 85%;
        margin: 0 auto;
    }

    h1 {
        color: #a3c428;
        font-size: 6em;
        font-weight: 600;
        font-style: italic;
    }

    .infos {
        color: #aaa;
    }

    .infos .avatar {
        width: 24px;
        border-radius: 50%;
        vertical-align: middle;
        margin-right: 4px;
    }

    .infos .name {
        color: #a3c428;
        font-weight: 600;
    }

    :global(.infos .readotron) {
        color: #0075ff;
        font-weight: 600;
    }

    .options {
        position: absolute;
        right: 20px;
        top: 130px;
    }

    .content {
        margin-top: 40px;
    }

    .loading {

    }

    .text {
        text-align: left;
    }

    :global(.text .headline) {
        font-size: 1.7em;
        color: #666;
    }

    @media (min-width: 640px) {
        main {
            max-width: 70%;
        }
    }
</style>