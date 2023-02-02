import React, { useState } from 'react';

import { IoMdCloseCircle, IoMdRemoveCircle } from 'react-icons/io';

import { useActiveSubjectStore } from '@/stores/active-subject-store';

export const ActiveSubject = () => {
  const { activeSubject, setActiveSubject } = useActiveSubjectStore();
  const [isHidden, setIsHidden] = useState(false);

  if (!activeSubject) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-0 right-0 z-50 px-4 py-6">
      <div className="flex flex-col bg-slate-900 p-3 text-slate-300">
        <div className="pointer-events-auto mb-1 flex justify-end">
          <button onClick={() => setIsHidden(!isHidden)}>
            <IoMdRemoveCircle />
          </button>
          <button onClick={() => setActiveSubject(null)}>
            <IoMdCloseCircle />
          </button>
        </div>
        {isHidden && (
          <React.Fragment>
            <h3 className="text-inherit">Active Subject</h3>
            <hr className="mb-2" />
            <span>First Name: {activeSubject.firstName}</span>
            <span>Last Name: {activeSubject.lastName}</span>
            <span>Date of Birth: {activeSubject.dateOfBirth.toISOString().split('T')[0]}</span>
            <span>Sex: {activeSubject.sex}</span>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};
