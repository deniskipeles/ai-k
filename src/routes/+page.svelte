<script>
	//import { useChat } from 'ai/svelte'

	//const { input, handleSubmit, messages } = useChat()
	import MagicTextareaSvelte from "$lib/MagicTextarea.svelte";
	let value=""
  let options = {
    textareaClass: "my-textarea-class",
    inputClass: "my-input-class",
    submitButtonClass: "my-submit-button-class",
    divContainerClass: "my-container-class",
    divHeaderClass: "my-header-class",
    divFooterClass: "my-footer-class",
    url: "/api/completion"
  };
</script>

<svelte:head>
	<title>MagicTextarea</title>
	<meta name="description" content="svelte magic textarea" />
</svelte:head>

<section>
	<h1>MagicTextarea in Action</h1>
	<h4>MagicTextarea was inspired by react magic-spell</h4>
	<MagicTextarea bind:value {...options} />
	<!--
	<ul>
		{#each $messages as message}
			<li>{message.role}: {message.content}</li>
		{/each}
	</ul>
	<form on:submit={handleSubmit}>
		<input bind:value={$input} />
		<button type="submit">Send</button>
	</form>
	-->
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>
