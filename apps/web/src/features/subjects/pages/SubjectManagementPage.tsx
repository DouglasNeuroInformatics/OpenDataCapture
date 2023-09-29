import { useTranslation } from 'react-i18next';

export const SubjectManagementPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="my-5">
        <h3 className="text-lg font-semibold">Assigned Instruments</h3>
      </div>
    </div>
  );
};

export default SubjectManagementPage;
