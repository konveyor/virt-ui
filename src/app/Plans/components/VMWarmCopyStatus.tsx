import * as React from 'react';
import { IVMStatus } from '@app/queries/types';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import { Button, Popover } from '@patternfly/react-core';

interface IWarmVMCopyState {
  state: 'Starting' | 'Copying' | 'Idle' | 'Failed' | 'Warning';
  status: StatusType;
  label: string;
}

export const getWarmVMCopyState = (vmStatus: IVMStatus): IWarmVMCopyState => {
  if (vmStatus.error) {
    return {
      state: 'Failed',
      status: StatusType.Error,
      label: 'Failed',
    };
  }
  if (!vmStatus.warm || vmStatus.warm.precopies.length === 0) {
    return {
      state: 'Starting',
      status: StatusType.Loading,
      label: 'Preparing for incremental copies.',
    };
  }
  const { precopies } = vmStatus.warm;
  if (precopies.some((copy) => !!copy.start && !copy.end)) {
    return {
      state: 'Copying',
      status: StatusType.Loading,
      label: 'Performing incremental data copy.',
    };
  }
  if (precopies.every((copy) => !!copy.start && !!copy.end)) {
    return {
      state: 'Idle',
      status: StatusType.Info, // TODO add an Idle status type to lib-ui
      label: `Idle - Next incremental copy will begin in X minutes.`, // TODO
    };
  }
  return {
    state: 'Warning',
    status: StatusType.Warning,
    label: 'Unknown',
  };
};

interface IVMWarmCopyStatusProps {
  vmStatus: IVMStatus;
}

const VMWarmCopyStatus: React.FunctionComponent<IVMWarmCopyStatusProps> = ({
  vmStatus,
}: IVMWarmCopyStatusProps) => {
  if (vmStatus.error) {
    return (
      <Popover hasAutoWidth bodyContent={<>{vmStatus.error.reasons.join('; ')}</>}>
        <Button variant="link" isInline>
          <StatusIcon status={StatusType.Error} label="Failed" />
        </Button>
      </Popover>
    );
  }
  const { status, label } = getWarmVMCopyState(vmStatus);
  return <StatusIcon status={status} label={label} />;
};

export default VMWarmCopyStatus;
