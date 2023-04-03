import { TaskHelper, Manager, Notifications, ActionFunction, ITask } from '@twilio/flex-ui';

export const transferOverride = async (payload: any, original: ActionFunction) => {
  if (!TaskHelper.isChatBasedTask(payload.task as ITask)) {
    return original(payload);
  }

  /*
   * instantiate the manager to get useful info like user identity and token
   * build the request to initiate the transfer
   */
  const manager = Manager.getInstance();

  const reqBody = {
    Token: manager.user.token,
    taskSid: payload.task?.taskSid,
    targetSid: payload.targetSid,
    workerName: manager.user.identity,
    interactionSid: payload.task?.attributes?.flexInteractionSid,
    interactionChannelSid: payload.task?.attributes?.flexInteractionChannelSid,
  }

  try {
    await fetch(`${process.env.REACT_APP_SERVERLESS_FUNCTION_DOMAIN}/transfer-conversation`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(reqBody)
    });
  } catch (error) {
    console.error(`Flex Chat Transfer - Transfer Override: ${error}`);
    if (error instanceof TypeError) {
      /*
      * see src/FlexChatSmsTransferPlugin.tsx for how this custom notification is registered.
      * if for some reason the request to transfer fails, show it to the agent
      */
      Notifications.showNotification('chatTransferFetchError', { message: error?.message });
    }
  } 
}
