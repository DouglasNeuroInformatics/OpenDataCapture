import React, { useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/utils';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useTranslation } from 'react-i18next';
import { IoMdCloseCircle, IoMdRemoveCircle } from 'react-icons/io';

import { useActiveVisitStore } from '@/stores/active-visit-store';

export const ActiveVisit = () => {
  const { activeVisit, setActiveVisit } = useActiveVisitStore();
  const [isHidden, setIsHidden] = useState(false);
  const { t } = useTranslation('common');
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));

  const bind = useDrag(
    ({ down, offset: [ox, oy] }) => {
      api.start({ immediate: down, x: ox, y: oy });
    },
    {
      bounds: document.body,
      rubberband: true
    }
  );

  if (!activeVisit) {
    return null;
  }

  return (
    <animated.div
      className="absolute z-50 flex cursor-pointer touch-none flex-col rounded-lg bg-slate-900/75 p-3 text-slate-300 backdrop-blur-sm print:hidden"
      {...bind()}
      style={{ x, y }}
    >
      <div className="pointer-events-auto mb-1 flex justify-end">
        <button
          onClick={() => {
            setIsHidden(!isHidden);
          }}
        >
          <IoMdRemoveCircle className="h-6 w-6 sm:h-4 sm:w-4" />
        </button>
        <button
          onClick={() => {
            setActiveVisit(null);
          }}
        >
          <IoMdCloseCircle className="h-6 w-6 sm:h-4 sm:w-4" />
        </button>
      </div>
      {isHidden && (
        <React.Fragment>
          <h3 className="mb-2 text-xl font-medium text-inherit">{t('activeVisit')}</h3>
          <hr className="mb-2" />
          <span>
            {t('identificationData.firstName.label')}: {activeVisit.subject.firstName}
          </span>
          <span>
            {t('identificationData.lastName.label')}: {activeVisit.subject.lastName}
          </span>
          <span>
            {t('identificationData.dateOfBirth.label')}: {toBasicISOString(activeVisit.subject.dateOfBirth)}
          </span>
          <span>
            {t('identificationData.sex.label')}: {t(`identificationData.sex.${activeVisit.subject.sex}`)}
          </span>
        </React.Fragment>
      )}
    </animated.div>
  );
};
