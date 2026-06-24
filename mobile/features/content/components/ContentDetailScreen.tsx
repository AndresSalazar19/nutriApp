import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useContentDetail } from '../hooks/useContent';
import { CATEGORY_ICON, CATEGORY_LABEL } from '../services/contentService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ContentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { content, loading, error } = useContentDetail(id ?? '');

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !content) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'Contenido no encontrado'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const icon = CATEGORY_ICON[content.category] ?? 'file-document-outline';
  const label  = CATEGORY_LABEL[content.category]  ?? content.category;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={22}
            color={COLORS.textOnPrimary}
          />
          <Text style={styles.headerCategory}>{label}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>{content.title}</Text>

        <View style={styles.metaRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="eye-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.metaViews}>{content.view_count} lecturas</Text>
          </View>
          {content.is_premium && (
            <View style={styles.premiumBadge}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="star-outline" size={14} color={COLORS.premium} />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            </View>
          )}
        </View>

        {content.tags && content.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {content.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.body}>{content.body}</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerMeta:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerCategory: { fontSize: 14, fontWeight: '700', color: COLORS.overlayMedium },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 22 },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 30,
    marginBottom: 14,
  },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  metaViews:  { fontSize: 13, color: COLORS.textMuted },
  premiumBadge: { backgroundColor: COLORS.premiumLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  premiumText:  { fontSize: 12, fontWeight: '700', color: COLORS.premium },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag:     { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderColor: COLORS.primaryAccent + '55' },
  tagText: { fontSize: 12, fontWeight: '600', color: COLORS.primaryAccent },

  divider: { height: 2, borderRadius: 2, marginBottom: 20, backgroundColor: COLORS.primaryLight },

  body: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 26,
  },

  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorText:   { color: COLORS.error, fontSize: 14, textAlign: 'center', marginBottom: 16 },
  backBtn:     { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  backBtnText: { color: COLORS.textOnPrimary, fontWeight: '700', fontSize: 14 },
});
