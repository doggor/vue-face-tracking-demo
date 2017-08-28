<template>
    <div id="app">
        <TheHeader/>
        <main>
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
import TheHeader from './components/TheHeader'

export default {
    name: 'app',
    components: { TheHeader },
}
</script>

<style>
body {
    box-sizing: border-box;
    margin: 0;
}

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}

main {
    text-align: center;
}
</style>
