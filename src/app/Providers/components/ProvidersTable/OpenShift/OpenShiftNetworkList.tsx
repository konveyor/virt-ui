import * as React from 'react';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { CheckIcon } from '@patternfly/react-icons';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ResolvedQuery } from '@app/common/components/ResolvedQuery';
import { useOpenShiftNetworksQuery } from '@app/queries/networks';
import { ICorrelatedProvider, IOpenShiftProvider } from '@app/queries/types';

interface IOpenShiftNetworkListProps {
  provider: ICorrelatedProvider<IOpenShiftProvider>;
}

// TODO can we show the IP address?
// TODO always have pod network as a choice

const OpenShiftNetworkList: React.FunctionComponent<IOpenShiftNetworkListProps> = ({
  provider,
}: IOpenShiftNetworkListProps) => {
  const openshiftNetworksQuery = useOpenShiftNetworksQuery(provider.inventory);
  return (
    <ResolvedQuery result={openshiftNetworksQuery} errorTitle="Error loading networks">
      <TableComposable
        aria-label={`Networks for provider ${provider.metadata.name}`}
        variant="compact"
        borders={false}
      >
        <Thead>
          <Tr>
            <Th className={spacing.pl_4xl}>Name</Th>
            <Th modifier="fitContent">Default migration network</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {(openshiftNetworksQuery.data || []).map((network) => (
            <Tr key={network.uid}>
              <Td modifier="fitContent" className={spacing.pl_4xl}>
                {network.name}
              </Td>
              {/* TODO how to determine if it's really the default? */}
              <Td className={alignment.textAlignCenter}>
                {network.name === 'ocp-network-1' ? <CheckIcon /> : null}
              </Td>
              <Td />
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
    </ResolvedQuery>
  );
};

export default OpenShiftNetworkList;