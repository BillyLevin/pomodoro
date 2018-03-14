const TimeCtrl = (function() {
  const state = {
    sessionLength: 0,
    breakLength: 0,
    timeLeft: 0,
    isPaused: true,
    inSession: true
  };
  // Public
  return {
    getState: function() {
      return state;
    },
    updateState: function(sessionTime, breakTime, timeLeft, paused, session) {
      state.sessionLength = sessionTime;
      state.breakLength = breakTime;
      state.timeLeft = timeLeft;
      state.isPaused = paused;
    },
    togglePauseState: function() {
      state.isPaused = !state.isPaused;
    },
    changeSessionLength: function(classes) {
      if (classes.contains("plus")) {
        state.sessionLength += 1;
      } else if (classes.contains("minus") && state.sessionLength > 1) {
        state.sessionLength -= 1;
      }
      if (state.inSession) {
        state.timeLeft = state.sessionLength * 60;
      }
    },
    changeBreakLength: function(classes) {
      if (classes.contains("plus")) {
        state.breakLength += 1;
      } else if (classes.contains("minus") && state.breakLength > 1) {
        state.breakLength -= 1;
      }
      if (!state.inSession) {
        state.timeLeft = state.breakLength * 60;
      }
    },
    toggleSessionType: function() {
      state.inSession = !state.inSession;
      if (state.inSession) {
        state.timeLeft = state.sessionLength * 60;
      } else {
        state.timeLeft = state.breakLength * 60;
      }
    }
  };
})();

const UICtrl = (function() {
  // Public
  return {
    updateSessionLength: function(state) {
      document.querySelector(".session-value").textContent =
        state.sessionLength;
      if (state.inSession) {
        document.querySelector(".time-left").textContent = `${
          state.sessionLength
        }:00`;
      }
    },
    updateBreakLength: function(state) {
      document.querySelector(".break-value").textContent = state.breakLength;
      if (!state.inSession) {
        document.querySelector(".time-left").textContent = `${
          state.breakLength
        }:00`;
      }
    },
    updateTimer: function(minutes, seconds, state) {
      let length;
      if (state.inSession) {
        length = state.sessionLength;
      } else {
        length = state.breakLength;
      }
      document.querySelector(
        ".time-left"
      ).textContent = `${minutes}:${seconds}`;
      const minutesNum = parseInt(minutes);
      const secondsNum = parseInt(seconds);
      const percentCalc =
        (length * 60 - (minutesNum * 60 + secondsNum)) / (length * 60) * 100;
      const percent = `${percentCalc}%`;
      document.documentElement.style.setProperty("--percentage", percent);
    },
    updateStatus: function(state) {
      let text;
      if (state.inSession) {
        text = "Time to work...";
      } else {
        text = "Take a break!";
      }
      document.querySelector(".status").textContent = text;
    }
  };
})();

const App = (function(TimeCtrl, UICtrl) {
  // Event listeners
  const loadEventListeners = function() {
    // Load initial values
    document.addEventListener("DOMContentLoaded", load);
    // Toggle timer click
    document
      .querySelector(".time-display")
      .addEventListener("click", toggleTimer);
    // Edit session length click events
    document
      .querySelector(".session-plus")
      .addEventListener("click", editSessionLength);
    document
      .querySelector(".session-minus")
      .addEventListener("click", editSessionLength);
    // Edit break length click events
    document
      .querySelector(".break-plus")
      .addEventListener("click", editBreakLength);
    document
      .querySelector(".break-minus")
      .addEventListener("click", editBreakLength);
  };
  // Load initial values
  const load = function() {
    const sessionTime = parseInt(
      document.querySelector(".session-value").textContent
    );
    const breakTime = parseInt(
      document.querySelector(".break-value").textContent
    );
    const timeLeft = sessionTime * 60;
    TimeCtrl.updateState(sessionTime, breakTime, timeLeft, true, true);
  };
  // Toggle timer
  const toggleTimer = function() {
    TimeCtrl.togglePauseState();
    const state = TimeCtrl.getState();
    startTimer(state);
  };
  // Start timer
  const startTimer = function(state) {
    let start = Date.now();
    const duration = state.timeLeft;
    let diff;
    let minutes;
    let seconds;

    const timer = setInterval(function() {
      if (state.isPaused) {
        clearInterval(timer);
        return false;
      }
      diff = duration - (((Date.now() - start) / 1000) | 0);
      minutes = (diff / 60) | 0;
      seconds = (diff % 60) | 0;
      // Formatting minutes and seconds
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      if (parseInt(minutes) === 0 && parseInt(seconds) === 0) {
        document.getElementById("alert").play();
        clearInterval(timer);
        TimeCtrl.toggleSessionType();
        const newState = TimeCtrl.getState();
        UICtrl.updateStatus(newState);
        startTimer(newState);
      }
      UICtrl.updateTimer(minutes, seconds, state);
      if (diff <= 0) {
        start = Date.now() + 1000;
      }
      TimeCtrl.updateState(
        state.sessionLength,
        state.breakLength,
        parseInt(minutes) * 60 + parseInt(seconds),
        state.isPaused,
        state.inSession
      );
    }, 1000);
  };
  // Edit session length
  const editSessionLength = function(e) {
    const state = TimeCtrl.getState();
    // Time can only be changed if timer currently paused
    if (state.isPaused) {
      const classes = e.target.classList;
      TimeCtrl.changeSessionLength(classes);
      UICtrl.updateSessionLength(state);
    }
  };
  // Edit break length
  const editBreakLength = function(e) {
    const state = TimeCtrl.getState();
    // Time can only be changed if timer currently paused
    if (state.isPaused) {
      const classes = e.target.classList;
      TimeCtrl.changeBreakLength(classes);
      UICtrl.updateBreakLength(state);
    }
  };
  // Public
  return {
    init: function() {
      loadEventListeners();
    }
  };
})(TimeCtrl, UICtrl);

// Initialise the app
App.init();
