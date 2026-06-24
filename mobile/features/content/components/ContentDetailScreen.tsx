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

const CATEGORY_ACCENT: Record<string, string> = {
  nutrition: '#1E88E5',
  hypertension: '#43A047',
  recipes: '#00897B',
  exercise: '#FB8C00',
  lifestyle: '#8E24AA',
  tips: '#F9A825',
};

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

  const accent = CATEGORY_ACCENT[content.category] ?? COLORS.primary;
  const icon = CATEGORY_ICON[content.category] ?? 'file-document-outline';
  const label = CATEGORY_LABEL[content.category] ?? content.category;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: accent }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={22}
            color="#fff"
          />
          <Text style={styles.headerCategory}>{label}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <Text style={styles.title}>{content.title}</Text>

        {/* Meta: vistas + premium */}
        <View style={styles.metaRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="eye-outline" size={16} color="#aaa" />
            <Text style={styles.metaViews}>{content.view_count} lecturas</Text>
          </View>
          {content.is_premium && (
            <View style={styles.premiumBadge}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <MaterialCommunityIcons name="star-outline" size={14} color="#F57F17" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            </View>
          )}
        </View>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {content.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { borderColor: accent + '55' }]}>
                <Text style={[styles.tagText, { color: accent }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: accent + '33' }]} />

        {/* Cuerpo */}
        <Text style={styles.body}>{content.body}</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerCategory: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 22 },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    lineHeight: 30,
    marginBottom: 14,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  metaViews: { fontSize: 13, color: '#aaa' },
  premiumBadge: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  premiumText: { fontSize: 12, fontWeight: '700', color: '#F57F17' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600' },

  divider: { height: 2, borderRadius: 2, marginBottom: 20 },

  body: {
    fontSize: 15,
    color: '#444',
    lineHeight: 26,
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorText: { color: '#e53935', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
