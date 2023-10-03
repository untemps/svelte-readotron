<script>
	import { onMount } from 'svelte'

	import Readotron from '../lib'

	let contentPromise = ''
	let numParagraphs = 15
	let readProgress = 0

	onMount(() => {
		contentPromise = getContent()
	})

	const getContent = async () => {
		try {
			const res = await fetch(`https://baconipsum.com/api/?type=all-meat&paras=${numParagraphs}&format=html`)
			return await res.text()
		} catch (err) {
			throw err
		}
	}

	const onReadotronChange = ({ detail: { time, words, progress } }) => {
		readProgress = progress
	}
</script>

<article class="content">
	<h1 class="content__title">Veggie Catharsis</h1>
	<div class="content__infos">
		<img
			class="content__infos__avatar"
			src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"
			alt="Thomas Teack"
		/>
		<span class="content__infos__name-and-date">
			<span class="content__infos__name">Thomas Teack</span>
			<span>•</span>
			<span>Oct 19, 2021</span>
		</span>
		{#await contentPromise then _}
			<Readotron
				class="content__infos__readotron"
				selector=".content__article__text"
				withScroll
				on:change={onReadotronChange}
			>
				<span class="content__infos__readotron" slot="content" let:time let:words
					>{time} min read ({words} words)</span
				>
			</Readotron>
		{/await}
	</div>
	<section class="content__article">
		{#await contentPromise}
			<div class="content__article__loading">Loading...</div>
		{:then content}
			<div class="content__article__text">{@html content}</div>
		{:catch err}
			<div class="content__article__error">{err.message}</div>
		{/await}
	</section>
	<div class="content__progress-bar" style="width: {readProgress * 100}%"></div>
</article>

<style>
	.content {
		font-size: 1em;
		font-weight: 400;
		width: 90%;
		padding: 2em;
	}
	@media (min-width: 640px) {
		.content {
			font-size: 2em;
			max-width: 800px;
		}
	}

	.content__title {
		font-family: Vollkorn, serif;
		color: #a3c428;
		font-size: 3em;
		font-weight: 600;
		font-style: italic;
		line-height: 0.95;
		margin: 0 0 0.3em 0;
	}
	@media (min-width: 800px) {
		.content__title {
			font-size: 4em;
		}
	}

	.content__infos {
		color: #aaa;
		display: grid;
		grid-template-columns: 36px 1fr;
		grid-template-rows: repeat(2, minmax(22px, auto));
		gap: 0px 8px;
		align-items: center;
	}
	@media (min-width: 640px) {
		.content__infos {
			grid-template-columns: 64px 1fr;
			grid-template-rows: repeat(2, minmax(38px, auto));
			gap: 0px 16px;
		}
	}

	:global(.content__infos__avatar) {
		width: 100%;
		border-radius: 50%;
		grid-row-start: 1;
		grid-column-start: 1;
		grid-row-end: 3;
		grid-column-end: 2;
	}

	@media (min-width: 640px) {
		.content__infos__name-and-date {
			grid-row-start: 1;
			grid-column-start: 2;
			grid-row-end: 2;
			grid-column-end: 3;
		}
	}

	.content__infos__name {
		color: #a3c428;
		font-weight: 600;
	}

	:global(.content__infos__readotron) {
		color: #0075ff;
		font-weight: 600;
		grid-row-start: 2;
		grid-column-start: 2;
		grid-row-end: 3;
		grid-column-end: 3;
	}

	.content__article {
		text-align: left;
		margin-top: 10px;
		padding-bottom: 20px;
	}
	@media (min-width: 800px) {
		.content__article {
			margin-top: 30px;
		}
	}

	:global(.content__article p:first-child) {
		color: #666;
		border-bottom: 2px dotted #ddd;
		padding-bottom: 16px;
	}
	@media (min-width: 800px) {
		:global(.content__article p:first-child) {
			padding-bottom: 30px;
		}
	}

	.content__article__loading {
		margin-top: 10px;
	}
	@media (min-width: 800px) {
		.content__article__loading {
			margin-top: 30px;
		}
	}

	.content__article__error {
		color: red;
		font-weight: 600;
	}

	.content__progress-bar {
		background-color: #0075ff;
		height: 10px;
		position: fixed;
		left: 0;
		bottom: 0;
	}
</style>
