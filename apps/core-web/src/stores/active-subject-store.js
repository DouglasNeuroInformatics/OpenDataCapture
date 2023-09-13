import { create } from 'zustand';
export var useActiveSubjectStore = create(function (set) {
  return {
    activeSubject: null,
    setActiveSubject: function (activeSubject) {
      set({ activeSubject: activeSubject });
    }
  };
});
