import { create } from 'zustand';
export var useDisclaimerStore = create(function (set) {
  return {
    isAccepted: false,
    username: null,
    setIsAccepted: function (isAccepted, username) {
      set({ isAccepted: isAccepted, username: username });
    }
  };
});
