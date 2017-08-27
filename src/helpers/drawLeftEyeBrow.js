/**
 *
 * @param {CanvasRenderingContext2D} paint , canvas 2D object
 * @param {Array<Array<number>>} modelPositions , facial model positions
 * @param {string} color, filled color
 */
export default function drawLeftEyeBrow(paint, modelPositions, color) {
    paint.beginPath()
    paint.moveTo(
        modelPositions[19][0] - 10,
        modelPositions[19][1] - 4,
    )
    paint.bezierCurveTo(
        modelPositions[20][0],
        modelPositions[20][1] + 6,
        modelPositions[21][0],
        modelPositions[21][1] + 6,
        modelPositions[22][0] + 4,
        modelPositions[22][1] + 4,
    )
    paint.arcTo(
        modelPositions[22][0] + 4,
        modelPositions[22][1] - 6,
        modelPositions[22][0] - 6,
        modelPositions[22][1] - 6,
        12,
    )
    paint.bezierCurveTo(
        modelPositions[21][0],
        modelPositions[21][1] - 6,
        modelPositions[20][0],
        modelPositions[20][1] - 8,
        modelPositions[19][0] - 10,
        modelPositions[19][1] - 4,
    )
    paint.fillStyle = color
    paint.fill()
}
