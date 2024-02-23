import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";



const useStore = create(
  persist(
    (set, get) => ({
      activityStatus: "standby",
      startTime: null, // Timestamp when the timer was started
      pausedAt: null, // Timestamp when the timer was last paused
      totalPausedTime: 0, // Total time the timer has been paused
      elapsedSeconds: 0,
      timerInterval: null,
      midLogged: false,
      endLogged: false,
      userData: {
        weight: 150,
        // heart rates
        currentHeartRate: 60,
        startHeartRate: null,
        midHeartRate: null,
        endHeartRate: null,
        highestHeartRate: null,
        cooldownHeartRate: null,
        heartRateLog: [],
        //  temps
        currentTemp: 98.6,
        startTemp: null,
        midTemp: null,
        endTemp: null,
        averageTemp: null,
        tempLog: [],
        // speeds
        currentSpeed: 1,
        startSpeed: null,
        midSpeed: null,
        endSpeed: null,
        averageSpeed: null,
        speedLog: [],
      },
      activityData: {
        title: "Trial 1",
        maxSpeed: 6, // mph
        duration: 30 // seconds
      },

      calculateElapsedTime: () => {
        const now = Date.now();
        const startTime = get().startTime ?? now; // Fallback to now to avoid NaN
        const totalPausedTime = get().pausedAt ? get().totalPausedTime + (now - get().pausedAt) : get().totalPausedTime;
        const elapsedTime = (now - startTime - totalPausedTime) / 1000; // Convert ms to seconds
        return elapsedTime
      },

      startTimer: () => {
        const currentState = get();

        if (currentState.activityStatus === 'started') return;
        if (currentState.activityStatus === 'paused') {
          currentState.resumeTimer();
          return;
        }

        set({
          activityStatus: 'started',
          startTime: Date.now(),
          pausedAt: null,
          totalPausedTime: 0,
          elapsedSeconds: 0,
        });

        const timerInterval = setInterval(() => {
          const { startTime, totalPausedTime } = get();
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - startTime - totalPausedTime) / 1000);
          set({ elapsedSeconds });
          get().updatePhysicalStats();
          get().updateLogs();
          get().checkForCompletion();
        }, 1000);

        set({ timerInterval });
      },

      pauseTimer: () => {
        set((state) => {
          const now = Date.now();
          const pauseDuration = state.pausedAt ? now - state.pausedAt : 0;
          return {
            activityStatus: 'paused',
            pausedAt: now,
            totalPausedTime: state.totalPausedTime + pauseDuration,
            timerInterval: clearInterval(state.timerInterval),
          };
        });
      },

      resumeTimer: () => {
        set((state) => {
          const now = Date.now();
          // Calculate how long the timer has been paused
          const pausedDuration = state.pausedAt ? now - state.pausedAt : 0;
          // Update totalPausedTime with the duration of the latest pause
          const newTotalPausedTime = state.totalPausedTime + pausedDuration;

          // Clear the pausedAt since we're resuming
          // No need to start a new interval if one already exists (in case of multiple calls to resumeTimer without pausing)
          if (!state.timerInterval) {
            const timerInterval = setInterval(() => {
              const elapsedTime = Math.floor((Date.now() - get().startTime - get().totalPausedTime) / 1000);
              set({ elapsedSeconds: elapsedTime });
              get().updatePhysicalStats();
              get().updateLogs();
              get().checkForCompletion();
            }, 1000);

            return {
              ...state,
              activityStatus: 'started',
              pausedAt: null,
              totalPausedTime: newTotalPausedTime,
              timerInterval,
            };
          } else {
            return {
              ...state,
              activityStatus: 'started',
              pausedAt: null,
              totalPausedTime: newTotalPausedTime,
            };
          }
        });
      },


      stopTimer: () => {
        set((state) => ({
          activityStatus: 'stopped',
          timerInterval: clearInterval(state.timerInterval),
        }));
      },
      resetTimer: () => {
        clearInterval(get().timerInterval);
        clearInterval(get().tempFluctuationInterval);
        const randomTemp = parseFloat((Math.random() * (98.5 - 97.5) + 97.5).toFixed(1));
        const randomHeartRate = parseFloat((Math.random() * (30 - 15) + 60).toFixed(1)); // Assuming heart rate range
        set((state) => ({
          ...state,
          activityStatus: 'standby',
          startTime: null,
          pausedAt: null,
          totalPausedTime: 0,
          elapsedSeconds: 0,
          timerInterval: clearInterval(state.timerInterval),
          userData: {
            ...state.userData,
            currentHeartRate: randomHeartRate,
            highestHeartRate: null,
            startHeartRate: 60,
            midHeartRate: null,
            endHeartRate: null,
            averageHeartRate: null,
            heartRateLog: [],
            cooldownHeartRate: null,
            currentTemp: randomTemp,
            startTemp: null,
            midTemp: null,
            endTemp: null,
            averageTemp: null,
            tempLog: [],
            currentSpeed: 1,
            startSpeed: null,
            midSpeed: null,
            endSpeed: null,
            averageSpeed: null,
            speedLog: []
          },
          // activityData: {
          //   ...state.activityData,
          //   maxSpeed: 6,
          //   time: 0,
          // },
        }));
      },


      // TODO: add timer end function that save end data points

      setActivityStatus: (newState) => set({ activityStatus: newState }),
      setUserData: (key, value) => {
        set((state) => ({
          userData: {
            ...state.userData,
            [key]: value,
          },
        }));
      },

      setActivityData: (key, value) =>
        set((state) => ({
          activityData: { ...state.activityData, [key]: value },
        })),


      // to keep track of temp fluctiations throughout activity
      // tempLog: [],
      // update temperature with a random fluctuation
      // updateTemp: () => set((state) => {
      //   const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
      //   const lastTemp = parseFloat(state.userData.currentTemp); // ensure its a number
      //   const fluctuation = (Math.random() * 0.4 - 0.2);
      //   let newTemp = lastTemp + fluctuation;
      //   newTemp = clamp(newTemp, 97.5, 99.5);
      //   const newTempFixed = parseFloat(newTemp.toFixed(1));

      //   return {
      //     userData: {
      //       ...state.userData,
      //       currentTemp: newTempFixed,
      //       tempLog: [...state.tempLog, newTempFixed]
      //     },
      //   };
      // }),

      updatePhysicalStats: () => {
        set((state) => {
          let { currentTemp, currentHeartRate, currentSpeed } = state.userData;

          // Increase heart rate based on speed
          currentHeartRate += currentSpeed * 5; // Add 5 BPM for each MPH

          // Increase temperature gradually over time and fluctuate
          if (state.elapsedSeconds % 5 === 0) {
            currentTemp += 0.5; // Increase by 0.5 degrees every 5 seconds
          } else {
            // Fluctuate temperature by 0.1 degree every second
            const fluctuation = (Math.random() * 0.2) - 0.1; // Random fluctuation between -0.1 and 0.1
            currentTemp += fluctuation;
          }

          // Update the state with the new values
          return {
            userData: {
              ...state.userData,
              currentHeartRate: Math.min(Math.max(currentHeartRate, 50), 180), // Ensure heart rate stays within realistic bounds
              currentTemp: Math.min(Math.max(currentTemp.toFixed(1), 97), 100), // Ensure temp stays within realistic bounds
            },
          };
        });
      },

      updateLogs: () => {
        set((state) => {
          const elapsedTime = get().calculateElapsedTime();
          // Log data if a new second has elapsed since the last log entry
          if (Math.floor(elapsedTime) > state.userData.heartRateLog.length) {
            const { currentHeartRate, currentTemp, currentSpeed } = state.userData;
            return {
              userData: {
                ...state.userData,
                heartRateLog: [...state.userData.heartRateLog, currentHeartRate],
                tempLog: [...state.userData.tempLog, currentTemp],
                speedLog: [...state.userData.speedLog, currentSpeed],
              },
            };
          }
          get().checkForCompletion(); // Check if the activity is complete after updating
          return state; // Return current state if it's not time to log new data
        });
      },


      checkForCompletion: () => {
        const { elapsedSeconds, activityData } = get();
        if (elapsedSeconds >= activityData.duration) {
          get().stopTimer();
          get().completeActivity();
        }
      },

      // Calculate averages and save end data points
      completeActivity: () => {
        const { heartRateLog, speedLog, tempLog } = get().userData;
        const averageHeartRate = heartRateLog.reduce((a, b) => (a + b), 0) / heartRateLog.length;
        const averageSpeed = speedLog.reduce((a, b) => a + b, 0) / speedLog.length;
        const averageTemp = tempLog.reduce((a, b) => parseFloat(b) + a, 0) / tempLog.length;
        set({
          activityStatus: "completed",
          userData: {
            ...get().userData,
            endHeartRate: heartRateLog[heartRateLog.length - 1],
            averageHeartRate: averageHeartRate.toFixed(1),
            endTemp: tempLog[tempLog.length - 1],
            averageTemp: averageTemp.toFixed(1),
            endSpeed: speedLog[speedLog.length - 1],
            averageSpeed: averageSpeed.toFixed(),
          },
        });
      },
    }),
    {
      name: "exercise-simulation-storage", // storage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activityStatus: state.activityStatus,
        userData: state.userData,
        timerInterval: state.timerInterval,
        elapsedSeconds: state.elapsedSeconds,
        pausedAt: state.pausedAt,
      }), // selectively persist parts of state
    },
  ),
);

export default useStore;
