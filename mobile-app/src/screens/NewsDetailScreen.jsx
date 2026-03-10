import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Share, ActivityIndicator, StatusBar
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { newsService } from '../services/api';
import { bookmarkService } from '../services/storage';
import { Colors, CategoryColors } from '../constants/theme';
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, Eye, Clock } from 'lucide-react-native';
import { format } from 'date-fns';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const res = await newsService.getNewsById(id);
      setArticle(res.data.data);
      setRelated(res.data.related);
      const bm = await bookmarkService.isBookmarked(id);
      setBookmarked(bm);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (bookmarked) {
      await bookmarkService.remove(id);
    } else {
      await bookmarkService.add(article);
    }
    setBookmarked(!bookmarked);
  };

  const handleShare = async () => {
    await Share.share({
      title: article.title,
      message: `${article.title}\n\n${article.shortDescription}\n\nRead more on Ashoka News App`,
    });
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );

  if (!article) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Article not found</Text>
    </View>
  );

  const catColor = CategoryColors[article.category] || { bg: '#f1f5f9', text: '#475569' };
  const pubDate = article.publishedAt || article.createdAt;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.heroContainer}>
          {article.imageUrl ? (
            <Image source={{ uri: article.imageUrl }} style={styles.hero} contentFit="cover" />
          ) : (
            <View style={[styles.hero, { backgroundColor: Colors.primary + '20' }]} />
          )}
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={styles.topGradient} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.bottomGradient} />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Share2 color="#fff" size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleBookmark}>
              {bookmarked
                ? <BookmarkCheck color={Colors.primary} size={18} />
                : <Bookmark color="#fff" size={18} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Category & meta */}
          <View style={styles.metaRow}>
            <View style={[styles.categoryBadge, { backgroundColor: catColor.bg }]}>
              <Text style={[styles.categoryText, { color: catColor.text }]}>{article.category}</Text>
            </View>
            <View style={styles.metaInfo}>
              <Eye color={Colors.textMuted} size={12} />
              <Text style={styles.metaText}>{article.views?.toLocaleString()} views</Text>
              <Clock color={Colors.textMuted} size={12} />
              <Text style={styles.metaText}>{format(new Date(pubDate), 'MMM d, yyyy')}</Text>
            </View>
          </View>

          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.author}>By {article.author}</Text>

          <View style={styles.divider} />

          <Text style={styles.shortDesc}>{article.shortDescription}</Text>

          <Text style={styles.body}>{article.content}</Text>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {article.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Related */}
          {related.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Related Articles</Text>
              {related.map(rel => (
                <TouchableOpacity
                  key={rel._id}
                  style={styles.relatedCard}
                  onPress={() => router.push({ pathname: '/news/[id]', params: { id: rel._id } })}
                >
                  {rel.imageUrl && (
                    <Image source={{ uri: rel.imageUrl }} style={styles.relatedImage} contentFit="cover" />
                  )}
                  <View style={styles.relatedContent}>
                    <Text style={styles.relatedCardTitle} numberOfLines={2}>{rel.title}</Text>
                    <Text style={styles.relatedCategory}>{rel.category}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroContainer: { height: 280, position: 'relative' },
  hero: { width: '100%', height: 280 },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  backBtn: { position: 'absolute', top: 48, left: 16, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  actions: { position: 'absolute', top: 48, right: 16, flexDirection: 'row', gap: 8 },
  actionBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  metaInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.textMuted },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, lineHeight: 30, marginBottom: 6 },
  author: { fontSize: 12, color: Colors.textMuted, marginBottom: 16 },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 16 },
  shortDesc: { fontSize: 15, color: Colors.textSecondary, lineHeight: 23, fontWeight: '500', marginBottom: 16, fontStyle: 'italic' },
  body: { fontSize: 15, color: Colors.text, lineHeight: 25, marginBottom: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: Colors.primary + '15', borderWidth: 1, borderColor: Colors.primary + '30' },
  tagText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  relatedSection: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 20 },
  relatedTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  relatedCard: { flexDirection: 'row', gap: 12, marginBottom: 12, backgroundColor: Colors.card, borderRadius: 12, overflow: 'hidden', padding: 10, elevation: 1 },
  relatedImage: { width: 70, height: 60, borderRadius: 8 },
  relatedContent: { flex: 1 },
  relatedCardTitle: { fontSize: 13, fontWeight: '600', color: Colors.text, lineHeight: 18, marginBottom: 4 },
  relatedCategory: { fontSize: 11, color: Colors.textMuted },
  errorText: { color: Colors.textMuted, fontSize: 15 },
});
