import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { IoMdCloseCircle, IoMdRemoveCircle } from 'react-icons/io';

import { useActiveSubjectStore } from '@/stores/active-subject-store';

export const ActiveSubject = () => {
  const { activeSubject, setActiveSubject } = useActiveSubjectStore();
  const [isHidden, setIsHidden] = useState(false);
  const { t } = useTranslation('common');

  if (!activeSubject) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-0 right-0 z-50 px-4 py-6">
      <div className="flex flex-col rounded-lg bg-slate-900/75 p-3 text-slate-300 backdrop-blur-sm">
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
            <h3 className="mb-2 text-xl font-medium text-inherit">{t('activeSubject.header')}</h3>
            <hr className="mb-2" />
            <span>
              {t('identificationForm.firstName.label')}: {activeSubject.firstName}
            </span>
            <span>
              {t('identificationForm.lastName.label')}: {activeSubject.lastName}
            </span>
            <span>
              {t('identificationForm.dateOfBirth.label')}: {activeSubject.dateOfBirth}
            </span>
            <span>
              {t('identificationForm.sex.label')}: {t(`sex.${activeSubject.sex}`)}
            </span>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};
