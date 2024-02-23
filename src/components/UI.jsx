import { useEffect, useState } from "react";
import useStore from "../state/useStore";

const UI = () => {
  const {
    userData,
    setUserData,
    activityData,
    activityStatus,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    elapsedSeconds,
  } = useStore();

  // Format time to MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    startTimer();
  };

  const handleStop = () => {
    pauseTimer();

  };
  const handleResume = () => {
    resumeTimer();
  };

  const handleReset = () => {
    resetTimer();
  };

  const increaseSpeed = () => {
    const newSpeed = Math.min(userData.currentSpeed + 1, 6); // Example: Cap speed at 6
    setUserData("currentSpeed", newSpeed);
  };

  const decreaseSpeed = () => {
    const newSpeed = Math.max(userData.currentSpeed - 1, 1); // Example: Minimum speed is 1
    setUserData("currentSpeed", newSpeed);
  };

  const calculateAverage = (log) => {
    if (!log || log.length === 0) return 0;
    const sum = log.reduce((acc, value) => acc + value, 0);
    return (sum / log.length).toFixed(1);
  };
  const calculateDistance = () => {
    // Assuming speedLog entries are recorded per second
    const averageSpeed = calculateAverage(userData.speedLog);
    // Convert elapsedSeconds to hours since speed is in MPH
    const elapsedTimeInHours = elapsedSeconds / 3600;
    return (averageSpeed * elapsedTimeInHours).toFixed(2); // Use toFixed for precision
  }

  // Log mid point
  useEffect(() => {
    const duration = activityData.duration;
    const midPoint = duration / 2;
    if (!userData.midTemp && elapsedSeconds >= midPoint && elapsedSeconds < duration) {
      setUserData("midTemp", userData.currentTemp)
      setUserData("midHeartRate", userData.currentHeartRate)
      setUserData("midSpeed", userData.currentSpeed)
    }
  }, [elapsedSeconds, activityData.duration, setUserData]);

  // pause timer on refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activityStatus === 'started') {
        pauseTimer();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pauseTimer, activityStatus]);


  return (
    <div className="ui-wrapper">
      <div className="reset-con">
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>

      </div>

      {/* Display users current data */}
      <div className="right-con">
        <div className="section">
          <span className="title">Time</span>
          <div className="stat time">{formatTime(elapsedSeconds)}</div>
        </div>
        <div className="section">
          <span className="title">Body Temp</span>
          <div className="stat temp">{userData.currentTemp} °F</div>{" "}
        </div>
        <div className="section">
          <span className="title">Heart Rate</span>
          <div className="stat">{userData.currentHeartRate} BPM</div>{" "}
        </div>
        <div className="section">
          <span className="title">Current Speed</span>
          <div className="stat">{userData.currentSpeed.toFixed(1)} MPH</div>{" "}
        </div>
      </div>

      {/* Speed control buttons */}
      <div className="controls-con">
        <button className="btn arrow up" onClick={increaseSpeed}>
          ⬆
        </button>
        <button className="btn arrow down" onClick={decreaseSpeed}>
          ⬇
        </button>
        {activityStatus === 'started' &&
          <button className="stop-btn" onClick={handleStop}>
            STOP
          </button>}
        {activityStatus === 'standby' &&
          <button className="btn start" onClick={handleStart}>
            START
          </button>
        }
        {activityStatus === 'paused' &&
          <button className="btn start" onClick={handleResume}>
            RESUME
          </button>
        }
      </div>

      {/* Bottom portion that stores mainly historical activity info. Also Nav buttons */}
      <div className="bottom-con">
        <div className="section">
          <p className="trial">{activityData.title}</p>
        </div>
        <div className="section">
          <p className="title">Duration</p>
          <p className="time">{formatTime(activityData.duration)}</p>
          <p className="stat">60s Cooldown</p>
          <p className="title">Status</p>
          <em>{activityStatus}</em>
        </div>
        <div className="section">
          <p className="title">Body Temp (°F)</p>
          <p className="stat">Start: {userData.tempLog[0]}</p>
          <p className="stat">Mid: {userData.midTemp}</p>
          <p className="stat">End: {userData.endTemp}</p>
          <p className="stat">Average: {userData.averageTemp}</p>
        </div>
        <div className="section">
          <p className="title">Heart Rate (BPM)</p>
          <p className="stat">Start: {userData.heartRateLog[0]}</p>
          <p className="stat">Mid: {userData.midHeartRate}</p>
          <p className="stat">End: {userData.endHeartRate}</p>
          <p className="stat">Average: {userData.averageHeartRate}</p>
        </div>
        <div className="section">
          <p className="title">Speed (MPH)</p>
          <p className="stat">Start: {userData.speedLog[0]} </p>
          <p className="stat">Mid: {userData.midSpeed}</p>
          <p className="stat">End: {userData.endSpeed}</p>
          <p className="stat">Average: {userData.averageSpeed}</p>
          <p className="stat">Dist: {calculateDistance()} mi</p>
        </div>
      </div>
    </div>
  );
};

export default UI;
