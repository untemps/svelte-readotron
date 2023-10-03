<script>
    export let component;
</script>

<svelte:component this={component} {...$$restProps}>
    <span data-testid="__readotron-content__" slot="content">Foo</span>
</svelte:component>