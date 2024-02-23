import { useRef, useEffect } from "react";


// Helper function to draw the baseline
function drawBaseline(ctx, xPosition, yPosition) {
    ctx.beginPath();
    ctx.moveTo(xPosition, yPosition);
    ctx.lineTo(xPosition + 1, yPosition); // Extend the line by 1 pixel to the right
    ctx.stroke();
}

function Monitor({ heartRate }) {
    const canvasRef = useRef(null);
    const requestIdRef = useRef();
    const nextHeartbeatTimeRef = useRef(Date.now() + 60000 / heartRate);
    const positionRef = useRef(0); // Current drawing position on the canvas
    const heartRateRef = useRef(heartRate); // Ref to track heart rate changes
    const baselineY = 60; // vertical middle of a 120px height canvas


    useEffect(() => {
        heartRateRef.current = heartRate;
        // Adjust the nextHeartbeatTimeRef based on the new heart rate
        nextHeartbeatTimeRef.current = Date.now() + 60000 / heartRateRef.current;
    }, [heartRate]);


    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = 200;
        canvas.height = 120;
        ctx.strokeStyle = "tomato";
        ctx.lineWidth = 2;

        // Define the heartbeat pattern with small random adjustments
        const heartbeatPattern = [
            { dx: 3, dy: -6 },
            { dx: 6, dy: 15 },
            { dx: 3, dy: -25 },
            { dx: 5, dy: 6 },
            { dx: 5, dy: -5 },
            { dx: 5, dy: 0 },
        ];

        let patternIndex = 0;
        let isDrawingPattern = false;

        function draw() {
            const now = Date.now();
            // Adjust the clearing area to ensure it covers the start of the canvas when looping
            if (positionRef.current + 1 >= canvas.width) {
                // Clear the beginning of the canvas when we're about to loop
                ctx.clearRect(0, 0, 10, canvas.height); // Clear more if needed to ensure the first line is covered
            } else {
                // Regular clearing behavior for most frames
                ctx.clearRect(positionRef.current + 1, 0, 10, canvas.height);
            }

            if (now >= nextHeartbeatTimeRef.current) {
                if (!isDrawingPattern) {
                    isDrawingPattern = true;
                    patternIndex = 0;
                }
            }

            if (isDrawingPattern && patternIndex < heartbeatPattern.length) {
                const segment = heartbeatPattern[patternIndex];
                ctx.beginPath();
                if (patternIndex === 0) {
                    ctx.moveTo(positionRef.current, baselineY);
                } else {
                    // Continue from the last position
                    ctx.moveTo(positionRef.current, baselineY + heartbeatPattern[patternIndex - 1].dy);
                }

                // Apply randomness here if needed
                positionRef.current += segment.dx;
                const newY = baselineY + segment.dy;
                ctx.lineTo(positionRef.current, newY);
                ctx.stroke();

                patternIndex++;

                // Once the pattern is complete, prepare for the next cycle
                if (patternIndex >= heartbeatPattern.length) {
                    isDrawingPattern = false;
                    nextHeartbeatTimeRef.current = now + 60000 / heartRate;
                }
            } else {
                // Draw baseline if not drawing pattern
                drawBaseline(ctx, positionRef.current, baselineY);
                positionRef.current += 1;
            }

            // Loop back the drawing position
            if (positionRef.current >= canvas.width) {
                positionRef.current = 0;
            }

            requestIdRef.current = requestAnimationFrame(draw);
        }

        requestIdRef.current = requestAnimationFrame(draw);

        return () => cancelAnimationFrame(requestIdRef.current);
    }, []);

    return (
        <div className="monitor-con">
            <canvas id='ekgCanvas' ref={canvasRef} />
            <p className="heartrate">{heartRate.toFixed()} BPM</p>
        </div>

    )
}

export default Monitor;