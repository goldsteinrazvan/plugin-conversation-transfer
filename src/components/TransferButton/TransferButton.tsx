import React from 'react';
import { Button } from '@twilio/flex-ui';

type Props = {
  onClick: () => void
};

const TransferButton: React.FunctionComponent<Props> = (props: Props) => (
  <Button 
    variant="primary"
    size="small"
    style={{ marginLeft: '10px', marginRight: '10px' }}
    onClick={props.onClick}
  >
    Transfer
  </Button>
)

export default TransferButton;
