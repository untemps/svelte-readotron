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

<article class="root">
	<h1 class="title">Veggie Catharsis</h1>
	<div class="infos">
		<span>
			<span>By</span>
			<img
				class="avatar"
				src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"
				alt="Thomas Teack"
			/>
			<span class="name">Thomas Teack</span>
			<span>Oct 19, 2021</span>
		</span>
		{#await contentPromise then _}
			<Readotron selector=".text2" withScroll on:change={onReadotronChange}>
				<span class="readotron" slot="content" let:time let:words>{time} min read ({words} words)</span>
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
	.root {
		font-size: 1em;
		font-weight: 400;
		padding: 1em;
		margin: 0 auto;
	}
	@media (min-width: 640px) {
		.root {
			font-size: 2em;
			max-width: 70%;
			padding: 3em 1em 1em 1em;
		}
	}
	.title {
		font-family: Vollkorn, serif;
		color: #a3c428;
		font-size: 3em;
		font-weight: 600;
		font-style: italic;
		line-height: 0.95;
		margin: 0 0 0.6em 0;
	}
	@media (min-width: 800px) {
		.title {
			font-size: 4em;
		}
	}
	.infos {
		color: #aaa;
		display: flex;
		align-items: center;
		column-gap: 0.5em;
	}

	@media (min-width: 640px) {
		.infos {
			flex-direction: column;
			align-items: flex-start;
		}
	}
	.infos .avatar {
		display: none;
	}
	@media (min-width: 640px) {
		.infos .avatar {
			display: inline;
			width: 48px;
			border-radius: 50%;
			vertical-align: middle;
		}
	}
	.infos .name {
		color: #a3c428;
		font-weight: 600;
	}
	.infos .readotron {
		color: #0075ff;
		font-weight: 600;
	}
	.text {
		text-align: left;
		margin-top: 10px;
	}
	@media (min-width: 800px) {
		.text {
			margin-top: 30px;
		}
	}
	:global(.text p:first-child) {
		color: #666;
		border-bottom: 2px dotted #ddd;
		padding-bottom: 16px;
	}
	@media (min-width: 800px) {
		:global(.text > p:first-child) {
			padding-bottom: 30px;
		}
	}
	.loading {
		margin-top: 10px;
	}
	@media (min-width: 800px) {
		.loading {
			margin-top: 30px;
		}
	}
	.error {
		color: red;
		font-weight: 600;
	}
	.progress-bar {
		background-color: #0075ff;
		height: 10px;
		position: fixed;
		left: 0;
		bottom: 0;
	}
</style>
