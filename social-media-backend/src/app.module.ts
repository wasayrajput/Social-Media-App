import { Module } from '@nestjs/common';
import { UserModule } from './user/userModule';
import { PostsModule } from './posts/postsModule';

@Module({
  imports: [UserModule, PostsModule],
})
export class AppModule {}