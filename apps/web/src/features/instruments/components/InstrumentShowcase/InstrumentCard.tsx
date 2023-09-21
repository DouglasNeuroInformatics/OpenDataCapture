import type { FormInstrumentSummary } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';
import { HiPencilSquare } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

import handBrain from '@/assets/handbrain.svg';
import toolBrain from '@/assets/toolbrain.svg';


export type InstrumentCardProps = {
  instrument: FormInstrumentSummary;
};

export const InstrumentCard = ({ instrument }: InstrumentCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    navigate(`../forms/${instrument.identifier}`);
  };

  const pictureRender = () => {
    const instrumentName = instrument.name.toLocaleLowerCase();
    if(instrumentName.includes("questionnaire")){
      return <HiPencilSquare className="h-8 w-8" />
    } else if (instrumentName.includes("Assessment")){
      return <img alt="tool brain" className="h-16 w-16 rounded-full"  src={toolBrain}/>
    } 
    return <img alt="tool brain" className="h-16 w-16 rounded-full"  src={handBrain}/>

  };

  return (
    <div
      className="relative transition-all duration-300 ease-in-out hover:scale-[1.03] hover:cursor-pointer hover:shadow-lg"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleClick}
    >
      <div className="flex flex-col rounded-lg border-2 border-slate-200 border-opacity-50 p-8 dark:border-slate-700 sm:flex-row">
        <div className="mb-4 inline-flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 sm:mb-0 sm:mr-8">
          {pictureRender()}
        </div>
        <div className="flex-grow">
          <h3 className="title-font mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {instrument.details.title}
          </h3>
          <h5 className="mb-2 text-slate-600 dark:text-slate-300">{`${t(
            'instruments.availableInstruments.filters.tags'
          )}: ${instrument.tags.join(', ')}`}</h5>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{instrument.details.description}</p>
        </div>
      </div>
    </div>
  );
};
