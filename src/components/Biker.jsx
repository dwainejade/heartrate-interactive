import { useState, useEffect, cloneElement } from "react";
import { useLottie } from "lottie-react";
import bikeAnimation from "../assets/bike_animation.json";
import Monitor from "./HeartRateMonitor";

function Biker() {
    const [heartRate, setHeartRate] = useState(60)
    const [rate, setRate] = useState(1); // Control speed
    const [currentSegmentName, setCurrentSegmentName] = useState("normal");

    // Define segments and their corresponding speed thresholds
    const segments = {
        coast: { range: [.5, 1], frames: [181, 200] },
        normal: { range: [1.1, 1.5], frames: [0, 57] },
        fast: { range: [1.6, 4], frames: [70, 152] },
    };

    const options = {
        animationData: bikeAnimation,
        loop: true,
        autoplay: true,
    };

    const { View, style, playSegments, setSpeed } = useLottie(options);

    // Update the segment based on the current speed
    useEffect(() => {
        const segmentName = Object.keys(segments).find(segment => {
            const { range } = segments[segment];
            return rate >= range[0] && rate <= range[1];
        });

        if (segmentName && segmentName !== currentSegmentName) {
            setCurrentSegmentName(segmentName);
            const { frames } = segments[segmentName];
            playSegments(frames, true);
        }
        setHeartRate(rate * 50)
    }, [rate, currentSegmentName, playSegments]);

    // Increase speed by 0.1, not exceeding 3.8
    const increaseSpeed = () => {
        setRate(prevSpeed => Math.min(prevSpeed + 0.1, 4));
        setSpeed(rate / 2)
    };

    // Decrease speed by 0.1, not going below 1
    const decreaseSpeed = () => {
        setRate(prevSpeed => Math.max(prevSpeed - 0.1, 1));
        setSpeed(rate / 2)
    };

    return (
        <div className="wrapper">
            <div>
                <div className="animation-con">
                    {cloneElement(View, { style: { width: "100%", height: "100%" } })}
                </div>
                <p>Speed: {rate.toFixed(1)}</p>
                <div className="controls">
                    <button onClick={decreaseSpeed}>- Speed</button>
                    <button onClick={increaseSpeed}>+ Speed</button>
                </div>

            </div>
            <Monitor heartRate={heartRate} setHeartRate={setHeartRate} />
        </div>
    );
}

export default Biker;
