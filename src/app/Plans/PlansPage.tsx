import * as React from 'react';
import {
  Card,
  PageSection,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
  Button,
  Alert,
} from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';

import AddTooltip from '@app/common/components/AddTooltip';
import { useHasSufficientProvidersQuery } from '@app/queries';

import PlansTable from './components/PlansTable';

// TODO replace these with real data from react-query
import { MOCK_PLANS, MOCK_MIGRATIONS } from '@app/queries/mocks/plans.mock';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

// TODO replace these with real state from react-query results
const isFetchingInitialPlans = false; // Fetching for the first time, not polling
const isErrorFetchingPlans = false;

const plans = MOCK_PLANS;
const migrations = MOCK_MIGRATIONS;

const PlansPage: React.FunctionComponent = () => {
  const history = useHistory();
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const { hasSufficientProviders } = sufficientProvidersQuery;

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Migration Plans</Title>
      </PageSection>
      <PageSection>
        {sufficientProvidersQuery.isLoading || isFetchingInitialPlans ? (
          <LoadingEmptyState />
        ) : sufficientProvidersQuery.isError ? (
          <Alert variant="danger" title="Error loading providers" />
        ) : isErrorFetchingPlans ? (
          <Alert variant="danger" title="Error loading plans" />
        ) : (
          <Card>
            <CardBody>
              {!plans ? null : plans.length === 0 ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title size="lg" headingLevel="h2">
                    No migration plans
                  </Title>
                  <EmptyStateBody>
                    Create a migration plan to select VMs to migrate to OpenShift Virtualization.
                  </EmptyStateBody>
                  <AddTooltip
                    isTooltipEnabled={!hasSufficientProviders}
                    content="You must add at least one VMware provider and one OpenShift Virtualization provider in order to create a migration plan."
                  >
                    <div className={`${spacing.mtMd}`}>
                      <Button
                        onClick={() => history.push('/plans/create')}
                        isDisabled={!hasSufficientProviders}
                        variant="primary"
                      >
                        Create migration plan
                      </Button>
                    </div>
                  </AddTooltip>
                </EmptyState>
              ) : (
                <PlansTable plans={plans} migrations={migrations} />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

export default PlansPage;
