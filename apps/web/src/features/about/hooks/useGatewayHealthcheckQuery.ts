import { $GatewayHealthcheckResult } from '@opendatacapture/schemas/gateway';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useGatewayHealthcheckQuery({ enabled }: { enabled: boolean }) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await axios.get('/v1/gateway/healthcheck', {});
      return $GatewayHealthcheckResult.parse(response.data);
    },
    queryKey: ['gateway-healthcheck']
  });
}
