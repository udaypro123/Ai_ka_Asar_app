import api from '../config/api';
import { Post, Comment, LikeResponse, User, UserComment } from '../types';

export const postService = {
  createPost: async (data: { title: string; content: string; category?: string }): Promise<Post> => {
    const response = await api.post('/posts', data);
    return response.data.data;
  },

  getMyPosts: async (): Promise<Post[]> => {
    const response = await api.get('/posts/me');
    return response.data.data;
  },

  getAllPosts: async (): Promise<Post[]> => {
    const response = await api.get('/posts');
    return response.data.data;
  },

  getPostById: async (id: string): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data.data;
  },

  updatePost: async (id: string, data: { title?: string; content?: string; category?: string }): Promise<Post> => {
    const response = await api.patch(`/posts/${id}`, data);
    return response.data.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },
};

export const commentService = {
  createComment: async (data: { postId: string; content: string; parentCommentId?: string }): Promise<Comment> => {
    const response = await api.post('/comments', data);
    return response.data.data;
  },

  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await api.get(`/comments/${postId}`);
    return response.data.data;
  },
};

export const likeService = {
  toggleLike: async (postId: string): Promise<LikeResponse> => {
    const response = await api.post('/likes', { postId });
    return response.data.data;
  },
};

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/public/users', { skipGlobalLoader: true });
    return response.data.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },
};

export const userLikeService = {
  getInteractionSummary: async (): Promise<UserInteractionSummary[]> => {
    const response = await api.get('/user-likes/summary', { skipGlobalLoader: true });
    return response.data.data;
  },

  toggleUserLike: async (userId: string, targetUserId: string): Promise<{ liked: boolean }> => {
    const response = await api.post(`/user-likes/${targetUserId}`, undefined, { skipGlobalLoader: true });
    return response.data.data;
  },

  getUserLikes: async (targetUserId: string): Promise<string[]> => {
    const response = await api.get(`/user-likes/${targetUserId}`, { skipGlobalLoader: true });
    return response.data.data;
  },
};

export interface UserInteractionSummary {
  targetUserId: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export const userCommentService = {
  createUserComment: async (data: {
    targetUserId: string;
    content: string;
    parentCommentId?: string;
  }): Promise<UserComment> => {
    const response = await api.post('/user-comments', data, { skipGlobalLoader: true });
    return response.data.data;
  },

  getUserComments: async (targetUserId: string): Promise<UserComment[]> => {
    const response = await api.get(`/user-comments/${targetUserId}`, { skipGlobalLoader: true });
    return response.data.data;
  },
};

export default { postService, commentService, likeService, adminService, userLikeService, userCommentService };
