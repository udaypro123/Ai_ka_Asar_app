import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme';

export interface ThreadComment {
  _id: string;
  parentCommentId?: string | null;
  userName: string;
  content: string;
  createdAt: string;
}

interface ThreadedCommentsProps<T extends ThreadComment> {
  comments: T[];
  onReply?: (comment: T) => void;
}

export function ThreadedComments<T extends ThreadComment>({
  comments,
  onReply,
}: ThreadedCommentsProps<T>) {
  const byParent = new Map<string | null, T[]>();
  comments.forEach((comment) => {
    const parentId =
      comment.parentCommentId && comments.some((item) => item._id === comment.parentCommentId)
        ? comment.parentCommentId
        : null;
    const siblings = byParent.get(parentId) || [];
    siblings.push(comment);
    byParent.set(parentId, siblings);
  });

  const renderBranch = (parentId: string | null, depth: number): React.ReactNode =>
    (byParent.get(parentId) || []).map((comment) => (
      <View
        key={comment._id}
        style={[styles.branch, depth > 0 && styles.nestedBranch]}
      >
        <View style={styles.comment}>
          <Text style={styles.author}>{comment.userName}</Text>
          <Text style={styles.content}>{comment.content}</Text>
          <View style={styles.footer}>
            <Text style={styles.date}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
            {onReply && (
              <Pressable onPress={() => onReply(comment)}>
                <Text style={styles.reply}>Reply</Text>
              </Pressable>
            )}
          </View>
        </View>
        {renderBranch(comment._id, depth + 1)}
      </View>
    ));

  return <View>{renderBranch(null, 0)}</View>;
}

const styles = StyleSheet.create({
  branch: {
    marginBottom: spacing.sm,
  },
  nestedBranch: {
    marginLeft: spacing.md,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  comment: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    backgroundColor: colors.white,
  },
  author: {
    color: colors.auth.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  content: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  date: {
    color: colors.auth.textTertiary,
    fontSize: typography.fontSize.xs,
  },
  reply: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});
