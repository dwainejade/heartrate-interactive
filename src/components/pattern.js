export function generateHeartbeatPattern(length = 240, heartRate = 60) {
    const baseline = 25;
    const data = new Array(length).fill(baseline);

    if (heartRate === 0) {
        // Return the flat baseline if heart rate is 0
        return data;
    }

    const canvasDurationInSeconds = 2; // Total duration represented by the canvas
    const beatsInDuration = (heartRate / 60) * canvasDurationInSeconds; // Total beats in the canvas duration
    const samplesPerBeat = Math.floor(length / beatsInDuration);

    // Define the proportions of each segment within a beat
    const qrsStartProportion = 0.3; // QRS starts at 30% of the beat
    const qrsEndProportion = 0.6; // QRS ends at 50% of the beat

    const interpolate = (startValue, endValue, steps) => {
        const values = [];
        for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            values.push((1 - t) * startValue + t * endValue);
        }
        return values;
    };

    for (
        let position = 0;
        position + samplesPerBeat <= length;
        position += samplesPerBeat
    ) {
        const qrsStart = position + Math.floor(samplesPerBeat * qrsStartProportion);
        const qrsEnd = position + Math.floor(samplesPerBeat * qrsEndProportion);
        const qrsLength = qrsEnd - qrsStart;

        // QRS spike
        const spikePeak = baseline - 30;
        const spike = interpolate(
            baseline,
            spikePeak,
            Math.ceil(qrsLength / 2)
        ).concat(interpolate(spikePeak, baseline, Math.floor(qrsLength / 2)));

        for (let i = 0; i < spike.length && qrsStart + i < length; i++) {
            data[qrsStart + i] = spike[i];
        }
    }

    return data;
}
