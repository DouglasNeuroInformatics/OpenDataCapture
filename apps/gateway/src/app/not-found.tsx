import { ErrorMessage } from '@/components/ErrorMessage';

const NotFound = () => (
  <ErrorMessage
    message="Sorry, we couldn't find the page you're looking for"
    subtitle="Page Not Found"
    title="404 Error"
  />
);

export default NotFound;
