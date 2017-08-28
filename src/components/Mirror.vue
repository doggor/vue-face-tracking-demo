<template>
    <div id="mirror">
        <div id="videoContainer" :style="videoContainerStyle">
            <video id="videoEle" ref="videoEle" :width="this.camMeta.width" :height="this.camMeta.height"></video>
            <canvas id="canvasEle" ref="canvasEle" :width="this.camMeta.width" :height="this.camMeta.height"></canvas>
            <div id="scanningLiner" v-if="!deviceNotSupport && !faceDetected"></div>
            <transition name="fade">
                <div class="message-box" v-if="errorMessage">
                    <span id="deviceUnsupportMessage" class="message">{{errorMessage}}</span>
                </div>
            </transition>
        </div>
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
            camMeta: { // the camera spec, initialized by calling startVideo()
                width: Math.min(window.innerWidth, 500),
                height: Math.min(window.innerHeight, 500),
            },
            video: {
                preferWidth: Math.min(window.innerWidth, 500),
                preferHeight: Math.min(window.innerHeight, 500),
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
            ctracker: null,
        }
    },
    computed: {
        videoContainerStyle() {
            return {
                width: `${this.video.preferWidth}px`,
                height: `${this.video.preferHeight}px`,
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
        async startVideo() {
            const videoEle = this.$refs.videoEle
            // bind front camera to video DOM
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    frameRate: {
                        ideal: 15,
                    },
                },
            })
            videoEle.srcObject = videoStream

            // resolve when video get ready
            return new Promise(resolve => {
                videoEle.onloadedmetadata = () => {
                    // retrieve camera width and height
                    const tracks = videoStream.getVideoTracks()
                    if (tracks.length > 0) {
                        const { width, height } = tracks[0].getSettings()
                        this.camMeta.width = width
                        this.camMeta.height = height
                        this.video.preferWidth = Math.min(width, window.innerWidth)
                        this.video.preferHeight = Math.min(height, window.innerHeight)
                    }
                    // start streaming
                    videoEle.play()
                    // return
                    resolve()
                }
            })
        },
        stopVideo() {
            if (this.$refs.videoEle.srcObject) {
                this.$refs.videoEle.srcObject.getTracks().forEach(track => track.stop())
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
                    paint.clearRect(0, 0, this.camMeta.width, this.camMeta.height)
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
        showErrorMsg(message) {
            this.errorMessage = message
        }
    },
    async mounted() {
        // check if device support
        if (this.isDeviceSupport()) {
            try {
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
    },
    beforeDestroy() {
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

#videoContainer {
    position: relative;
    overflow: hidden;
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
