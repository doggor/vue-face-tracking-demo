<template>
    <div id="home">
        <Mirror></Mirror>
    </div>
</template>

<script>
import Mirror from './Mirror'

export default {
    name: 'HomePage',
    components: { Mirror },

}
</script>

<style>
#home {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: black;
    background: linear-gradient(to bottom right, #000, #aaa);
}
</style>
