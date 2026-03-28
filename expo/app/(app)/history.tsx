import { Stack } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

import { PeriodHistory } from "@/components/PeriodHistory";
import { PeriodModal } from "@/components/PeriodModal";
import colors from "@/constants/colors";
import { usePeriods } from "@/hooks/usePeriods";
import { Period } from "@/types/period";

export default function HistoryScreen() {
  const { periods, updatePeriod, deletePeriod } = usePeriods();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | undefined>();

  const handleEditPeriod = (period: Period) => {
    setEditingPeriod(period);
    setShowModal(true);
  };

  const handleSavePeriod = (periodData: Omit<Period, 'id'>) => {
    if (editingPeriod) {
      updatePeriod(editingPeriod.id, periodData);
    }
    setEditingPeriod(undefined);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setEditingPeriod(undefined);
    setShowModal(false);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Period History",
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }} 
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <PeriodHistory
            periods={periods}
            onEditPeriod={handleEditPeriod}
            onDeletePeriod={deletePeriod}
          />
        </View>

        <PeriodModal
          visible={showModal}
          onClose={handleCloseModal}
          onSave={handleSavePeriod}
          periods={periods}
          editingPeriod={editingPeriod}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});