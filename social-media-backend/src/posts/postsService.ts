import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PostsService {
  async createPost(content: string, imageUrl: string | null, authorId: string) {
    return prisma.post.create({
      data: {
        content,
        imageUrl,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        savedBy: { select: { userId: true } },
        likes: { select: { userId: true } },
      },
    });
  }

  async getAllPosts() {
    return prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        savedBy: {
          select: { userId: true },
        },
        likes: {
          select: { userId: true },
        },
      },
    });
  }

  async updatePost(postId: string, userId: string, content: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    if (post.authorId !== userId) {
      throw new UnauthorizedException('You can only edit your own posts');
    }

    return prisma.post.update({
      where: { id: postId },
      data: { content },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        savedBy: { select: { userId: true } },
        likes: { select: { userId: true } },
      },
    });
  }

  async deletePost(postId: string, userId: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    if (post.authorId !== userId) {
      throw new UnauthorizedException('You can only delete your own posts');
    }

    await prisma.post.delete({ where: { id: postId } });
    return { message: 'Post successfully deleted' };
  }

  async toggleLikePost(postId: string, userId: string) {
    const existing = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (existing) {
      await prisma.like.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.like.create({
        data: { userId, postId },
      });
    }

    const likesCount = await prisma.like.count({ where: { postId } });
    const isLiked = !existing;
    return { liked: isLiked, likesCount };
  }

  async toggleSavePost(postId: string, userId: string) {
    const existing = await prisma.savedPost.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (existing) {
      await prisma.savedPost.delete({
        where: { id: existing.id },
      });
      return { saved: false, message: 'Post unsaved' };
    } else {
      await prisma.savedPost.create({
        data: { userId, postId },
      });
      return { saved: true, message: 'Post saved' };
    }
  }

  async getSavedPosts(userId: string) {
    const saved = await prisma.savedPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
            savedBy: {
              select: { userId: true },
            },
            likes: {
              select: { userId: true },
            },
          },
        },
      },
    });

    return saved.map((item) => item.post);
  }
}