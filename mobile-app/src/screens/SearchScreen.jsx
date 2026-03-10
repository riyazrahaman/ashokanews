import { useState, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, StatusBar
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { newsService } from '../services/api';
import { Colors, CategoryColors } from '../constants/theme';
import { Search, ArrowLeft, X } from 'lucide-react-native';

export default function SearchScreen() {
  const router = useRouter();
  const { q: initialQ } = useLocalSearchParams();
  const [query, setQuery] = useState(initialQ || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await newsService.search(q.trim());
      setResults(res.data.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const ResultCard = ({ item }) => {
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
          <Text style={styles.cardDesc} numberOfLines={2}>{item.shortDescription}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={Colors.text} size={22} />
        </TouchableOpacity>
        <View style={styles.searchRow}>
          <Search color={Colors.textMuted} size={16} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            placeholder="Search Ashoka news..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            autoFocus
            style={styles.input}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <X color={Colors.textMuted} size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>Try different keywords</Text>
        </View>
      ) : !searched ? (
        <View style={styles.center}>
          <Search color={Colors.border} size={48} />
          <Text style={styles.hintText}>Search for news, announcements, events...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item._id}
          renderItem={({ item }) => <ResultCard item={item} />}
          contentContainerStyle={styles.list}
          ListHeaderComponent={() => (
            <Text style={styles.resultsCount}>{results.length} results for "{query}"</Text>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16, gap: 10, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: Colors.border },
  input: { flex: 1, fontSize: 14, color: Colors.text },
  list: { padding: 16 },
  resultsCount: { fontSize: 13, color: Colors.textMuted, marginBottom: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 14, marginBottom: 12, overflow: 'hidden', elevation: 2 },
  cardImage: { width: '100%', height: 160 },
  cardContent: { padding: 12 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4, lineHeight: 20 },
  cardDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 12 },
  emptyText: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  hintText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 20 },
});
