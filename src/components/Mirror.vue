<template>
    <div id="mirror" :style="mirrorStyle">
        <video id="videoEle" ref="videoEle" :width="mirrorWidth" :height="mirrorHeight"></video>
        <canvas id="canvasEle" ref="canvasEle" :width="mirrorWidth" :height="mirrorHeight"></canvas>
        <div id="scanningLiner" v-if="!deviceNotSupport && !faceDetected"></div>
        <transition name="fade">
            <div class="message-box" v-if="errorMessage">
                <span id="deviceUnsupportMessage" class="message">{{errorMessage}}</span>
            </div>
        </transition>
        <div id="controlContainer">
            <div class="control float-right">
                <button id="resetTrackBtn" @click="resetTrack">Re-Scan</button>
            </div>
            <div class="control">
                <input type="checkbox" id="faceLine" v-model="shouldDrawModelLines">
                <label for="faceLine">Face Lines</label>
            </div>
            <div class="control">
                <label for="lipsColor">Lips Color: </label>
                <select id="lipsColor" v-model="lipsColor">
                    <option value="rgba(255, 0, 0, .4)">Red</option>
                    <option value="rgba(0, 255, 0, .4)">Green</option>
                    <option value="rgba(0, 0, 255, .4)">Blue</option>
                    <option value="rgba(127, 0, 127, .4)">Purple</option>
                </select>
            </div>
            <div class="control">
                <label for="browsColor">Brows Color: </label>
                <select id="browsColor" v-model="browsColor">
                    <option value="rgba(127, 0, 0, .5)">Red</option>
                    <option value="rgba(0, 127, 0, .4)">Green</option>
                    <option value="rgba(0, 0, 127, .4)">Blue</option>
                    <option value="rgba(127, 0, 127, .6)">Purple</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script>
import drawUpperLip from '../helpers/drawUpperLip'
import drawLowerLip from '../helpers/drawLowerLip'
import drawLeftEyeBrow from '../helpers/drawLeftEyeBrow'
import drawRightEyeBrow from '../helpers/drawRightEyeBrow'
const ClmTracker = window.clm.tracker

