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

const ALL_CATEGORIES = ['Todas', 'nutrition', 'hypertension', 'recipes', 'exercise', 'lifestyle', 'tips'];

function ContentCard({ item, onPress }: { item: ContentItem; onPress: () => void }) {
  const icon = CATEGORY_ICON[item.category] ?? 'file-document-outline';
  const label  = CATEGORY_LABEL[item.category]  ?? item.category;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardRow}>
        <View style={styles.cardAccent} />
        <View style={styles.cardIconWrap}>
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={26}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{label}</Text>
            </View>
            {item.is_premium && (
              <View style={styles.premiumTag}>
                <MaterialCommunityIcons name="star-outline" size={11} color={COLORS.premium} />
                <Text style={styles.premiumText}>Premium</Text>
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
              <MaterialCommunityIcons name="eye-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.cardViews}>{item.view_count}</Text>
            </View>
            <Text style={styles.cardArrow}>Leer más ›</Text>
          </View>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recursos Educativos</Text>
        <Text style={styles.headerSub}>Contenido aprobado por tu nutricionista</Text>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={COLORS.textMuted}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar recursos…"
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {ALL_CATEGORIES.map(cat => {
          const isActive = category === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.filterBtn, isActive && styles.filterBtnActive]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={
                  cat === 'Todas'
                    ? 'view-grid-outline'
                    : (CATEGORY_ICON[cat] as keyof typeof MaterialCommunityIcons.glyphMap)
                }
                size={14}
                color={isActive ? COLORS.textOnPrimary : COLORS.primary}
              />
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {cat === 'Todas' ? 'Todas' : CATEGORY_LABEL[cat]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
            color={COLORS.textMuted}
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
  root: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textOnPrimary },
  headerSub:   { fontSize: 13, color: COLORS.overlayMedium, marginTop: 2 },

  searchWrapper: { paddingHorizontal: 16, marginTop: -18, marginBottom: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },

  filtersScroll:  { flexGrow: 0, flexShrink: 0 },
  filtersContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: 'center' },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 5,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText:       { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.textOnPrimary },

  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 20, gap: 12 },

  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
  },
  cardAccent: {
    width: 4,
    backgroundColor: COLORS.primaryAccent,
  },
  cardIconWrap: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: COLORS.primaryLight },
  categoryTagText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  premiumTag:  { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.premiumLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 12 },
  premiumText: { fontSize: 10, fontWeight: '700', color: COLORS.premium },

  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 20, marginBottom: 6 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag:     { fontSize: 11, color: COLORS.textMuted, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },

  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardViews:   { fontSize: 11, color: COLORS.textMuted },
  cardArrow:   { fontSize: 12, fontWeight: '700', color: COLORS.primaryMedium },

  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorText: { color: COLORS.error, fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryBtn:  { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  retryText: { color: COLORS.textOnPrimary, fontWeight: '700', fontSize: 14 },
  emptyTitle:{ fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
});
