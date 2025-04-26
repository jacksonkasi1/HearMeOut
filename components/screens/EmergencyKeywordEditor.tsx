import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
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
  const { profile, updateEmergencyKeywords } = useProfileStore();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  
  useEffect(() => {
    if (profile?.emergency_keywords) {
      setKeywords([...profile.emergency_keywords]);
    }
  }, [profile]);
  
  const handleAddKeyword = () => {
    if (!newKeyword.trim()) {
      toast.error('Keyword cannot be empty');
      return;
    }
    
    if (keywords.includes(newKeyword.toLowerCase().trim())) {
      toast.error('Keyword already exists');
      return;
    }
    
    setKeywords([...keywords, newKeyword.toLowerCase().trim()]);
    setNewKeyword('');
  };
  
  const handleRemoveKeyword = (index: number) => {
    const updatedKeywords = [...keywords];
    updatedKeywords.splice(index, 1);
    setKeywords(updatedKeywords);
  };
  
  const handleSaveKeywords = async () => {
    try {
      await updateEmergencyKeywords(keywords);
      toast.success('Keywords updated successfully');
    } catch (error) {
      toast.error('Failed to update keywords');
    }
  };
  
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
            style={styles.addButton}
            onPress={handleAddKeyword}
          >
            <Feather name="plus" size={24} color={colors.textDark} />
          </TouchableOpacity>
        </Card>
        
        <View style={styles.keywordsContainer}>
          {keywords.map((keyword, index) => (
            <View key={index} style={styles.keywordItem}>
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
          title="Save Keywords"
          onPress={handleSaveKeywords}
          style={styles.saveButton}
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
  keywordsContainer: {
    marginBottom: spacing.xl,
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