import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';
import { Router } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
const queryClient = new QueryClient();

import { NetworkContextProvider } from '@app/common/context';
import AddEditProviderModal from '../AddEditProviderModal';
import { MOCK_CLUSTER_PROVIDERS } from '@app/queries/mocks/providers.mock';

describe('<AddEditProviderModal />', () => {
  const toggleModalAndResetEdit = () => {
    return;
  };

  const history = createMemoryHistory();
  const props = {
    onClose: toggleModalAndResetEdit,
  };

  it('allows to cancel addition/edition of a provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  // oVirt Provider

  it('allows adding a oVirt provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByRole('button', { name: /select a provider type/i });
    userEvent.click(typeButton);
    const oVirtButton = await screen.findByRole('option', { name: /ovirt/i, hidden: true });
    userEvent.click(oVirtButton);
    const caCertField = screen.getByLabelText(/^File upload/);
    await waitFor(() => {
      const name = screen.getByRole('textbox', { name: /Name/ });
      const hostname = screen.getByRole('textbox', {
        name: /oVirt Engine host name or IP address/i,
      });
      const username = screen.getByRole('textbox', { name: /oVirt Engine user name/i });
      const password = screen.getByLabelText(/^oVirt Engine password/);

      userEvent.type(name, 'providername');
      userEvent.type(hostname, 'host.example.com');
      userEvent.type(username, 'username');
      userEvent.type(password, 'password');
      userEvent.type(caCertField, '-----BEGIN CERTIFICATE-----abc-----END CERTIFICATE-----');
    });

    const addButton = await screen.findByRole('dialog', { name: /Add provider/ });
    expect(addButton).toBeEnabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  // Vsphere Provider

  it('allows adding a vsphere provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByRole('button', { name: /select a provider type/i });
    userEvent.click(typeButton);
    const vsphereButton = await screen.findByRole('option', { name: /vmware/i, hidden: true });
    userEvent.click(vsphereButton);

    await waitFor(() => {
      const name = screen.getByRole('textbox', { name: /Name/ });
      const hostname = screen.getByRole('textbox', {
        name: /vCenter host name or IP address/i,
      });
      const username = screen.getByRole('textbox', { name: /vCenter user name/i });
      const password = screen.getByLabelText(/^vCenter password/);
      const certFingerprint = screen.getByRole('textbox', {
        name: /vCenter sha-1 fingerprint/i,
      });

      userEvent.type(name, 'providername');
      userEvent.type(hostname, 'host.example.com');
      userEvent.type(username, 'username');
      userEvent.type(password, 'password');
      userEvent.type(
        certFingerprint,
        'AA:39:A3:EE:5E:6B:4B:0D:32:55:BF:EF:95:60:18:90:AF:D8:07:09'
      );
    });

    const addButton = await screen.findByRole('dialog', { name: /Add provider/ });
    expect(addButton).toBeEnabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it('fails to add a vsphere provider with wrong values', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByRole('button', { name: /select a provider type/i });
    userEvent.click(typeButton);
    const vsphereButton = await screen.findByRole('option', { name: /vmware/i, hidden: true });
    userEvent.click(vsphereButton);

    await waitFor(() => {
      const name = screen.getByRole('textbox', { name: /Name/ });
      const hostname = screen.getByRole('textbox', {
        name: /vCenter host name or IP address/i,
      });
      const username = screen.getByRole('textbox', { name: /vCenter user name/i });
      const password = screen.getByLabelText(/^vCenter password/);
      const certFingerprint = screen.getByRole('textbox', {
        name: /vCenter sha-1 fingerprint/i,
      });

      userEvent.type(name, 'providername');
      userEvent.type(hostname, 'hostname');
      userEvent.type(username, 'username');
      userEvent.type(password, 'password');
      userEvent.type(
        certFingerprint,
        'AA:39:A3:EE:5E:6B:4B:0D:32:55:BF:EF:95:60:18:90:AF:D8:07:09'
      );
    });

    const addButton = await screen.findByRole('button', { name: /Add/ });
    expect(addButton).toBeDisabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it('allows editing a vsphere provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={MOCK_CLUSTER_PROVIDERS[0]} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const editButton = await screen.findByRole('dialog', { name: /Edit provider/ });
    expect(editButton).not.toHaveAttribute('disabled');
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  // OpenShift Provider

  it('allows to add an openshift provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByRole('button', { name: /select a provider type/i });
    userEvent.click(typeButton);
    const openshiftButton = await screen.findByRole('option', { name: /kubevirt/i, hidden: true });
    userEvent.click(openshiftButton);

    await waitFor(() => {
      const name = screen.getByRole('textbox', { name: /name/i });
      const url = screen.getByRole('textbox', { name: /url/i });
      const saToken = screen.getByLabelText(/^Service account token/);

      userEvent.type(name, 'providername');
      userEvent.type(url, 'http://host.example.com');
      userEvent.type(saToken, 'saToken');
    });

    const addButton = await screen.findByRole('dialog', { name: /Add provider/ });
    expect(addButton).toBeEnabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it('fails to add an openshift provider with wrong values', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByRole('button', { name: /select a provider type/i });
    userEvent.click(typeButton);
    const openshiftButton = await screen.findByRole('option', { name: /kubevirt/i, hidden: true });
    userEvent.click(openshiftButton);

    await waitFor(() => {
      const name = screen.getByRole('textbox', { name: /name/i });
      const url = screen.getByRole('textbox', { name: /url/i });
      const saToken = screen.getByLabelText(/^Service account token/);

      userEvent.type(name, 'providername');
      userEvent.type(url, 'host');
      userEvent.type(saToken, 'saToken');
    });

    const addButton = await screen.getByRole('button', { name: /Add/ });
    expect(addButton).toBeDisabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it('allows editing an openshift provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={MOCK_CLUSTER_PROVIDERS[4]} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const editButton = await screen.findByRole('dialog', { name: /Edit provider/ });
    expect(editButton).toBeEnabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });
});
