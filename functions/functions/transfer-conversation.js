/* eslint-disable camelcase, import/no-unresolved, func-names */
const JWEValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = JWEValidator(async function (context, event, callback) {
  // set up twilio client
  const client = context.getTwilioClient();

  // setup a response object
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With, User-Agent',
  );

  // parse data form the incoming http request
  const originalTaskSid = event.taskSid;
  const { targetSid, interactionSid, interactionChannelSid } = event;

  try {
    const participants = await client.flexApi.v1
      .interaction(interactionSid)
      .channels(interactionChannelSid)
      .participants
      .list();

    // find agent in existing interaction channel
    const agent = participants.find((participant) => participant.type === 'agent' || participant.type === 'supervisor');
    if (!agent) {
      response.setBody({
        success: false,
        message: 'Could not find agent associated with interaction channel'
      })

      return callback(null, response);
    }

    // invite new agent to conversation
    // add task attributes to new invite so that we preserve task attributes
    const originalTask = await client.taskrouter.workspaces(context.TWILIO_TASKROUTER_WORKSPACE_SID).tasks(originalTaskSid).fetch();

    const originalTaskAttributes = JSON.parse(originalTask.attributes);
    const { flexChannelInviteSid, ...newAttributes } = originalTaskAttributes;

    const routingProperties = {
      workspace_sid: context.TWILIO_TASKROUTER_WORKSPACE_SID,
      workflow_sid: originalTask.workflowSid,
      task_channel_unique_name: originalTask.taskChannelUniqueName,
      attributes: newAttributes,
    }

    if (targetSid.startsWith('WK')) {
      routingProperties.worker_sid = targetSid;
      routingProperties.queue_sid = originalTask.taskQueueSid;
    }

    const invite = await client.flexApi.v1 
      .interaction(interactionSid)
      .channels(interactionChannelSid)
      .invites
      .create({
        routing: {
          properties: routingProperties
        }
      });
    
    // remove existing agent from conversation once the new agent has received an invitation,
    // in order to avoid leaving a conversation without any agent assigned to it.
    if (invite.sid) {
      await client.flexApi.v1
        .interaction(interactionSid)
        .channels(interactionChannelSid)
        .participants(agent.sid)
        .update({ status: 'closed' });
    }

    response.setBody({
      inviteSid: invite.sid,
    });
  } catch (error) {
    const errorMsg = `Conversation Service - Transfer Conversation - Error in handler: ${error}`
    console.error(errorMsg)

    response.setStatusCode(500);
    response.setBody({
      message: errorMsg
    });
  } finally {
    callback(null, response);
  } 
});
