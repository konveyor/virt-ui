import * as React from 'react';
import {
  PageSection,
  Title,
  Bullseye,
  EmptyState,
  Spinner,
  EmptyStateIcon,
  EmptyStateBody,
  Button,
  Card,
  CardBody,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { INetworkMapping, MappingType } from '../types';
import MappingsTable from '../components/MappingsTable';
import AddEditMappingModal from '../components/AddEditMappingModal';
import { fetchMockStorage } from '../mocks/helpers';

// TODO replace these with real state e.g. from redux
const isFetchingInitialNetworkMappings = false; // Fetching for the first time, not polling
// const networkMappings: INetworkMapping[] = [];

const NetworkMappingsPage: React.FunctionComponent = () => {
  const [networkMappings, setNetworkMappings] = React.useState([]);

  //TODO replace with real state from redux
  const mockMapObj = localStorage.getItem('networkMappingsObject');
  React.useEffect(() => {
    console.log(`TODO: fetch network mapping items`);
    const currentMappings = fetchMockStorage(MappingType.Network);
    setNetworkMappings(currentMappings || []);
  }, [mockMapObj]);

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);
  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1" size="lg">
          Network mappings
        </Title>
      </PageSection>
      <PageSection>
        {isFetchingInitialNetworkMappings ? (
          <Bullseye>
            <EmptyState>
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2">Loading...</Title>
            </EmptyState>
          </Bullseye>
        ) : (
          <Card>
            <CardBody>
              {!networkMappings ? null : networkMappings.length === 0 ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title headingLevel="h2" size="lg">
                    No network mappings
                  </Title>
                  <EmptyStateBody>
                    Map source provider networks to target provider networks.
                  </EmptyStateBody>
                  <Button onClick={toggleAddEditModal} variant="primary">
                    Create mapping
                  </Button>
                </EmptyState>
              ) : (
                <MappingsTable
                  mappings={networkMappings}
                  mappingType={MappingType.Network}
                  toggleAddEditModal={toggleAddEditModal}
                />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
      {isAddEditModalOpen ? (
        <AddEditMappingModal
          title="Add network mapping"
          onClose={toggleAddEditModal}
          mappingType={MappingType.Network}
        />
      ) : null}
    </>
  );
};

export default NetworkMappingsPage;
