import { ErrorMessage } from '@/components/ErrorMessage';

const Completed = () => (
  <ErrorMessage
    message="Our records indicate that this assignment has already been completed"
    subtitle="Already Completed"
    title="Access Denied"
  />
);

export default Completed;
