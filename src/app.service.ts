import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CreateUserRequest } from './dto/create-user.request';
import { UserCreatedEvent } from './events/user-created.event';

@Injectable()
export class AppService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createUser(body: CreateUserRequest) {
    const userId = '123';
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(userId, body.email),
    );
    const establishWsTimeout = setTimeout(
      () => this.establishWsConnection(userId),
      5000,
    );
    this.schedulerRegistry.addTimeout(
      `${userId}_establish_ws`,
      establishWsTimeout,
    );
  }

  private establishWsConnection(userId: string) {
    console.log('Establishing WS connection with user...', userId);
  }

  @OnEvent('user.created')
  welcomeNewUser(payload: UserCreatedEvent) {
    console.log('Welcoming new user...', payload.email);
  }

  @OnEvent('user.created')
  sendWelcomeGift(payload: UserCreatedEvent) {
    console.log('Sending welcome gift...', payload.email);

    setTimeout(() => {
      console.log('Welcome gift sent.', payload.email);
    }, 3000);
  }

  @Cron(CronExpression.EVERY_10_SECONDS, { name: 'delete_expired_users' })
  deleteExpiredUsers() {
    console.log('Deleting expired users...');
  }
}
