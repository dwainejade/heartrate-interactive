import { useEffect, cloneElement } from "react";
import { useLottie } from "lottie-react";
import animation from "/public/assets/running_animation.json";
import useStore from "../state/useStore";

function Runner() {
  const { activityStatus, userData } = useStore();

  const options = {
    animationData: animation,
    loop: true,
    autoplay: true,
  };

  const { View, play, pause, setSpeed } = useLottie(options);

  // control animation based on acitivityStatus
  useEffect(() => {
    if (activityStatus === 'started') {
      play();
    } else {
      pause();
    }
  }, [activityStatus, play, pause]);
  useEffect(() => {
    setSpeed(userData.currentSpeed * .1 + 1);
  }, [userData, setSpeed]);


  return (
    <div className="wrapper">
      <div className="animation-con">
        {cloneElement(View, { style: { width: "100%", height: "100%" } })}
      </div>
    </div>
  );
}

export default Runner;
