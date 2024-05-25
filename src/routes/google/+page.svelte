<script>
	import { useCompletion } from 'ai/svelte'

  const { completion, input, isLoading, handleSubmit, data } = useCompletion({
    api:"/api/completion/google",
    onFinish: (prompt, completion) => $input="",
		onError: (error) => console.log(error.message),
  });
	import MagicTextarea from "$lib/MagicTextarea.svelte";
	let value=""
  let options = {
    textareaClass: "my-textarea-class",
    inputClass: "my-input-class",
    submitButtonClass: "my-submit-button-class",
    divContainerClass: "my-container-class",
    divHeaderClass: "my-header-class",
    divFooterClass: "my-footer-class",
  };
  $:if($completion) value = $completion
  //let isLoading = $isLoading
</script>

<svelte:head>
	<title>Magic textarea gemini</title>
	<meta name="description" content="svelte textarea with super powers" />
</svelte:head>

<section>
	<h1>MagicTextarea in Action(using google gemini)</h1>
	<h4>MagicTextarea was inspired by react magic-spell</h4>
	<!--
	this MagicTextarea uses svelte ai sdk
	-->
	<MagicTextarea bind:value bind:inputText={$input} isLoading={$isLoading} {handleSubmit} {...options} />
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
