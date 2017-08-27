<template>
    <header>
        <a href="https://www.breakloop.cc/">
            <img src="../assets/brand-logo.png" alt="Break Loop">
        </a>
        <button class="help-btn" @click="showHelp = true">
            <span>?</span>
        </button>
        <HelpModal v-model="showHelp" />
    </header>
</template>

<script>
import HelpModal from './HelpModal'

export default {
    name: 'TheHeader',
    components: { HelpModal },
    data() {
        return {
            showHelp: false,
        }
    }
}
</script>

<style>
header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3rem;
    z-index: 99;
}

header img {
    height: 3rem;
    font-family: "Comic Sans MS", cursive, sans-serif;
}

header .help-btn {
    float: right;
    margin: .5rem;
    padding: 0 .5rem;
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
    border: 1px solid white;
    border-radius: 50%;
    color: white;
    background-color: transparent;
}

@media screen and (max-width: 532px) {
    header .help-btn {
        background-color: rgba(0, 0, 0, .4);
    }
}
</style>

