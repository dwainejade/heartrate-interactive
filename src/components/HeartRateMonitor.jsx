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
    const baselineY = 60; // Assuming the baseline is at the vertical middle of a 120px height canvas
    const heartRateRef = useRef(heartRate); // Ref to track heart rate changes

    useEffect(() => {
        heartRateRef.current = heartRate;
        // Adjust the nextHeartbeatTimeRef based on the new heart rate
        // This calculation can be adjusted to smooth out the transition between heart rates
        nextHeartbeatTimeRef.current = Date.now() + 60000 / heartRateRef.current;
    }, [heartRate]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = 200;
        canvas.height = 120;
        ctx.strokeStyle = "red";

        const heartbeatPattern = [
            { dx: 3, dy: -6 },
            { dx: 6, dy: 15 },
            { dx: 3, dy: -25 },
            { dx: 5, dy: 6 },
            { dx: 5, dy: -5 },
            { dx: 5, dy: 0 },
        ];
        let patternIndex = 0;

        function draw() {
            const now = Date.now();
            // Clear only a small area ahead of the current drawing position
            ctx.clearRect(positionRef.current + 1, 0, 10, canvas.height);

            if (now >= nextHeartbeatTimeRef.current && patternIndex < heartbeatPattern.length) {
                const segment = heartbeatPattern[patternIndex];
                ctx.beginPath();
                ctx.moveTo(positionRef.current, baselineY + (patternIndex === 0 ? 0 : heartbeatPattern[patternIndex - 1].dy));
                const newY = baselineY + segment.dy;
                positionRef.current += segment.dx;
                ctx.lineTo(positionRef.current, newY);
                ctx.stroke();

                patternIndex++;
                if (patternIndex === heartbeatPattern.length) {
                    nextHeartbeatTimeRef.current = now + 60000 / heartRateRef.current;
                    patternIndex = 0;
                }
            } else if (patternIndex === 0) {
                drawBaseline(ctx, positionRef.current, baselineY);
                positionRef.current += 1;
            }

            if (positionRef.current >= canvas.width) {
                positionRef.current = 0; // Loop without clearing the canvas
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