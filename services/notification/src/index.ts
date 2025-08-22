import Fastify from 'fastify';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { z } from 'zod';
import { AppError, ValidationError } from '@quick-bite/shared';

// AWS clients
const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });
const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Configuration
const NOTIFICATION_TOPIC_ARN = process.env.NOTIFICATION_TOPIC_ARN || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@quickbite.com';

// Fastify app
const app = Fastify({
  logger: true,
});

// Validation schemas
const notificationSchema = z.object({
  type: z.enum(['ORDER_CONFIRMATION', 'ORDER_STATUS_UPDATE', 'KITCHEN_NOTIFICATION', 'CUSTOMER_NOTIFICATION']),
  recipientId: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  htmlBody: z.string().optional(),
});

// Health check endpoint
app.get('/health', async () => {
  return { status: 'healthy', service: 'notification', timestamp: new Date().toISOString() };
});

// Send notification endpoint
app.post('/api/notifications', async (request, reply) => {
  try {
    const notification = notificationSchema.parse(request.body);
    
    // Send notification based on type
    switch (notification.type) {
      case 'ORDER_CONFIRMATION':
        await sendOrderConfirmation(notification);
        break;
      case 'ORDER_STATUS_UPDATE':
        await sendOrderStatusUpdate(notification);
        break;
      case 'KITCHEN_NOTIFICATION':
        await sendKitchenNotification(notification);
        break;
      case 'CUSTOMER_NOTIFICATION':
        await sendCustomerNotification(notification);
        break;
      default:
        throw new ValidationError(`Unknown notification type: ${notification.type}`);
    }
    
    return { success: true, message: 'Notification sent successfully' };
    
  } catch (error) {
    if (error instanceof ValidationError) {
      reply.status(400);
      return { success: false, error: error.message };
    }
    
    app.log.error(`Error sending notification: ${error}`);
    reply.status(500);
    return { success: false, error: 'Internal server error' };
  }
});

// Send email endpoint
app.post('/api/emails', async (request, reply) => {
  try {
    const email = emailSchema.parse(request.body);
    
    await sendEmail(email);
    
    return { success: true, message: 'Email sent successfully' };
    
  } catch (error) {
    if (error instanceof ValidationError) {
      reply.status(400);
      return { success: false, error: error.message };
    }
    
    app.log.error(`Error sending email: ${error}`);
    reply.status(500);
    return { success: false, error: 'Internal server error' };
  }
});

// Send order confirmation
async function sendOrderConfirmation(notification: any) {
  try {
    // Send SNS notification
    if (NOTIFICATION_TOPIC_ARN) {
      await snsClient.send(new PublishCommand({
        TopicArn: NOTIFICATION_TOPIC_ARN,
        Message: JSON.stringify({
          type: 'ORDER_CONFIRMATION',
          ...notification,
          timestamp: new Date().toISOString(),
        }),
        MessageAttributes: {
          'notification_type': {
            DataType: 'String',
            StringValue: 'ORDER_CONFIRMATION',
          },
          'priority': {
            DataType: 'String',
            StringValue: notification.priority,
          },
        },
      }));
    }
    
    // Send email if recipient email is provided
    if (notification.recipientEmail) {
      await sendEmail({
        to: notification.recipientEmail,
        subject: 'Order Confirmation - Quick Bite',
        body: notification.message,
        htmlBody: generateOrderConfirmationHTML(notification),
      });
    }
    
    app.log.info(`Order confirmation sent for notification: ${notification.type}`);
    
  } catch (error) {
    app.log.error(`Error sending order confirmation: ${error}`);
    throw error;
  }
}

// Send order status update
async function sendOrderStatusUpdate(notification: any) {
  try {
    // Send SNS notification
    if (NOTIFICATION_TOPIC_ARN) {
      await snsClient.send(new PublishCommand({
        TopicArn: NOTIFICATION_TOPIC_ARN,
        Message: JSON.stringify({
          type: 'ORDER_STATUS_UPDATE',
          ...notification,
          timestamp: new Date().toISOString(),
        }),
        MessageAttributes: {
          'notification_type': {
            DataType: 'String',
            StringValue: 'ORDER_STATUS_UPDATE',
          },
          'priority': {
            DataType: 'String',
            StringValue: notification.priority,
          },
        },
      }));
    }
    
    // Send email if recipient email is provided
    if (notification.recipientEmail) {
      await sendEmail({
        to: notification.recipientEmail,
        subject: 'Order Status Update - Quick Bite',
        body: notification.message,
        htmlBody: generateOrderStatusUpdateHTML(notification),
      });
    }
    
    app.log.info(`Order status update sent for notification: ${notification.type}`);
    
  } catch (error) {
    app.log.error(`Error sending order status update: ${error}`);
    throw error;
  }
}

