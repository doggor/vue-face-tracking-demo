// the upper lip points of facial model
const maskPositions = [56, 57, 58, 50, 51, 52, 53, 54, 55, 44]
const startPosition = 44

/**
 *
 * @param {CanvasRenderingContext2D} paint , canvas 2D object
 * @param {Array<Array<number>>} modelPositions , facial model positions
 * @param {string} color, filled color
 */
export default function drawLowerLip(paint, modelPositions, color) {
    paint.beginPath()
    paint.moveTo(...modelPositions[startPosition])
    maskPositions.forEach(p => paint.lineTo(...modelPositions[p]))
    paint.fillStyle = color
    paint.fill()
}
