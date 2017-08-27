<template>
    <div id="home">
        <div class="mirror-container">
            <Mirror></Mirror>
        </div>
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
    position: relative;
}

.mirror-container {
    border-radius: 10px;
}
</style>
