import { useRef, useEffect, useState } from "react";
import Monitor from "./HeartRateMonitor";

function Runner() {
    const videoRef = useRef(null);
    const [targetSpeed, setTargetSpeed] = useState(1);
    const [mph, setMph] = useState(10);
    const [heartRate, setHeartRate] = useState(60); // Directly use this for heart rate display

    // This converts the video playback rate to MPH for display purposes.
    const playbackRateToMph = (playbackRate) => playbackRate * 6;

    // Calculate heart rate directly based on the current speed.
    const calculateHeartRate = (speed) => {
        const baseHeartRate = 50;
        const heartRateIncreasePerMph = 5;
        const baseSpeed = 0.75;
        const speedDifference = speed - baseSpeed;
        let calculatedHeartRate = baseHeartRate + speedDifference * heartRateIncreasePerMph;
        calculatedHeartRate = Math.max(calculatedHeartRate, baseHeartRate);
        return calculatedHeartRate;
    };

    // Whenever the MPH changes, update the heart rate immediately based on the new speed.
    useEffect(() => {
        const newHeartRate = calculateHeartRate(mph);
        setHeartRate(newHeartRate);
    }, [mph]);

    // Adjust the video playback rate immediately to the target speed without easing.
    // This direct adjustment replaces the previous easeSpeed function.
    useEffect(() => {
        if (videoRef.current) {
            const newSpeed = targetSpeed;
            videoRef.current.playbackRate = newSpeed;
            const newMph = playbackRateToMph(newSpeed);
            setMph(newMph);
        }
    }, [targetSpeed]);

    useEffect(() => {
        videoRef.current && videoRef.current.play();
    }, []);

    const increaseSpeed = () => {
        setTargetSpeed((prevSpeed) => Math.min(prevSpeed + 0.25, 4));
    };

    const decreaseSpeed = () => {
        setTargetSpeed((prevSpeed) => Math.max(prevSpeed - 0.25, 0.75));
    };

    return (
        <div className="wrapper">
            <div>
                <video ref={videoRef} width="250" loop muted>
                    <source src="/run_animation.webm" type="video/webm" />
                    Your browser does not support the video tag.
                </video>
                <div>Speed: {targetSpeed.toFixed(2)}</div>
                <div className="controls">
                    <button onClick={decreaseSpeed} disabled={targetSpeed <= 0.75}>- Speed</button>
                    <button onClick={increaseSpeed} disabled={targetSpeed >= 4}>+ Speed</button>
                </div>
            </div>
            <Monitor heartRate={heartRate} />
        </div>
    );
}

export default Runner;
