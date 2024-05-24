<script>
	import './styles.css';
	import {onMount} from "svelte"
	
	const loadEruda = () => {
		let script = document.createElement('script');
    script.src = "//cdn.jsdelivr.net/npm/eruda"
    document.head.append(script);
		script.onload = () => {
      window.eruda.init();
		};
	};
	onMount(() => {
	  //loadEruda()
	})
</script>

<div class="app">
	<main>
		<slot />
	</main>

	<footer>
		<p>get source at <a href="https://github.com/deniskipeles/ai-k/tree/15c49c9a258c0be5fc568264b64857f5bd0cc076/src/lib">github</a> or <a href="https://svelte.dev/repl/85fd6ad094b940a3bc7d40c98cb5b10a?version=4.2.17">repl</a> to use</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
