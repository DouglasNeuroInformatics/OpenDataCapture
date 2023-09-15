import React, { useEffect } from 'react';
import { ActiveSubject } from './ActiveSubject';
import { useActiveSubjectStore } from '@/stores/active-subject-store';
export default {
  component: ActiveSubject,
  decorators: [
    function (Story) {
      var setActiveSubject = useActiveSubjectStore().setActiveSubject;
      useEffect(function () {
        setActiveSubject({
          firstName: 'John',
          lastName: 'Appleseed',
          sex: 'male',
          dateOfBirth: '2000-01-01'
        });
      }, []);
      return React.createElement(Story, null);
    }
  ]
};
export var Default = {};
