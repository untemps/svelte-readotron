<script>
    export let component;
</script>

<svelte:component this={component} {...$$restProps}>
    <span data-testid="__readotron-error__" slot="error">Oops</span>
</svelte:component>