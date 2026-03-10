import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, RefreshControl, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, StatusBar, ScrollView
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { newsService } from '../services/api';
import { cacheService } from '../services/storage';
import { Colors, CategoryColors, CATEGORIES } from '../constants/theme';
import { Search, GraduationCap, Bell } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

const NewsCard = ({ item, onPress }) => {
  const catColor = CategoryColors[item.category] || { bg: '#f1f5f9', text: '#475569' };
  const timeAgo = formatDistanceToNow(new Date(item.publishedAt || item.createdAt), { addSuffix: true });

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.9}>
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
      )}
      <View style={styles.cardContent}>
        <View style={[styles.categoryBadge, { backgroundColor: catColor.bg }]}>
          <Text style={[styles.categoryText, { color: catColor.text }]}>{item.category}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.shortDescription}</Text>
        <Text style={styles.cardDate}>{timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
};

const FeaturedCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.featuredCard} onPress={() => onPress(item)} activeOpacity={0.92}>
    <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.featuredGradient}>
      <View style={[styles.categoryBadge, { backgroundColor: Colors.primary, alignSelf: 'flex-start' }]}>
        <Text style={[styles.categoryText, { color: '#fff' }]}>{item.category}</Text>
      </View>
      <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.featuredDesc} numberOfLines={1}>{item.shortDescription}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchNews = useCallback(async (pg = 1, cat = category, reset = false) => {
    if (pg === 1) {
      const cached = await cacheService.get(`news_${cat}_1`);
      if (cached && !reset) {
        setNews(cached.data);
        setHasMore(cached.hasMore);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await newsService.getNews(pg, cat);
      const { data, pagination } = res.data;
      if (pg === 1) {
        setNews(data);
        await cacheService.set(`news_${cat}_1`, { data, hasMore: pagination.hasNext });
      } else {
        setNews(prev => [...prev, ...data]);
      }
      setHasMore(pagination.hasNext);
      setPage(pg);
    } catch (err) {
      console.error('Fetch news error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [category]);

  const fetchFeatured = async () => {
    try {
      const res = await newsService.getFeatured();
      setFeatured(res.data.data.slice(0, 3));
    } catch {}
  };

  useEffect(() => {
    setLoading(true);
    fetchNews(1, category, true);
    if (category === 'All') fetchFeatured();
  }, [category]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    router.push({ pathname: '/search', params: { q: searchQuery } });
    setSearching(false);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    fetchNews(page + 1);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchNews(1, category, true);
  };

  const goToDetail = (item) => router.push({ pathname: '/news/[id]', params: { id: item._id } });

  const ListHeader = () => (
    <View>
      {/* Featured carousel */}
      {category === 'All' && featured.length > 0 && (
        <View style={styles.featuredSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled>
            {featured.map(item => (
              <FeaturedCard key={item._id} item={item} onPress={goToDetail} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContainer}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Latest News</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logo}>
            <GraduationCap color={Colors.primary} size={22} />
            <View>
              <Text style={styles.logoTitle}>Ashoka Women's</Text>
              <Text style={styles.logoSub}>College News</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/bookmarks')} style={styles.headerBtn}>
            <Bell color={Colors.textSecondary} size={22} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/search')}>
          <Search color={Colors.textMuted} size={16} />
          <Text style={styles.searchPlaceholder}>Search news, announcements...</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={item => item._id}
          renderItem={({ item }) => <NewsCard item={item} onPress={goToDetail} />}
          ListHeaderComponent={<ListHeader />}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ padding: 20 }} /> : null}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No news found</Text></View>}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.card, paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, lineHeight: 18 },
  logoSub: { fontSize: 11, color: Colors.textSecondary, lineHeight: 14 },
  headerBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: Colors.border },
  searchPlaceholder: { color: Colors.textMuted, fontSize: 13, flex: 1 },
  categoryScroll: { backgroundColor: Colors.card, marginTop: 0 },
  categoryContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  categoryChipTextActive: { color: '#fff', fontWeight: '600' },
  featuredSection: { marginBottom: 0 },
  featuredCard: { width: 360, height: 200, overflow: 'hidden', margin: 0 },
  featuredGradient: { flex: 1, justifyContent: 'flex-end', padding: 16, gap: 6 },
  featuredTitle: { fontSize: 17, fontWeight: '700', color: '#fff', lineHeight: 23 },
  featuredDesc: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  listContent: { paddingBottom: 24 },
  card: { backgroundColor: Colors.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardImage: { width: '100%', height: 180 },
  cardContent: { padding: 14 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  categoryText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, lineHeight: 21, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  cardDate: { fontSize: 11, color: Colors.textMuted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
});
