import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';
import { Feather } from '@expo/vector-icons';
import { useProfileStore } from '@/stores/profileStore';
import { toast } from '@/components/ui/Toast';

export const EmergencyKeywordEditor: React.FC = () => {
  // Component state
  const { profile, updateEmergencyKeywords, loading } = useProfileStore();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize keywords from profile
  useEffect(() => {
    if (profile?.emergency_keywords && !isInitialized) {
      try {
        setKeywords(Array.isArray(profile.emergency_keywords) 
          ? [...profile.emergency_keywords] 
          : []);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing keywords:', error);
        setKeywords([]);
        setIsInitialized(true);
      }
    }
  }, [profile, isInitialized]);
  
  const handleAddKeyword = useCallback(() => {
    if (!newKeyword.trim()) {
      toast.error('Keyword cannot be empty');
      return;
    }
    
    const trimmedKeyword = newKeyword.toLowerCase().trim();
    
    if (keywords.includes(trimmedKeyword)) {
      toast.error('Keyword already exists');
      return;
    }
    
    setKeywords(prevKeywords => [...prevKeywords, trimmedKeyword]);
    setNewKeyword('');
  }, [newKeyword, keywords]);
  
  const handleRemoveKeyword = useCallback((index: number) => {
    setKeywords(prevKeywords => {
      const updatedKeywords = [...prevKeywords];
      updatedKeywords.splice(index, 1);
      return updatedKeywords;
    });
  }, []);
  
  const handleSaveKeywords = useCallback(async () => {
    try {
      setIsSaving(true);
      await updateEmergencyKeywords(keywords);
      toast.success('Keywords updated successfully');
    } catch (error) {
      console.error('Failed to update keywords:', error);
      toast.error('Failed to update keywords');
    } finally {
      setIsSaving(false);
    }
  }, [keywords, updateEmergencyKeywords]);
  
  // Show loading state if profile data is not yet available
  if (loading && !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading keywords...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Emergency Keywords</Text>
        <Text style={styles.description}>
          Add keywords that the app should listen for to detect emergency situations.
        </Text>
        
        <Card style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add new keyword..."
            value={newKeyword}
            onChangeText={setNewKeyword}
            onSubmitEditing={handleAddKeyword}
          />
          <TouchableOpacity 
            style={[
              styles.addButton,
              !newKeyword.trim() && styles.addButtonDisabled
            ]}
            onPress={handleAddKeyword}
            disabled={!newKeyword.trim()}
          >
            <Feather name="plus" size={24} color={colors.textDark} />
          </TouchableOpacity>
        </Card>
        
        <View style={styles.keywordsContainer}>
          {keywords.length === 0 && (
            <Text style={styles.emptyStateText}>
              No keywords added yet. Add keywords to detect emergencies.
            </Text>
          )}
          
          {keywords.map((keyword, index) => (
            <View key={`keyword-${index}-${keyword}`} style={styles.keywordItem}>
              <Text style={styles.keywordText}>{keyword}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveKeyword(index)}
                style={styles.removeButton}
              >
                <Feather name="x" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
        <Button
          title={isSaving ? "Saving..." : "Save Keywords"}
          onPress={handleSaveKeywords}
          style={styles.saveButton}
          disabled={isSaving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  description: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  keywordsContainer: {
    marginBottom: spacing.xl,
  },
  emptyStateText: {
    fontSize: fonts.sizes.md,
    color: colors.textTertiary,
    textAlign: 'center',
    marginVertical: spacing.lg,
    fontStyle: 'italic',
  },
  keywordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  keywordText: {
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  removeButton: {
    padding: spacing.xs,
  },
  saveButton: {
    marginBottom: spacing.xl,
  },
});