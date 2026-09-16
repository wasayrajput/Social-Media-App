import { Module } from '@nestjs/common';
import { PostsController } from './postsController';
import { PostsService } from './postsService';
import { UserModule } from '../user/userModule';

@Module({
  imports: [UserModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
