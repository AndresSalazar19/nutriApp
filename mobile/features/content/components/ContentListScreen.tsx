import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { useContent } from '../hooks/useContent';
import { ContentItem, CATEGORY_ICON, CATEGORY_LABEL } from '../services/contentService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CATEGORY_BG: Record<string, string> = {
  nutrition:    '#E3F2FD',
  hypertension: '#E8F5E9',
  recipes:      '#E0F2F1',
  exercise:     '#FFF3E0',
  lifestyle:    '#F3E5F5',
  tips:         '#FFF8E1',
};

const CATEGORY_ACCENT: Record<string, string> = {
  nutrition:    '#1E88E5',
  hypertension: '#43A047',
  recipes:      '#00897B',
  exercise:     '#FB8C00',
  lifestyle:    '#8E24AA',
  tips:         '#F9A825',
};

const ALL_CATEGORIES = ['Todas', 'nutrition', 'hypertension', 'recipes', 'exercise', 'lifestyle', 'tips'];

function ContentCard({ item, onPress }: { item: ContentItem; onPress: () => void }) {
  const bg     = CATEGORY_BG[item.category]     ?? '#F5F5F5';
  const accent = CATEGORY_ACCENT[item.category] ?? COLORS.primary;
  const icon = CATEGORY_ICON[item.category] ?? 'file-document-outline';
  const label  = CATEGORY_LABEL[item.category]  ?? item.category;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.cardAccent, { backgroundColor: accent }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={24}
            color={accent}
          />
          <View style={[styles.categoryTag, { backgroundColor: accent + '22' }]}>
            <Text style={[styles.categoryTagText, { color: accent }]}>{label}</Text>
          </View>
          {item.is_premium && (
            <View style={styles.premiumTag}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons
                  name="star-outline"
                  size={12}
                  color="#F57F17"
                />
                <Text style={styles.premiumText}>
                  Premium
                </Text>
              </View>
            </View>
          )}
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 3).map(tag => (
              <Text key={tag} style={styles.tag}>#{tag}</Text>
            ))}
          </View>
        )}
        <View style={styles.cardFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons
              name="eye-outline"
              size={14}
              color="#aaa"
            />
            <Text style={styles.cardViews}>
              {item.view_count}
            </Text>
          </View>
          <Text style={styles.cardArrow}>Leer más ›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ContentListScreen() {
  const router = useRouter();
  const { items, loading, error, refresh } = useContent();
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('Todas');

  const filtered = items.filter(item => {
    const matchSearch   = item.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'Todas' || item.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recursos Educativos</Text>
        <Text style={styles.headerSub}>Contenido aprobado por tu nutricionista</Text>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color="#aaa"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar recursos…"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filtros de categoría */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {ALL_CATEGORIES.map(cat => {
          const isActive = category === cat;
          const accent   = cat === 'Todas' ? COLORS.primary : (CATEGORY_ACCENT[cat] ?? COLORS.primary);
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.filterBtn, isActive && { backgroundColor: accent, borderColor: accent }]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={
                  cat === 'Todas'
                    ? 'view-grid-outline'
                    : (CATEGORY_ICON[cat] as keyof typeof MaterialCommunityIcons.glyphMap)
                }
                size={14}
                color={isActive ? '#fff' : accent}
              />
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {cat === 'Todas' ? 'Todas' : CATEGORY_LABEL[cat]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lista */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons
            name="book-open-page-variant-outline"
            size={56}
            color="#bbb"
          />
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptyText}>No hay recursos disponibles para esta búsqueda.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ContentCard
              item={item}
              onPress={() => router.push(`/(tabs)/content/${item.id}` as any)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refresh}
          refreshing={loading}
        />
      )}

      <BottomTabBar activeTab="recursos" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f6fa' },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  searchWrapper: { paddingHorizontal: 16, marginTop: -18, marginBottom: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },

  filtersScroll:  { flexGrow: 0 },
  filtersContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    gap: 5,
  },
  filterText:      { fontSize: 12, fontWeight: '600', color: '#666' },
  filterTextActive:{ color: '#fff' },

  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 20, gap: 12 },

  card: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardAccent:  { height: 4 },
  cardContent: { padding: 16 },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  categoryTag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  categoryTagText: { fontSize: 11, fontWeight: '700' },
  premiumTag:  { backgroundColor: '#FFF9C4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  premiumText: { fontSize: 11, fontWeight: '700', color: '#F57F17' },

  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a2e', lineHeight: 21, marginBottom: 8 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag:     { fontSize: 11, color: '#888', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },

  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardViews:   { fontSize: 12, color: '#aaa' },
  cardArrow:   { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorText: { color: '#e53935', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryBtn:  { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyTitle:{ fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  emptyText: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 20 },
});