export default {
    name: 'Mirror',
    data() {
        return {
            // parameters
            mirrorWidth: Math.min(window.innerWidth, 500), // should change along with the screen
            mirrorHeight: window.innerHeight, // should change along with the screen
            camMeta: { // the camera spec, initialized by calling retrieveCameraMeta
                width: 0,
                height: 0,
                frameRate: 0,
            },
            // toggles and models
            shouldDrawModelLines: false,
            lipsColor: 'rgba(0, 0, 255, .4)',
            browsColor: 'rgba(0, 0, 127, .4)',
            errorMessage: null, // error message showed to user
            // flags
            deviceNotSupport: false, // if mirror work on device
            cameraAccessDenied: false, // if user deny access to camera
            faceDetected: false, // if face detected by tracker
            // references
            videoStraam: null,
            ctracker: null,
            windowSizingListener: null,
            restartVideoTimerId: null,
        }
    },
    computed: {
        mirrorStyle() {
            return {
                width: `${this.mirrorWidth}px`,
                height: `${this.mirrorHeight}px`,
            }
        },
    },
    methods: {
        isDeviceSupport() { // check if required API supported in browser
            if (!navigator || !navigator.mediaDevices) {
                this.deviceNotSupport = true
                return false
            }
            return true
        },
        async retrieveCameraMeta(facingMode = 'user') { // get camera info
            let stream = null
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode,
                    }
                })
                const tracks = stream.getVideoTracks()
                if (tracks.length === 0) {
                    return null
                }
                const { width, height, frameRate } = tracks[0].getSettings()
                this.camMeta.width = width
                this.camMeta.height = height
                this.camMeta.frameRate = frameRate
                return this.camMeta
            }
            finally {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop())
                }
            }
        },
        async startVideo() {
            const videoEle = this.$refs.videoEle
            // bind front camera to video DOM
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: {
                        ideal: Math.min(this.mirrorWidth * this.camMeta.height / this.mirrorHeight, this.mirrorWidth),
                    },
                    height: {
                        ideal: Math.min(this.camMeta.height, this.mirrorHeight),
                    },
                    frameRate: {
                        ideal: Math.min(this.camMeta.frameRate, 15),
                    },
                },
            })
            videoEle.srcObject = this.videoStream
        },
        stopVideo() {
            if (this.videoStream) {
                this.videoStream.getTracks().forEach(track => track.stop())
                this.videoStream = null
                this.$refs.videoEle.srcObject = null
            }
        },
        startTrack() {
            const videoEle = this.$refs.videoEle
            const canvasEle = this.$refs.canvasEle
            const paint = canvasEle.getContext('2d')
            // start tracker
            this.ctracker = new ClmTracker({
                scoreThreshold: 0.5,
            })
            this.ctracker.init()
            this.ctracker.start(videoEle)
            // continually update view
            const drawLoop = () => {
                // run only when ctracker not yet removed
                if (this.ctracker) {
                    paint.clearRect(0, 0, this.mirrorWidth, this.mirrorHeight)
                    const modelPositions = this.ctracker.getCurrentPosition()
                    if (modelPositions) {
                        // render only when face detected && fitting score in certain level
                        drawUpperLip(paint, modelPositions, this.lipsColor)
                        drawLowerLip(paint, modelPositions, this.lipsColor)
                        drawLeftEyeBrow(paint, modelPositions, this.browsColor)
                        drawRightEyeBrow(paint, modelPositions, this.browsColor)
                        if (this.shouldDrawModelLines) { this.ctracker.draw(canvasEle) }
                        // update flag
                        this.faceDetected = true
                    }
                    else {
                        // update flag
                        this.faceDetected = false
                    }
                    requestAnimationFrame(drawLoop)
                }
            }
            drawLoop()
        },
        async resetTrack() {
            if (this.isDeviceSupport() && this.ctracker) {
                this.stopTrack()
                this.stopVideo()
                await this.startVideo()
                this.startTrack()
            }
        },
        stopTrack() {
            if (this.ctracker) {
                this.ctracker.stop()
                this.ctracker = null
                this.faceDetected = false
            }
        },
        handleCameraAccessError(error) {
            console.log(error)
            this.cameraAccessDenied = true
            this.showErrorMsg('Camera Access Denied.')
        },
        adjustSizeOnWindowSizeChanged() {
            // re-calculate size
            this.mirrorWidth = Math.min(window.innerWidth, 500)
            this.mirrorHeight = window.innerHeight
            // restart video tracking 1s later
            if (this.isDeviceSupport()) {
                this.stopTrack()
                this.stopVideo()
                if (this.restartVideoTimerId) {
                    clearTimeout(this.restartVideoTimerId)
                }
                // restart tracking 1s after the last sizing
                this.$nextTick(() => {
                    this.restartVideoTimerId = setTimeout(async () => {
                        try {
                            await this.startVideo()
                            this.startTrack()
                        }
                        catch (err) {
                            this.handleCameraAccessError(err)
                        }
                    }, 1000)
                })
            }
        },
        showErrorMsg(message) {
            this.errorMessage = message
        }
    },
    async mounted() {
        // check if device support
        if (this.isDeviceSupport()) {
            try {
                await this.retrieveCameraMeta()
                await this.startVideo()
                this.startTrack()
            }
            catch (err) {
                this.handleCameraAccessError(err)
            }
        }
        else {
            this.showErrorMsg('This browser is not modern enough. Please try latest Chrome or Firefox.')
        }

        // bind window screen size
        this.windowSizingListener = () => this.adjustSizeOnWindowSizeChanged()
        window.addEventListener('resize', this.windowSizingListener)
    },
    beforeDestroy() {
        // unbind window sizing listener
        window.removeEventListener('resize', this.windowSizingListener)
        this.stopTrack()
        this.stopVideo()
    }
}
</script>

<style lang="scss">
@import '../scss/animate-once/animate-once';

#mirror {
    position: relative;
    margin: auto;
    max-width: 500px;
    overflow: hidden;
    background-color: black;
}

#videoEle,
#canvasEle {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: rotateY(180deg);
}

#scanningLiner {
    position: absolute;
    top: 0;
    right: 0;
    bottom: auto;
    left: 0;
    height: 2px;
    background-color: rgba(255, 0, 0, .9);

    @include animate-once(5s linear infinite) {
        from {
            top: 0%;
        }
        to {
            top: 100%
        }
    }
}

.message-box {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.message {
    display: block;
    padding: .5rem;
    background-color: rgba(255, 0, 0, .9);
    color: white;
}

#controlContainer {
    position: absolute;
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
    height: 8rem;
    background-color: rgba(255, 255, 255, .7);
}

.control {
    padding: .5em;
    color: #444;

    &.float-right {
        float: right;
    }

    button {
        padding: .5em;
        border: 1px solid #444;
        border-radius: 4px;
        background-color: transparent;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: all .8s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
