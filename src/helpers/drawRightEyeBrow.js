/**
 *
 * @param {CanvasRenderingContext2D} paint , canvas 2D object
 * @param {Array<Array<number>>} modelPositions , facial model positions
 * @param {string} color, filled color
 */
export default function drawLeftEyeBrow(paint, modelPositions, color) {
    paint.beginPath()
    paint.moveTo(
        modelPositions[15][0] + 10,
        modelPositions[15][1] - 4,
    )
    paint.bezierCurveTo(
        modelPositions[16][0],
        modelPositions[16][1] + 6,
        modelPositions[17][0],
        modelPositions[17][1] + 6,
        modelPositions[18][0] - 4,
        modelPositions[18][1] + 4,
    )
    paint.arcTo(
        modelPositions[18][0] - 4,
        modelPositions[18][1] - 6,
        modelPositions[18][0] + 6,
        modelPositions[18][1] - 6,
        12,
    )
    paint.bezierCurveTo(
        modelPositions[17][0],
        modelPositions[17][1] - 6,
        modelPositions[16][0],
        modelPositions[16][1] - 8,
        modelPositions[15][0] + 10,
        modelPositions[15][1] - 4,
    )
    paint.fillStyle = color
    paint.fill()
}
