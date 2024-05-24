
<!--Preview component-->
<script>
	import { createEventDispatcher, onMount } from 'svelte';
	
	export let markdown;
	let marked;
	const dispatch = createEventDispatcher();

	$: if (marked) {
		markdown = marked.parse(markdown)
	}
	
	onMount(()=>{
		loadMarked()
		loadMathjax()
	})
	const loadMarked = () => {
		let script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.umd.min.js";
    document.head.append(script);
		
		script.onload = () => {
      marked = window.marked.marked
			console.log("marked loaded")
		};
	}
	const loadMathjax = () => {
		let script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
    document.head.append(script);
		
		script.onload = () => {
      MathJax = {
        tex: {inlineMath: [['$', '$'], ['\\(', '\\)']]},
        svg: {fontCache: 'global'}
      };
		};
		console.log("mathjax loaded")
	}
</script>

<div class="m-2">
  <div class="overflow-x scroll">
		 {@html markdown}
	</div>
</div>
	