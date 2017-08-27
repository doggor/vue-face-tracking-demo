// the upper lip points of facial model
const maskPositions = [45, 46, 47, 48, 49, 50, 59, 60, 61, 44]
const startPosition = 44

/**
 *
 * @param {CanvasRenderingContext2D} paint , canvas 2D object
 * @param {Array<Array<number>>} modelPositions , facial model positions
 * @param {string} color, filled color
 */
export default function drawUpperLip(paint, modelPositions, color) {
    paint.beginPath()
    paint.moveTo(...modelPositions[startPosition])
    maskPositions.forEach(p => paint.lineTo(...modelPositions[p]))
    paint.fillStyle = color
    paint.fill()
}
