import Fastify from 'fastify';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { orderSchema } from '@quick-bite/core';
import { AppError, ValidationError } from '@quick-bite/shared';

// AWS clients
const sqsClient = new SQSClient({ region: process.env.AWS_REGION || 'us-east-1' });
const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Configuration
const ORDER_QUEUE_URL = process.env.ORDER_QUEUE_URL || '';
const NOTIFICATION_TOPIC_ARN = process.env.NOTIFICATION_TOPIC_ARN || '';
const KITCHEN_TOPIC_ARN = process.env.KITCHEN_TOPIC_ARN || '';

// Fastify app
const app = Fastify({
  logger: true,
});

// Health check endpoint
app.get('/health', async () => {
  return { status: 'healthy', service: 'order-processor', timestamp: new Date().toISOString() };
});

// Process orders from SQS
async function processOrders() {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: ORDER_QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    });

    const response = await sqsClient.send(command);
    
    if (!response.Messages || response.Messages.length === 0) {
      return;
    }

    for (const message of response.Messages) {
      try {
        if (!message.Body) continue;

        const orderData = JSON.parse(message.Body);
        
        // Validate order data
        const validatedOrder = orderSchema.parse(orderData);
        
        // Process the order
        await processOrder(validatedOrder);
        
        // Send notifications
        await sendOrderNotifications(validatedOrder);
        
        // Delete message from queue
        if (message.ReceiptHandle) {
          await sqsClient.send(new DeleteMessageCommand({
            QueueUrl: ORDER_QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
          }));
        }
        
        app.log.info(`Order ${validatedOrder.restaurantId} processed successfully`);
        
      } catch (error) {
        app.log.error(`Error processing message: ${error}`);
        
        // In a real application, you might want to move failed messages to a dead letter queue
        // or implement retry logic
      }
    }
  } catch (error) {
    app.log.error(`Error receiving messages: ${error}`);
  }
}

// Process individual order
async function processOrder(orderData: any) {
  // Here you would implement the actual order processing logic
  // This could include:
  // - Validating inventory
  // - Calculating preparation time
  // - Assigning to kitchen staff
  // - Updating order status
  
  app.log.info(`Processing order: ${JSON.stringify(orderData)}`);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Send order notifications
async function sendOrderNotifications(orderData: any) {
  try {
    // Send customer notification
    if (NOTIFICATION_TOPIC_ARN) {
      await snsClient.send(new PublishCommand({
        TopicArn: NOTIFICATION_TOPIC_ARN,
        Message: JSON.stringify({
          type: 'ORDER_CONFIRMATION',
          orderId: orderData.id || 'unknown',
          restaurantId: orderData.restaurantId,
          message: 'Your order has been received and is being processed.',
        }),
      }));
    }
    
    // Send kitchen notification
    if (KITCHEN_TOPIC_ARN) {
      await snsClient.send(new PublishCommand({
        TopicArn: KITCHEN_TOPIC_ARN,
        Message: JSON.stringify({
          type: 'NEW_ORDER',
          orderId: orderData.id || 'unknown',
          restaurantId: orderData.restaurantId,
          items: orderData.items,
          priority: 'normal',
        }),
      }));
    }
    
  } catch (error) {
    app.log.error(`Error sending notifications: ${error}`);
  }
}

// Start the service
async function start() {
  try {
    await app.listen({ port: 4001, host: '0.0.0.0' });
    app.log.info('Order processor service started on port 4001');
    
    // Start processing orders
    setInterval(processOrders, 5000); // Process orders every 5 seconds
    
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
