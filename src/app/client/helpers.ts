import KubeClient, {
  ClientFactory,
  NamespacedResource,
  CoreNamespacedResourceKind,
  CoreNamespacedResource,
  ClusterClient,
} from '@konveyor/lib-ui/dist/';
import { VIRT_META, ProviderType } from '@app/common/constants';
import { INewProvider, INewSecret } from '@app/queries/types';
import { VMwareFormState } from '@app/Providers/components/AddProviderModal/useVMwareFormState';
import { OpenshiftFormState } from '@app/Providers/components/AddProviderModal/useOpenshiftFormState';
import { useNetworkContext } from '@app/common/context';
export class VirtResource extends NamespacedResource {
  private _gvk: KubeClient.IGroupVersionKindPlural;
  constructor(kind: VirtResourceKind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: 'virt.konveyor.io',
      version: 'v1alpha1',
      kindPlural: kind,
    };
  }
  gvk(): KubeClient.IGroupVersionKindPlural {
    return this._gvk;
  }
}
export enum VirtResourceKind {
  Provider = 'providers',
}

export const secretResource = new CoreNamespacedResource(
  CoreNamespacedResourceKind.Secret,
  VIRT_META.namespace
  //are we moving the secrets to the config namespace?
);

export const providerResource = new VirtResource(VirtResourceKind.Provider, VIRT_META.namespace);

export function convertFormValuesToSecret(
  values: VMwareFormState['values'] | OpenshiftFormState['values'],
  createdForResourceType: VirtResourceKind
): INewSecret | undefined {
  // btoa => to base64, atob => from base64
  const encodedToken = btoa(values['saToken']);
  if (values.providerType === ProviderType.openshift) {
    return {
      apiVersion: 'v1',
      data: {
        token: encodedToken,
      },
      kind: 'Secret',
      metadata: {
        generateName: `${values['clusterName']}-`,
        namespace: VIRT_META.namespace,
        labels: {
          createdForResourceType,
          createdForResource: values['clusterName'],
        },
      },
      type: 'Opaque',
    };
  }
  if (values.providerType === 'vsphere') {
    const testThumbprint = 'fjdasfjasdlj';
    const encodedThumbprint = btoa(testThumbprint);
    const encodedPassword = btoa(values['password']);
    return {
      apiVersion: 'v1',
      data: {
        user: values['username'],
        password: encodedPassword,
        thumbprint: encodedThumbprint, //values.thumbprint?//
      },
      kind: 'Secret',
      metadata: {
        generateName: `${values['name']}-`,
        namespace: VIRT_META.namespace,
        labels: {
          createdForResourceType,
          createdForResource: values['name'],
        },
      },
      type: 'Opaque',
    };
  }
}

export const convertFormValuesToProvider = (
  values: OpenshiftFormState['values'] | VMwareFormState['values']
): INewProvider => {
  return {
    apiVersion: 'virt.konveyor.io/v1alpha1',
    kind: 'Provider',
    metadata: {
      name: values['clusterName'] || values['name'],
      namespace: 'openshift-migration',
    },
    spec: {
      type: values.providerType,
      url: values['url'] || values['hostname'],
      secret: {
        namespace: VIRT_META.namespace,
        name: values['clusterName'] || values['name'],
        // this wont work when we move to generate-name ...
        // we will need to pull in secrets & find before this request
      },
    },
  };
};

export const getTokenSecretLabelSelector = (
  createdForResourceType: string,
  createdForResource: string
) => {
  return {
    labelSelector: `createdForResourceType=${createdForResourceType},createdForResource=${createdForResource}`,
  };
};

export const useCheckIfResourceExists = async (
  client: ClusterClient,
  resourceKind: VirtResourceKind | CoreNamespacedResourceKind,
  resource: VirtResource,
  resourceName: string
): Promise<any> => {
  try {
    await Promise.allSettled([
      client.list(secretResource, getTokenSecretLabelSelector(resourceKind, resourceName)),
      client.get(resource, resourceName),
    ]).then((results) => {
      console.log('results', results);
      const alreadyExists = Object.keys(results).reduce((exists: Array<any>, result) => {
        return results[result]?.status === 'fulfilled ' && results[result]?.value.status === 200
          ? [
              ...exists,
              {
                kind: results[result].value.data.kind,
                name:
                  results[result].value.data.items && results[result].value.data.items.length > 0
                    ? results[result].value.data.items[0].metadata.name
                    : results[result].value.data.metadata.name,
              },
            ]
          : exists;
      }, []);
      if (alreadyExists.length > 0) {
        throw new Error(
          alreadyExists.reduce((msg, v) => {
            return msg + `- kind: "${v.kind}", name: "${v.name}"`;
          }, 'Some cluster objects already exist ')
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
};

export const useClientInstance = () => {
  const { currentUser } = useNetworkContext();
  const currentUserString = currentUser !== null ? JSON.parse(currentUser || '{}') : {};
  const user = {
    access_token: currentUserString.access_token,
    expiry_time: currentUserString.expiry_time,
  };
  return ClientFactory.cluster(user, VIRT_META.clusterApi);
};