import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './postsService';
import { JwtAuthGuard } from '../user/jwtAuth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: { content: string; imageUrl?: string }, @Request() req) {
    return this.postsService.createPost(body.content, body.imageUrl || null, req.user.id);
  }

  @Get()
  async findAll() {
    return this.postsService.getAllPosts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved')
  async getSavedPosts(@Request() req) {
    return this.postsService.getSavedPosts(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePost(@Param('id') id: string, @Body() body: { content: string }, @Request() req) {
    return this.postsService.updatePost(id, req.user.id, body.content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Request() req) {
    return this.postsService.deletePost(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(@Param('id') id: string, @Request() req) {
    return this.postsService.toggleLikePost(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  async toggleSave(@Param('id') id: string, @Request() req) {
    return this.postsService.toggleSavePost(id, req.user.id);
  }
}