// Send kitchen notification
async function sendKitchenNotification(notification: any) {
  try {
    // Send SNS notification
    if (NOTIFICATION_TOPIC_ARN) {
      await snsClient.send(new PublishCommand({
        TopicArn: NOTIFICATION_TOPIC_ARN,
        Message: JSON.stringify({
          type: 'KITCHEN_NOTIFICATION',
          ...notification,
          timestamp: new Date().toISOString(),
        }),
        MessageAttributes: {
          'notification_type': {
            DataType: 'String',
            StringValue: 'KITCHEN_NOTIFICATION',
          },
          'priority': {
            DataType: 'String',
            StringValue: notification.priority,
          },
        },
      }));
    }
    
    app.log.info(`Kitchen notification sent for notification: ${notification.type}`);
    
  } catch (error) {
    app.log.error(`Error sending kitchen notification: ${error}`);
    throw error;
  }
}

// Send customer notification
async function sendCustomerNotification(notification: any) {
  try {
    // Send SNS notification
    if (NOTIFICATION_TOPIC_ARN) {
      await snsClient.send(new PublishCommand({
        TopicArn: NOTIFICATION_TOPIC_ARN,
        Message: JSON.stringify({
          type: 'CUSTOMER_NOTIFICATION',
          ...notification,
          timestamp: new Date().toISOString(),
        }),
        MessageAttributes: {
          'notification_type': {
            DataType: 'String',
            StringValue: 'CUSTOMER_NOTIFICATION',
          },
          'priority': {
            DataType: 'String',
            StringValue: notification.priority,
          },
        },
      }));
    }
    
    // Send email if recipient email is provided
    if (notification.recipientEmail) {
      await sendEmail({
        to: notification.recipientEmail,
        subject: 'Quick Bite Notification',
        body: notification.message,
        htmlBody: generateCustomerNotificationHTML(notification),
      });
    }
    
    app.log.info(`Customer notification sent for notification: ${notification.type}`);
    
  } catch (error) {
    app.log.error(`Error sending customer notification: ${error}`);
    throw error;
  }
}

// Send email using AWS SES
async function sendEmail(email: any) {
  try {
    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [email.to],
      },
      Message: {
        Subject: {
          Data: email.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: email.body,
            Charset: 'UTF-8',
          },
          ...(email.htmlBody && {
            Html: {
              Data: email.htmlBody,
              Charset: 'UTF-8',
            },
          }),
        },
      },
    });
    
    await sesClient.send(command);
    app.log.info(`Email sent to: ${email.to}`);
    
  } catch (error) {
    app.log.error(`Error sending email: ${error}`);
    throw error;
  }
}

// Generate HTML for order confirmation
function generateOrderConfirmationHTML(notification: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Order Confirmation</title>
    </head>
    <body>
      <h1>Order Confirmation</h1>
      <p>${notification.message}</p>
      <p>Thank you for choosing Quick Bite!</p>
    </body>
    </html>
  `;
}

// Generate HTML for order status update
function generateOrderStatusUpdateHTML(notification: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Order Status Update</title>
    </head>
    <body>
      <h1>Order Status Update</h1>
      <p>${notification.message}</p>
      <p>Thank you for choosing Quick Bite!</p>
    </body>
    </html>
  `;
}

// Generate HTML for customer notification
function generateCustomerNotificationHTML(notification: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Quick Bite Notification</title>
    </head>
    <body>
      <h1>Quick Bite Notification</h1>
      <p>${notification.message}</p>
      <p>Thank you for choosing Quick Bite!</p>
    </body>
    </html>
  `;
}

// Start the service
async function start() {
  try {
    await app.listen({ port: 4002, host: '0.0.0.0' });
    app.log.info('Notification service started on port 4002');
    
  } catch (error) {
    app.log.error(`Error starting service: ${error}`);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  app.log.info('SIGTERM received, shutting down gracefully');
  await app.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  app.log.info('SIGINT received, shutting down gracefully');
  await app.close();
  process.exit(0);
});

start();
