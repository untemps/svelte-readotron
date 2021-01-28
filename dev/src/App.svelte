<script>
    import Readotron from '../../src'

    let contentP = ''
    let paragraphCount = 15
    let readProgress = 0

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
            <Readotron class="readotron" selector=".text"
                       template="%time% minutes (%words% words)" withScroll on:change={({detail: {time, words, progress}}) => readProgress = progress}/>
        {/await}
    </div>
    <section class="options">
        <h3>Settings</h3>
        <label for="paragraphCount">Paragraph Count</label>
        <input id="paragraphCount" type="range" min="5" max="50" step="5" value={paragraphCount}
               on:change={onParagraphCountChange}>
        <span>{paragraphCount}</span>
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
    <div class="progress-bar" style="width: {readProgress * 100}%"></div>
</main>

<style>
    main {
        font-family: Rubik, sans-serif;
        font-size: 2em;
        font-weight: 400;
        padding: 1em;
        max-width: 85%;
        margin: 0 auto;
    }

    h1 {
        font-family: Vollkorn, serif;
        color: #a3c428;
        font-size: 6em;
        font-weight: 600;
        font-style: italic;
    }

    .infos {
        color: #aaa;
    }

    .infos .avatar {
        width: 48px;
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
        position: fixed;
        right: 20px;
        top: 20px;
        font-size: 0.5em;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: aliceblue;
        padding: 30px 20px;
    }

    .options span {
        font-size: 3em;
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
        color: #666;
    }

    .progress-bar {
        background-color: #0075ff;
        height: 20px;
        position: fixed;
        left: 0;
        bottom: 0;
    }

    @media (min-width: 640px) {
        main {
            max-width: 70%;
        }
    }
</style>
