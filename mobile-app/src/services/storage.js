import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'ashoka_bookmarks';
const CACHE_PREFIX = 'ashoka_cache_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const bookmarkService = {
  async getAll() {
    const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async add(article) {
    const bookmarks = await this.getAll();
    if (!bookmarks.find(b => b._id === article._id)) {
      bookmarks.unshift(article);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }
  },

  async remove(id) {
    const bookmarks = await this.getAll();
    const filtered = bookmarks.filter(b => b._id !== id);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
  },

  async isBookmarked(id) {
    const bookmarks = await this.getAll();
    return bookmarks.some(b => b._id === id);
  }
};

export const cacheService = {
  async set(key, data) {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  },

  async get(key) {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  }
};
