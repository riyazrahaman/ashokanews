import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { bookmarkService } from '../services/storage';
import { Colors, CategoryColors } from '../constants/theme';
import { Bookmark, ArrowLeft, Trash2 } from 'lucide-react-native';

export default function BookmarksScreen() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);

  useFocusEffect(
    useCallback(() => {
      bookmarkService.getAll().then(setBookmarks);
    }, [])
  );

  const handleRemove = async (id) => {
    await bookmarkService.remove(id);
    setBookmarks(prev => prev.filter(b => b._id !== id));
  };

  const BookmarkCard = ({ item }) => {
    const catColor = CategoryColors[item.category] || { bg: '#f1f5f9', text: '#475569' };
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/news/[id]', params: { id: item._id } })}
        activeOpacity={0.9}
      >
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
        )}
        <View style={styles.cardContent}>
          <View style={[styles.badge, { backgroundColor: catColor.bg }]}>
            <Text style={[styles.badgeText, { color: catColor.text }]}>{item.category}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={1}>{item.shortDescription}</Text>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item._id)}>
          <Trash2 color={Colors.error} size={16} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={Colors.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Articles</Text>
        <Bookmark color={Colors.primary} size={22} />
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <Bookmark color={Colors.border} size={48} />
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptyText}>Articles you save will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={item => item._id}
          renderItem={({ item }) => <BookmarkCard item={item} />}
          contentContainerStyle={styles.list}
          ListHeaderComponent={() => (
            <Text style={styles.count}>{bookmarks.length} saved {bookmarks.length === 1 ? 'article' : 'articles'}</Text>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  list: { padding: 16 },
  count: { fontSize: 13, color: Colors.textMuted, marginBottom: 12 },
  card: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 14, marginBottom: 10, overflow: 'hidden', elevation: 2, alignItems: 'center' },
  cardImage: { width: 80, height: 70 },
  cardContent: { flex: 1, padding: 12 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, marginBottom: 4 },
  badgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, lineHeight: 18, marginBottom: 3 },
  cardDesc: { fontSize: 11, color: Colors.textSecondary },
  removeBtn: { padding: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 12 },
  emptyText: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
});
