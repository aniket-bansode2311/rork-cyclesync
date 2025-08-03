import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Heart, Calendar, Plus, ArrowLeft, Droplets, Activity, Smile } from "lucide-react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import colors from "@/constants/colors";
import { usePregnancy } from "@/hooks/usePregnancy";

export default function PostpartumScreen() {
  const router = useRouter();
  const { 
    postpartumData,
    postpartumBleeding,
    postpartumRecovery,
    postpartumMoods,
    activatePostpartumMode,
    deactivatePostpartumMode,
    addPostpartumBleeding,
    addPostpartumRecovery,
    addPostpartumMood,
    getCurrentMode 
  } = usePregnancy();
  
  const [showActivationForm, setShowActivationForm] = useState<boolean>(false);
  const [showBleedingForm, setShowBleedingForm] = useState<boolean>(false);
  const [showRecoveryForm, setShowRecoveryForm] = useState<boolean>(false);
  const [showMoodForm, setShowMoodForm] = useState<boolean>(false);
  
  // Activation form state
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<'vaginal' | 'cesarean'>('vaginal');
  const [activationNotes, setActivationNotes] = useState<string>("");
  
  // Bleeding form state
  const [bleedingDate, setBleedingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bleedingIntensity, setBleedingIntensity] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [bleedingColor, setBleedingColor] = useState<'bright_red' | 'dark_red' | 'brown' | 'pink'>('bright_red');
  const [hasClots, setHasClots] = useState<boolean>(false);
  const [bleedingNotes, setBleedingNotes] = useState<string>("");
  
  // Recovery form state
  const [recoveryDate, setRecoveryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [recoveryCategory, setRecoveryCategory] = useState<'physical' | 'emotional' | 'breastfeeding' | 'sleep'>('physical');
  const [recoveryMilestone, setRecoveryMilestone] = useState<string>("");
  const [recoveryRating, setRecoveryRating] = useState<number>(3);
  const [recoveryNotes, setRecoveryNotes] = useState<string>("");
  
  // Mood form state
  const [moodDate, setMoodDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [overallMood, setOverallMood] = useState<'excellent' | 'good' | 'okay' | 'difficult' | 'very_difficult'>('okay');
  const [anxietyLevel, setAnxietyLevel] = useState<number>(1);
  const [sadnessLevel, setSadnessLevel] = useState<number>(1);
  const [overwhelmedLevel, setOverwhelmedLevel] = useState<number>(1);
  const [bondingLevel, setBondingLevel] = useState<number>(5);
  const [moodNotes, setMoodNotes] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentMode = getCurrentMode();
  const isPostpartumActive = currentMode === 'postpartum';

  const handleActivatePostpartum = async () => {
    if (!deliveryDate) {
      Alert.alert("Error", "Please provide the delivery date.");
      return;
    }

    try {
      setIsLoading(true);
      await activatePostpartumMode({
        deliveryDate,
        deliveryType,
        notes: activationNotes || undefined,
      });
      setShowActivationForm(false);
      resetActivationForm();
      Alert.alert("Success", "Postpartum mode activated! Welcome to your recovery journey.");
    } catch (error) {
      Alert.alert("Error", "Failed to activate postpartum mode. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivatePostpartum = () => {
    Alert.alert(
      "Deactivate Postpartum Mode",
      "Are you sure you want to deactivate postpartum mode? This will remove all postpartum data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await deactivatePostpartumMode();
              Alert.alert("Success", "Postpartum mode deactivated.");
            } catch (error) {
              Alert.alert("Error", "Failed to deactivate postpartum mode.");
            }
          },
        },
      ]
    );
  };

  const handleAddBleeding = async () => {
    try {
      await addPostpartumBleeding({
        date: bleedingDate,
        intensity: bleedingIntensity,
        color: bleedingColor,
        clots: hasClots,
        notes: bleedingNotes || undefined,
      });
      setShowBleedingForm(false);
      resetBleedingForm();
      Alert.alert("Success", "Bleeding entry added successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to add bleeding entry.");
    }
  };

  const handleAddRecovery = async () => {
    if (!recoveryMilestone.trim()) {
      Alert.alert("Error", "Please describe the recovery milestone.");
      return;
    }

    try {
      await addPostpartumRecovery({
        date: recoveryDate,
        category: recoveryCategory,
        milestone: recoveryMilestone,
        rating: recoveryRating,
        notes: recoveryNotes || undefined,
      });
      setShowRecoveryForm(false);
      resetRecoveryForm();
      Alert.alert("Success", "Recovery entry added successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to add recovery entry.");
    }
  };

  const handleAddMood = async () => {
    try {
      await addPostpartumMood({
        date: moodDate,
        mood: overallMood,
        anxiety: anxietyLevel,
        sadness: sadnessLevel,
        overwhelmed: overwhelmedLevel,
        bonding: bondingLevel,
        notes: moodNotes || undefined,
      });
      setShowMoodForm(false);
      resetMoodForm();
      Alert.alert("Success", "Mood entry added successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to add mood entry.");
    }
  };

  const resetActivationForm = () => {
    setDeliveryDate("");
    setDeliveryType('vaginal');
    setActivationNotes("");
  };

  const resetBleedingForm = () => {
    setBleedingDate(new Date().toISOString().split('T')[0]);
    setBleedingIntensity('moderate');
    setBleedingColor('bright_red');
    setHasClots(false);
    setBleedingNotes("");
  };

  const resetRecoveryForm = () => {
    setRecoveryDate(new Date().toISOString().split('T')[0]);
    setRecoveryCategory('physical');
    setRecoveryMilestone("");
    setRecoveryRating(3);
    setRecoveryNotes("");
  };

  const resetMoodForm = () => {
    setMoodDate(new Date().toISOString().split('T')[0]);
    setOverallMood('okay');
    setAnxietyLevel(1);
    setSadnessLevel(1);
    setOverwhelmedLevel(1);
    setBondingLevel(5);
    setMoodNotes("");
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysSinceDelivery = (): number => {
    if (!postpartumData?.deliveryDate) return 0;
    const today = new Date();
    const deliveryDate = new Date(postpartumData.deliveryDate);
    const diffTime = today.getTime() - deliveryDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getWeeksSinceDelivery = (): number => {
    return Math.floor(getDaysSinceDelivery() / 7);
  };

  const RatingSelector = ({ 
    value, 
    onChange, 
    label, 
    min = 1, 
    max = 5 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
    min?: number;
    max?: number;
  }) => (
    <View style={styles.ratingSelector}>
      <Text style={styles.ratingSelectorLabel}>{label}</Text>
      <View style={styles.ratingButtons}>
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              value === rating && styles.ratingButtonActive
            ]}
            onPress={() => onChange(rating)}
          >
            <Text style={[
              styles.ratingButtonText,
              value === rating && styles.ratingButtonTextActive
            ]}>
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Postpartum Tracking",
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
          headerLeft: () => (
            <Button
              title=""
              variant="text"
              size="small"
              onPress={() => router.back()}
              leftIcon={<ArrowLeft size={20} color={colors.primary} />}
            />
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {!isPostpartumActive && !showActivationForm && (
              <View style={styles.activationPrompt}>
                <Heart size={64} color={colors.primary} style={styles.icon} />
                <Text style={styles.title}>Postpartum Tracking</Text>
                <Text style={styles.description}>
                  Track your postpartum recovery journey, including bleeding, 
                  mood changes, and physical recovery milestones.
                </Text>
                <Button
                  title="Activate Postpartum Mode"
                  onPress={() => setShowActivationForm(true)}
                  style={styles.activateButton}
                  testID="activate-postpartum-button"
                />
              </View>
            )}

            {!isPostpartumActive && showActivationForm && (
              <View style={styles.activationForm}>
                <Text style={styles.formTitle}>Activate Postpartum Mode</Text>
                <Text style={styles.formDescription}>
                  Please provide your delivery information to start tracking your recovery.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Delivery Date</Text>
                  <Input
                    value={deliveryDate}
                    onChangeText={setDeliveryDate}
                    placeholder="YYYY-MM-DD"
                    testID="delivery-date-input"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Delivery Type</Text>
                  <View style={styles.deliveryTypeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.deliveryTypeButton,
                        deliveryType === 'vaginal' && styles.deliveryTypeButtonActive
                      ]}
                      onPress={() => setDeliveryType('vaginal')}
                    >
                      <Text style={[
                        styles.deliveryTypeButtonText,
                        deliveryType === 'vaginal' && styles.deliveryTypeButtonTextActive
                      ]}>
                        Vaginal
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.deliveryTypeButton,
                        deliveryType === 'cesarean' && styles.deliveryTypeButtonActive
                      ]}
                      onPress={() => setDeliveryType('cesarean')}
                    >
                      <Text style={[
                        styles.deliveryTypeButtonText,
                        deliveryType === 'cesarean' && styles.deliveryTypeButtonTextActive
                      ]}>
                        Cesarean
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <Input
                    value={activationNotes}
                    onChangeText={setActivationNotes}
                    placeholder="Any additional notes..."
                    multiline
                    testID="activation-notes-input"
                  />
                </View>

                <View style={styles.formActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setShowActivationForm(false)}
                    style={styles.cancelButton}
                  />
                  <Button
                    title="Activate"
                    onPress={handleActivatePostpartum}
                    isLoading={isLoading}
                    style={styles.submitButton}
                    testID="submit-activation-button"
                  />
                </View>
              </View>
            )}

            {isPostpartumActive && postpartumData && (
              <View style={styles.postpartumDashboard}>
                <View style={styles.postpartumHeader}>
                  <Heart size={32} color={colors.primary} />
                  <View style={styles.postpartumInfo}>
                    <Text style={styles.postpartumTitle}>
                      Week {getWeeksSinceDelivery()} Postpartum
                    </Text>
                    <Text style={styles.postpartumSubtitle}>
                      {getDaysSinceDelivery()} days since delivery
                    </Text>
                    <Text style={styles.deliveryText}>
                      {postpartumData.deliveryType === 'vaginal' ? 'Vaginal' : 'Cesarean'} delivery on {formatDate(postpartumData.deliveryDate)}
                    </Text>
                  </View>
                </View>

                <View style={styles.trackingActions}>
                  <Button
                    title="Log Bleeding"
                    onPress={() => setShowBleedingForm(true)}
                    leftIcon={<Droplets size={18} color={colors.white} />}
                    style={styles.trackingButton}
                    testID="log-bleeding-button"
                  />
                  <Button
                    title="Log Recovery"
                    variant="outline"
                    onPress={() => setShowRecoveryForm(true)}
                    leftIcon={<Activity size={18} color={colors.primary} />}
                    style={styles.trackingButton}
                    testID="log-recovery-button"
                  />
                  <Button
                    title="Log Mood"
                    variant="outline"
                    onPress={() => setShowMoodForm(true)}
                    leftIcon={<Smile size={18} color={colors.primary} />}
                    style={styles.trackingButton}
                    testID="log-mood-button"
                  />
                </View>

                {/* Recent Entries Summary */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Recent Entries</Text>
                  <View style={styles.summaryStats}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Bleeding Entries</Text>
                      <Text style={styles.summaryValue}>{postpartumBleeding.length}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Recovery Entries</Text>
                      <Text style={styles.summaryValue}>{postpartumRecovery.length}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Mood Entries</Text>
                      <Text style={styles.summaryValue}>{postpartumMoods.length}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Button
                    title="Deactivate"
                    variant="outline"
                    onPress={handleDeactivatePostpartum}
                    style={[styles.actionButton, styles.deactivateButton]}
                    testID="deactivate-postpartum-button"
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bleeding Form Modal */}
        {showBleedingForm && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Log Bleeding</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <Input
                  value={bleedingDate}
                  onChangeText={setBleedingDate}
                  placeholder="YYYY-MM-DD"
                  testID="bleeding-date-input"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Intensity</Text>
                <View style={styles.optionButtons}>
                  {(['light', 'moderate', 'heavy'] as const).map((intensity) => (
                    <TouchableOpacity
                      key={intensity}
                      style={[
                        styles.optionButton,
                        bleedingIntensity === intensity && styles.optionButtonActive
                      ]}
                      onPress={() => setBleedingIntensity(intensity)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        bleedingIntensity === intensity && styles.optionButtonTextActive
                      ]}>
                        {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Color</Text>
                <View style={styles.optionButtons}>
                  {(['bright_red', 'dark_red', 'brown', 'pink'] as const).map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.optionButton,
                        bleedingColor === color && styles.optionButtonActive
                      ]}
                      onPress={() => setBleedingColor(color)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        bleedingColor === color && styles.optionButtonTextActive
                      ]}>
                        {color.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setHasClots(!hasClots)}
                >
                  <View style={[styles.checkbox, hasClots && styles.checkboxChecked]}>
                    {hasClots && <Text style={styles.checkboxText}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Clots present</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <Input
                  value={bleedingNotes}
                  onChangeText={setBleedingNotes}
                  placeholder="Any additional notes..."
                  multiline
                  testID="bleeding-notes-input"
                />
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowBleedingForm(false)}
                  style={styles.modalCancelButton}
                />
                <Button
                  title="Save"
                  onPress={handleAddBleeding}
                  style={styles.modalSaveButton}
                  testID="save-bleeding-button"
                />
              </View>
            </View>
          </View>
        )}

        {/* Recovery Form Modal */}
        {showRecoveryForm && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Log Recovery</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <Input
                  value={recoveryDate}
                  onChangeText={setRecoveryDate}
                  placeholder="YYYY-MM-DD"
                  testID="recovery-date-input"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.optionButtons}>
                  {(['physical', 'emotional', 'breastfeeding', 'sleep'] as const).map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.optionButton,
                        recoveryCategory === category && styles.optionButtonActive
                      ]}
                      onPress={() => setRecoveryCategory(category)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        recoveryCategory === category && styles.optionButtonTextActive
                      ]}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Milestone</Text>
                <Input
                  value={recoveryMilestone}
                  onChangeText={setRecoveryMilestone}
                  placeholder="Describe the recovery milestone..."
                  testID="recovery-milestone-input"
                />
              </View>

              <RatingSelector
                value={recoveryRating}
                onChange={setRecoveryRating}
                label="How are you feeling? (1 = Poor, 5 = Excellent)"
              />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <Input
                  value={recoveryNotes}
                  onChangeText={setRecoveryNotes}
                  placeholder="Any additional notes..."
                  multiline
                  testID="recovery-notes-input"
                />
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowRecoveryForm(false)}
                  style={styles.modalCancelButton}
                />
                <Button
                  title="Save"
                  onPress={handleAddRecovery}
                  style={styles.modalSaveButton}
                  testID="save-recovery-button"
                />
              </View>
            </View>
          </View>
        )}

        {/* Mood Form Modal */}
        {showMoodForm && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Log Mood</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <Input
                  value={moodDate}
                  onChangeText={setMoodDate}
                  placeholder="YYYY-MM-DD"
                  testID="mood-date-input"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Overall Mood</Text>
                <View style={styles.optionButtons}>
                  {(['excellent', 'good', 'okay', 'difficult', 'very_difficult'] as const).map((mood) => (
                    <TouchableOpacity
                      key={mood}
                      style={[
                        styles.optionButton,
                        overallMood === mood && styles.optionButtonActive
                      ]}
                      onPress={() => setOverallMood(mood)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        overallMood === mood && styles.optionButtonTextActive
                      ]}>
                        {mood.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <RatingSelector
                value={anxietyLevel}
                onChange={setAnxietyLevel}
                label="Anxiety Level (1 = None, 5 = Severe)"
              />

              <RatingSelector
                value={sadnessLevel}
                onChange={setSadnessLevel}
                label="Sadness Level (1 = None, 5 = Severe)"
              />

              <RatingSelector
                value={overwhelmedLevel}
                onChange={setOverwhelmedLevel}
                label="Feeling Overwhelmed (1 = Not at all, 5 = Extremely)"
              />

              <RatingSelector
                value={bondingLevel}
                onChange={setBondingLevel}
                label="Bonding with Baby (1 = Struggling, 5 = Strong)"
              />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <Input
                  value={moodNotes}
                  onChangeText={setMoodNotes}
                  placeholder="Any additional notes..."
                  multiline
                  testID="mood-notes-input"
                />
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowMoodForm(false)}
                  style={styles.modalCancelButton}
                />
                <Button
                  title="Save"
                  onPress={handleAddMood}
                  style={styles.modalSaveButton}
                  testID="save-mood-button"
                />
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  activationPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 40,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  activateButton: {
    minWidth: 200,
  },
  activationForm: {
    flex: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 16,
    color: colors.gray[600],
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  deliveryTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deliveryTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  deliveryTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  deliveryTypeButtonText: {
    fontSize: 16,
    color: colors.gray[700],
    fontWeight: '500',
  },
  deliveryTypeButtonTextActive: {
    color: colors.white,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  postpartumDashboard: {
    flex: 1,
  },
  postpartumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postpartumInfo: {
    marginLeft: 16,
    flex: 1,
  },
  postpartumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
  },
  postpartumSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    marginTop: 4,
  },
  deliveryText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  trackingActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  trackingButton: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  deactivateButton: {
    borderColor: colors.error,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  optionButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: colors.white,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.black,
  },
  ratingSelector: {
    marginBottom: 20,
  },
  ratingSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  ratingButtonText: {
    fontSize: 16,
    color: colors.gray[700],
    fontWeight: '600',
  },
  ratingButtonTextActive: {
    color: colors.white,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalSaveButton: {
    flex: 1,
  },
});