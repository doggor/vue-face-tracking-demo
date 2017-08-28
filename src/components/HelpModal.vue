<template>
    <transition name="fade">
        <div id="helpModal" v-show="value" @click="close">
            <div class="modal-box">
                <h2>About</h2>
                <p>
                    FaceUP is a simple facial features tracker that demonstrates the use of cutting-edge web technologies.
                </p>
                <p>
                    It currently works only on the following browsers:
                    <ul>
                        <li>Chrome 53+</li>
                        <li>Firefox 38+</li>
                        <li>Opera 40+</li>
                        <li>Android Browser 53+</li>
                        <li>Chrome for Android 53+</li>
                        <li>Firefox Mobile 36+</li>
                        <li>Opera Mobile 40+</li>
                    </ul>
                </p>
                <p>Due to the limitations of vary hardwares and softwares, you are suggested to try it on Chrome for better performance.</p>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'helpModal',
    props: {
        'value': {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        close() {
            this.$emit('input', false)
        }
    }
}
</script>

<style>
#helpModal {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
    background-color: rgba(0, 0, 0, .7);
    padding: 8px;
    display: flex;
    align-content: center;
    justify-content: center;
}

#helpModal.fade-enter-active,
#helpModal.fade-leave-active,
#helpModal.fade-enter-active .modal-box,
#helpModal.fade-leave-active .modal-box {
    transition: all .5s;
}

#helpModal.fade-enter,
#helpModal.fade-leave-to {
    opacity: 0;
}

#helpModal.fade-enter .modal-box,
#helpModal.fade-leave-to .modal-box {
    transform: translateY(-50%);
}

.modal-box {
    margin: auto;
    padding: 16px;
    max-width: 500px;
    max-height: 500px;
    width: 100%;
    background-color: rgba(255, 255, 255, .9);
    color: #444;
    border-radius: 8px;
    box-shadow: 1px 2px 3px black;
}
</style>
